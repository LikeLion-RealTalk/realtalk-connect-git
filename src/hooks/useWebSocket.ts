import { useState, useEffect, useCallback, useRef } from 'react';
// HTML과 동일한 방식으로 전역 변수 사용
declare global {
  interface Window {
    SockJS: any;
    Stomp: any;
  }
}

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
  const stompClientRef = useRef<any>(null);
  const roomSubRef = useRef<any>(null);
  const participantsSubRef = useRef<any>(null);
  const connectInFlightRef = useRef(false);
  
  const { onMessage, onConnect, onDisconnect } = options;

  // HTML 코드와 동일한 토큰 확보 함수
  const ensureAccessToken = useCallback(async ({ require = false } = {}) => {
    const isExpired = (t: string) => {
      try {
        const p = JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        const now = Math.floor(Date.now()/1000);
        return !p.exp || p.exp < now + 30;
      } catch { 
        return true; 
      }
    };

    let t = localStorage.getItem('access_token');
    if (t && !isExpired(t)) return t;

    if (!require) return null;

    try {
      const res = await fetch('/api/auth/token', { method:'POST', credentials:'include' });
      if (!res.ok) return null;
      const { accessToken } = await res.json();
      localStorage.setItem('access_token', accessToken);
      return accessToken;
    } catch {
      return null;
    }
  }, []);

  const connect = useCallback(async (role: 'SPEAKER' | 'AUDIENCE' = 'AUDIENCE') => {
    console.log('[웹소켓] connect 호출:', { role });
    
    if (connectInFlightRef.current) {
      console.warn('[웹소켓] 이미 연결 진행 중입니다. 중복 연결 차단.');
      return;
    }
    connectInFlightRef.current = true;
    setIsConnecting(true);

    try {
      // 이전 연결 정리
      if (roomSubRef.current) { 
        roomSubRef.current.unsubscribe(); 
        roomSubRef.current = null; 
      }
      if (participantsSubRef.current) { 
        participantsSubRef.current.unsubscribe(); 
        participantsSubRef.current = null; 
      }
      if (stompClientRef.current && stompClientRef.current.connected) {
        await new Promise(res => stompClientRef.current.disconnect(res));
      }

      // 토큰 확보
      const token = await ensureAccessToken({ require: role === 'SPEAKER' });
      
      if (token) {
        try {
          const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(b64));
          const expLocal = new Date(payload.exp * 1000).toLocaleString();
          console.log('[웹소켓] 토큰 확보:', { 길이: token.length, 만료시각_초: payload.exp, 만료시각_로컬: expLocal, 사용자: payload.sub });
        } catch (e) {
          console.warn('[웹소켓] 토큰 디코딩 실패:', e);
        }
      } else {
        console.warn('[웹소켓] 토큰 없음: 게스트로 시도합니다(AUDIENCE 허용 시)');
      }

      // HTML과 동일한 헤더 설정 (중복 헤더 포함)
      const connectHeaders = (role === 'AUDIENCE')
        ? {} 
        : (token ? { Authorization: 'Bearer ' + token, authorization: 'Bearer ' + token } : {});
      console.log('[웹소켓] CONNECT 헤더:', connectHeaders);

      // /ws-debate 엔드포인트로 연결
      const socket = new window.SockJS('/ws-debate');
      socket.onopen = () => console.log('[웹소켓] SockJS 연결 열림');
      socket.onclose = (e: any) => console.warn('[웹소켓] SockJS 연결 종료:', e);
      socket.onerror = (e: any) => console.error('[웹소켓] SockJS 오류:', e);

      stompClientRef.current = window.Stomp.over(socket);
      stompClientRef.current.debug = (msg: string) => console.log('[STOMP 디버그]', msg);
      stompClientRef.current.heartbeat.outgoing = 10000;
      stompClientRef.current.heartbeat.incoming = 10000;

      console.log('[웹소켓] STOMP connect 호출');
      stompClientRef.current.connect(
        connectHeaders,
        (frame: any) => {
          console.log('[웹소켓] STOMP 연결 성공:', frame);
          setIsConnected(true);
          setIsConnecting(false);
          connectInFlightRef.current = false;
          onConnect?.();
        },
        (err: any) => {
          const msg = (err && err.headers && err.headers.message) ? err.headers.message : '알 수 없는 오류';
          console.error('[웹소켓][오류] STOMP 연결 실패:', { 메시지: msg, 원본: err });
          setIsConnected(false);
          setIsConnecting(false);
          connectInFlightRef.current = false;
        }
      );

    } catch (error) {
      console.error('[웹소켓] 연결 실패:', error);
      setIsConnecting(false);
      connectInFlightRef.current = false;
    }
  }, [ensureAccessToken, onConnect]);

  const disconnect = useCallback(() => {
    try {
      if (roomSubRef.current) { 
        roomSubRef.current.unsubscribe(); 
        roomSubRef.current = null; 
      }
      if (participantsSubRef.current) { 
        participantsSubRef.current.unsubscribe(); 
        participantsSubRef.current = null; 
      }
    } catch (e) {
      console.warn('[웹소켓] 언서브 중 경고:', e);
    }

    if (!stompClientRef.current || !stompClientRef.current.connected) {
      setIsConnected(false);
      setIsConnecting(false);
      return;
    }

    stompClientRef.current.disconnect(() => {
      console.log('[웹소켓] 연결 종료');
      setIsConnected(false);
      setIsConnecting(false);
      onDisconnect?.();
    });
  }, [onDisconnect]);

  const joinRoom = useCallback(async (roomId: string, role: 'SPEAKER' | 'AUDIENCE', side: 'A' | 'B'): Promise<JoinResponse | null> => {
    console.log('[웹소켓] joinRoom 호출:', { 방ID: roomId, 역할: role, 사이드: side });
    
    if (!stompClientRef.current?.connected) {
      console.warn('[웹소켓] 연결되지 않음');
      return null;
    }

    return new Promise((resolve) => {
      const myJoinNonce = Math.random().toString(36).slice(2, 10);
      let selfInfoLocked = false;

      const topicRoom = `/sub/debate-room/${roomId}`;
      const topicParticipants = `/sub/debate-room/${roomId}/participants`;

      console.log('[웹소켓] 구독 시작1:', topicRoom);
      // HTML과 동일한 구독 방식
      roomSubRef.current = stompClientRef.current.subscribe(topicRoom, function (message: any) {
        let payload;
        try {
          payload = JSON.parse(message.body);
          console.log('payload:', payload);
        } catch (e) {
          console.error('[웹소켓][수신] JSON 파싱 실패:', e, message.body);
          return;
        }
        console.log('[웹소켓][수신] 방 브로드캐스트:', payload);

        if (payload.type === 'JOIN_ACCEPTED') {
          const isMineByNonce = payload.nonce && typeof myJoinNonce === 'string' && payload.nonce === myJoinNonce;
          const isFirstAccept = !selfInfoLocked;
          const isMyAccept = isMineByNonce || isFirstAccept;

          const { userId: acceptedUserId, userName, role: joinedRole, side: joinedSide } = payload;

          console.warn("isMineByNonce:", isMineByNonce);
          console.warn("isFirstAccept:", isFirstAccept);
          console.warn("isMyAccept:", isMyAccept);
          console.warn("selfInfoLocked:", selfInfoLocked);

          if (isMyAccept && !selfInfoLocked) {
            selfInfoLocked = true;
            console.log('[웹소켓] 참가 승인 수신: UI 갱신 완료');
            console.log('[웹소켓] 참가 승인 수신(내 것):', { acceptedUserId, userName, joinedRole, joinedSide, nonce: payload.nonce });
            resolve(payload as JoinResponse);
          } else {
            console.log('[웹소켓] 참가 승인 수신(다른 사람): UI 갱신 생략', { acceptedUserId, userName, joinedRole, joinedSide, nonce: payload.nonce });
          }
        }

        if (payload.type === 'JOIN_REJECTED') {
          const mine = payload.nonce && payload.nonce === myJoinNonce;
          if (!mine) return;
          console.warn('[웹소켓] 참가 거절(내 요청):', payload);
          resolve(payload as JoinResponse);
        }

        // 다른 메시지들도 전달
        onMessage?.(payload);
      });

      console.log('[웹소켓] 구독 시작2:', topicParticipants);
      participantsSubRef.current = stompClientRef.current.subscribe(topicParticipants, function (message: any) {
        let participants;
        try {
          participants = JSON.parse(message.body);
        } catch (e) {
          console.error('[웹소켓][참가자] JSON 파싱 실패:', e, message.body);
          return;
        }
        const count = Array.isArray(participants) ? participants.length : '알수없음';
        console.log(`[웹소켓][참가자] 목록 수신(${count}명):`, participants);
      });

      // HTML과 동일한 타이밍: 구독 완료 후 100ms 대기하고 JOIN 메시지 전송
      setTimeout(() => {
        const joinPayload = { roomId, role, side, nonce: myJoinNonce };
        console.log('[웹소켓][송신] /pub/debate/join:', joinPayload);
        stompClientRef.current.send('/pub/debate/join', {}, JSON.stringify(joinPayload));
      }, 100);

      // 10초 타임아웃
      setTimeout(() => {
        console.warn('[웹소켓] JOIN 응답 타임아웃');
        resolve(null);
      }, 10000);
    });
  }, [onMessage]);

  const sendMessage = useCallback((destination: string, body: any) => {
    if (!stompClientRef.current?.connected) {
      console.warn('[웹소켓] 연결되지 않음');
      return;
    }

    stompClientRef.current.send(destination, {}, JSON.stringify(body));
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
    joinRoom,
    sendMessage
  };
};