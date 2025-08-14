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

  const connect = useCallback(async () => {
    if (clientRef.current?.connected || isConnecting) {
      return;
    }

    setIsConnecting(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const client = new Client({
        webSocketFactory: () => new SockJS('wss://api.realtalks.co.kr:8443/ws-stomp'),
        connectHeaders: {
          'Authorization': `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('[STOMP Debug]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        console.log('Connected: ' + frame);
        setIsConnected(true);
        setIsConnecting(false);
        onConnect?.();
      };

      client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        setIsConnected(false);
        setIsConnecting(false);
      };

      client.onDisconnect = () => {
        console.log('Disconnected');
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();
      };

      clientRef.current = client;
      client.activate();

    } catch (error) {
      console.error('Failed to connect:', error);
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
      console.warn('WebSocket not connected');
      return null;
    }

    return new Promise((resolve) => {
      const nonce = generateNonce();
      
      // Subscribe to room first to receive the response
      const subscription = subscribeToRoom(roomId);
      if (!subscription) {
        resolve(null);
        return;
      }

      // Set up message handler for join response
      const originalOnMessage = onMessage;
      const tempMessageHandler = (message: any) => {
        if (message.nonce === nonce && (message.type === 'JOIN_ACCEPTED' || message.type === 'JOIN_REJECTED')) {
          resolve(message as JoinResponse);
          // Restore original message handler
          if (originalOnMessage) {
            // Re-subscribe with original handler
            subscription.unsubscribe();
            subscribeToRoom(roomId);
          }
        } else {
          originalOnMessage?.(message);
        }
      };

      // Temporarily override message handler
      options.onMessage = tempMessageHandler;

      const joinPayload = {
        roomId,
        role,
        side,
        nonce
      };

      console.log('[STOMP Send] Join request:', joinPayload);
      clientRef.current!.publish({
        destination: '/pub/debate/join',
        body: JSON.stringify(joinPayload)
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        resolve(null);
        options.onMessage = originalOnMessage;
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