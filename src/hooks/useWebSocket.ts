import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketHookOptions {
  roomId?: string;
  onMessage?: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface JoinResponse {
  type: 'JOIN_ACCEPTED' | 'JOIN_REJECTED';
  reason?: string;
  role?: string;
  nonce?: string;
}

export const useWebSocket = (options: WebSocketHookOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const { roomId, onMessage, onConnect, onDisconnect } = options;

  const generateNonce = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const connect = useCallback(async (role: 'SPEAKER' | 'AUDIENCE' = 'AUDIENCE') => {
    if (clientRef.current?.connected || isConnecting) {
      return;
    }

    setIsConnecting(true);

    try {
      // 토큰 확보 (SPEAKER만 필수, AUDIENCE는 선택)
      const token = localStorage.getItem('access_token');
      if (role === 'SPEAKER' && !token) {
        throw new Error('No access token found for SPEAKER role');
      }

      // 헤더 단순화: Authorization만 사용, AUDIENCE는 토큰 없이도 연결
      const connectHeaders = (role === 'AUDIENCE') 
        ? {} 
        : (token ? { 'Authorization': `Bearer ${token}` } : {});

      const client = new Client({
        webSocketFactory: () => new SockJS('wss://api.realtalks.co.kr:8443/ws-stomp'),
        connectHeaders,
        debug: (str) => {
          console.log('[STOMP Debug]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        console.log('[웹소켓] STOMP 연결 성공:', frame);
        setIsConnected(true);
        setIsConnecting(false);
        onConnect?.();
      };

      client.onStompError = (frame) => {
        const msg = (frame && frame.headers && frame.headers.message) ? frame.headers.message : '알 수 없는 오류';
        console.error('[웹소켓][오류] STOMP 연결 실패:', { 메시지: msg, 원본: frame });
        setIsConnected(false);
        setIsConnecting(false);
      };

      client.onDisconnect = () => {
        console.log('[웹소켓] 연결 종료');
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();
      };

      clientRef.current = client;
      client.activate();

    } catch (error) {
      console.error('[웹소켓] 연결 실패:', error);
      setIsConnecting(false);
    }
  }, [isConnecting, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const subscribeToRoom = useCallback((roomId: string) => {
    if (!clientRef.current?.connected) {
      console.warn('WebSocket not connected');
      return null;
    }

    const subscription = clientRef.current.subscribe(
      `/sub/debate-room/${roomId}`,
      (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          console.log('[STOMP Message]', parsedMessage);
          onMessage?.(parsedMessage);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      }
    );

    return subscription;
  }, [onMessage]);

  const joinRoom = useCallback(async (roomId: string, role: 'SPEAKER' | 'AUDIENCE', side: 'A' | 'B'): Promise<JoinResponse | null> => {
    if (!clientRef.current?.connected) {
      console.warn('[웹소켓] 연결되지 않음');
      return null;
    }

    return new Promise((resolve) => {
      const nonce = generateNonce();
      console.log('[웹소켓] joinRoom 호출:', { 방ID: roomId, 역할: role, 사이드: side, nonce });
      
      // 방 구독 먼저 설정
      const roomSubscription = subscribeToRoom(roomId);
      const participantsSubscription = clientRef.current!.subscribe(
        `/sub/debate-room/${roomId}/participants`,
        (message) => {
          try {
            const participants = JSON.parse(message.body);
            console.log(`[웹소켓][참가자] 목록 수신:`, participants);
          } catch (error) {
            console.error('[웹소켓][참가자] JSON 파싱 실패:', error);
          }
        }
      );

      if (!roomSubscription || !participantsSubscription) {
        resolve(null);
        return;
      }

      // JOIN 응답 처리를 위한 임시 메시지 핸들러
      let responseReceived = false;
      const originalOnMessage = onMessage;
      const tempMessageHandler = (message: any) => {
        if (message.nonce === nonce && (message.type === 'JOIN_ACCEPTED' || message.type === 'JOIN_REJECTED')) {
          responseReceived = true;
          console.log('[웹소켓] JOIN 응답 수신:', message);
          resolve(message as JoinResponse);
          options.onMessage = originalOnMessage;
        } else {
          originalOnMessage?.(message);
        }
      };

      options.onMessage = tempMessageHandler;

      // 구독 완료 후 JOIN 메시지 전송 (타이밍 개선)
      setTimeout(() => {
        const joinPayload = { roomId, role, side, nonce };
        console.log('[웹소켓][송신] /pub/debate/join:', joinPayload);
        
        clientRef.current!.publish({
          destination: '/pub/debate/join',
          body: JSON.stringify(joinPayload)
        });
      }, 100); // 100ms 대기로 구독 완료 보장

      // 10초 타임아웃
      setTimeout(() => {
        if (!responseReceived) {
          console.warn('[웹소켓] JOIN 응답 타임아웃');
          resolve(null);
          options.onMessage = originalOnMessage;
        }
      }, 10000);
    });
  }, [subscribeToRoom, onMessage, options]);

  const sendMessage = useCallback((destination: string, body: any) => {
    if (!clientRef.current?.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    clientRef.current.publish({
      destination,
      body: JSON.stringify(body)
    });
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    subscribeToRoom,
    joinRoom,
    sendMessage
  };
};