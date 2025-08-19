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
  onParticipantsUpdate?: (participants: any[]) => void;
}

interface JoinResponse {
  type: 'JOIN_ACCEPTED' | 'JOIN_REJECTED';
  reason?: string;
  role?: string;
  nonce?: string;
}

// 전역 웹소켓 인스턴스 (싱글톤)
let globalStompClient: any = null;
let globalRoomSub: any = null;
let globalParticipantsSub: any = null;
let globalExpireSub: any = null;
let globalSpeakerExpireSub: any = null;
let globalSpeakerSub: any = null;
let globalSideStatsSub: any = null;
let globalIsConnected = false;
let globalIsConnecting = false;
let globalConnectInFlight = false;

// 전역 콜백들
let globalMessageCallbacks: ((message: any) => void)[] = [];
let globalConnectCallbacks: (() => void)[] = [];
let globalDisconnectCallbacks: (() => void)[] = [];
let globalParticipantsCallbacks: ((participants: any[]) => void)[] = [];

export const useWebSocket = (options: WebSocketHookOptions = {}) => {
  const [isConnected, setIsConnected] = useState(globalIsConnected);
  const [isConnecting, setIsConnecting] = useState(globalIsConnecting);
  
  const { onMessage, onConnect, onDisconnect, onParticipantsUpdate } = options;

  // 컴포넌트 마운트 시 콜백 등록
  useEffect(() => {
    if (onMessage) {
      globalMessageCallbacks.push(onMessage);
    }
    if (onConnect) {
      globalConnectCallbacks.push(onConnect);
    }
    if (onDisconnect) {
      globalDisconnectCallbacks.push(onDisconnect);
    }
    if (onParticipantsUpdate) {
      globalParticipantsCallbacks.push(onParticipantsUpdate);
    }

    // 컴포넌트 언마운트 시 콜백 제거
    return () => {
      if (onMessage) {
        globalMessageCallbacks = globalMessageCallbacks.filter(cb => cb !== onMessage);
      }
      if (onConnect) {
        globalConnectCallbacks = globalConnectCallbacks.filter(cb => cb !== onConnect);
      }
      if (onDisconnect) {
        globalDisconnectCallbacks = globalDisconnectCallbacks.filter(cb => cb !== onDisconnect);
      }
      if (onParticipantsUpdate) {
        globalParticipantsCallbacks = globalParticipantsCallbacks.filter(cb => cb !== onParticipantsUpdate);
      }
    };
  }, [onMessage, onConnect, onDisconnect, onParticipantsUpdate]);

  // 전역 상태 변경 시 로컬 상태 업데이트
  useEffect(() => {
    setIsConnected(globalIsConnected);
    setIsConnecting(globalIsConnecting);
  }, []);

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

  const connect = useCallback(async (role: 'SPEAKER' | 'AUDIENCE' = 'AUDIENCE'): Promise<boolean> => {
    console.log('[웹소켓] connect 호출:', { role });
    
    if (globalConnectInFlight) {
      console.warn('[웹소켓] 이미 연결 진행 중입니다. 중복 연결 차단.');
      return false;
    }
    globalConnectInFlight = true;
    globalIsConnecting = true;
    setIsConnecting(true);

    try {
      // 방 입장 시 무조건 기존 연결 정리
      if (globalRoomSub) { 
        globalRoomSub.unsubscribe(); 
        globalRoomSub = null; 
      }
      if (globalParticipantsSub) { 
        globalParticipantsSub.unsubscribe(); 
        globalParticipantsSub = null; 
      }
      if (globalExpireSub) { 
        globalExpireSub.unsubscribe(); 
        globalExpireSub = null; 
      }
      if (globalSpeakerExpireSub) { 
        globalSpeakerExpireSub.unsubscribe(); 
        globalSpeakerExpireSub = null; 
      }
      if (globalSpeakerSub) { 
        globalSpeakerSub.unsubscribe(); 
        globalSpeakerSub = null; 
      }
      if (globalStompClient && globalStompClient.connected) {
        await new Promise(res => globalStompClient.disconnect(res));
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

      // API 서버로 웹소켓 연결
      const socket = new window.SockJS('https://api.realtalks.co.kr:8443/ws-debate');
      socket.onopen = () => console.log('[웹소켓] SockJS 연결 열림');
      socket.onclose = (e: any) => console.warn('[웹소켓] SockJS 연결 종료:', e);
      socket.onerror = (e: any) => console.error('[웹소켓] SockJS 오류:', e);

      globalStompClient = window.Stomp.over(socket);
      globalStompClient.debug = (msg: string) => {
        console.log('[STOMP 디버그]', msg);
        // participants 메시지 특별 디버깅
        if (msg.includes('/participants') && msg.includes('MESSAGE')) {
          console.log('[STOMP 특별] participants 메시지 감지:', msg);
        }
      };
      globalStompClient.heartbeat.outgoing = 10000;
      globalStompClient.heartbeat.incoming = 10000;

      console.log('[웹소켓] STOMP connect 호출');
      
      return new Promise((resolve) => {
        globalStompClient.connect(
          connectHeaders,
          (frame: any) => {
            console.log('[웹소켓] STOMP 연결 성공:', frame);
            globalIsConnected = true;
            globalIsConnecting = false;
            globalConnectInFlight = false;
            setIsConnected(true);
            setIsConnecting(false);
            // 모든 컴포넌트의 onConnect 콜백 호출
            globalConnectCallbacks.forEach(cb => cb());
            resolve(true);
          },
          (err: any) => {
            const msg = (err && err.headers && err.headers.message) ? err.headers.message : '알 수 없는 오류';
            console.error('[웹소켓][오류] STOMP 연결 실패:', { 메시지: msg, 원본: err });
            globalIsConnected = false;
            globalIsConnecting = false;
            globalConnectInFlight = false;
            setIsConnected(false);
            setIsConnecting(false);
            resolve(false);
          }
        );
      });

    } catch (error) {
      console.error('[웹소켓] 연결 실패:', error);
      globalIsConnecting = false;
      globalConnectInFlight = false;
      setIsConnecting(false);
      return false;
    }
  }, [ensureAccessToken]);

  const disconnect = useCallback(() => {
    try {
      if (globalRoomSub) { 
        globalRoomSub.unsubscribe(); 
        globalRoomSub = null; 
      }
      if (globalParticipantsSub) { 
        globalParticipantsSub.unsubscribe(); 
        globalParticipantsSub = null; 
      }
      if (globalExpireSub) { 
        globalExpireSub.unsubscribe(); 
        globalExpireSub = null; 
      }
      if (globalSpeakerExpireSub) { 
        globalSpeakerExpireSub.unsubscribe(); 
        globalSpeakerExpireSub = null; 
      }
      if (globalSpeakerSub) { 
        globalSpeakerSub.unsubscribe(); 
        globalSpeakerSub = null; 
      }
      if (globalSideStatsSub) { 
        globalSideStatsSub.unsubscribe(); 
        globalSideStatsSub = null; 
      }
    } catch (e) {
      console.warn('[웹소켓] 언서브 중 경고:', e);
    }

    if (!globalStompClient || !globalStompClient.connected) {
      globalIsConnected = false;
      globalIsConnecting = false;
      setIsConnected(false);
      setIsConnecting(false);
      return;
    }

    globalStompClient.disconnect(() => {
      console.log('[웹소켓] 연결 종료');
      globalIsConnected = false;
      globalIsConnecting = false;
      setIsConnected(false);
      setIsConnecting(false);
      // 모든 컴포넌트의 onDisconnect 콜백 호출
      globalDisconnectCallbacks.forEach(cb => cb());
    });
  }, []);

  const joinRoom = useCallback(async (roomId: string, role: 'SPEAKER' | 'AUDIENCE', side: 'A' | 'B'): Promise<JoinResponse | null> => {
    console.log('[웹소켓] joinRoom 호출:', { 방ID: roomId, 역할: role, 사이드: side });
    
    if (!globalStompClient?.connected) {
      console.warn('[웹소켓] 연결되지 않음');
      return null;
    }

    // 기존 방 구독이 있다면 정리 (중복 구독 방지)
    if (globalRoomSub) { 
      console.log('[웹소켓] 기존 방 구독 정리');
      globalRoomSub.unsubscribe(); 
      globalRoomSub = null; 
    }
    if (globalParticipantsSub) { 
      console.log('[웹소켓] 기존 참가자 구독 정리');
      globalParticipantsSub.unsubscribe(); 
      globalParticipantsSub = null; 
    }
    if (globalSpeakerSub) { 
      console.log('[웹소켓] 기존 발언자 구독 정리');
      globalSpeakerSub.unsubscribe(); 
      globalSpeakerSub = null; 
    }
    if (globalSideStatsSub) { 
      console.log('[웹소켓] 기존 사이드 통계 구독 정리');
      globalSideStatsSub.unsubscribe(); 
      globalSideStatsSub = null; 
    }

    return new Promise((resolve) => {
      const myJoinNonce = Math.random().toString(36).slice(2, 10);
      let selfInfoLocked = false;

      const topicRoom = `/sub/debate-room/${roomId}`;
      const topicParticipants = `/sub/debate-room/${roomId}/participants`;

      console.log('[웹소켓] 구독 시작1:', topicRoom);
      // HTML과 동일한 구독 방식
      globalRoomSub = globalStompClient.subscribe(topicRoom, function (message: any) {
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

        // 다른 메시지들을 모든 컴포넌트에 전달
        globalMessageCallbacks.forEach(cb => cb(payload));
      });

      console.log('[웹소켓] 구독 시작2:', topicParticipants);
      globalParticipantsSub = globalStompClient.subscribe(topicParticipants, function (message: any) {
        let participants;
        try {
          participants = JSON.parse(message.body);
        } catch (e) {
          console.error('[웹소켓][참가자] JSON 파싱 실패:', e, message.body);
          return;
        }
        const count = Array.isArray(participants) ? participants.length : '알수없음';
        console.log(`[웹소켓][참가자] 목록 수신(${count}명):`, participants);
        
        // 참가자 목록을 모든 컴포넌트에 전달
        if (Array.isArray(participants)) {
          console.log(`[웹소켓][참가자] 콜백 개수: ${globalParticipantsCallbacks.length}개`);
          globalParticipantsCallbacks.forEach(cb => cb(participants));
        }
      });

      const topicSpeaker = `/topic/speaker/${roomId}`;
      console.log('[웹소켓] 구독 시작3:', topicSpeaker);
      globalSpeakerSub = globalStompClient.subscribe(topicSpeaker, function (message: any) {
        let payload;
        try {
          payload = JSON.parse(message.body);
        } catch (e) {
          console.error('[웹소켓][발언자] JSON 파싱 실패:', e, message.body);
          return;
        }
        console.log('[웹소켓][발언자] 메시지 수신:', payload);
        
        // 발언자 메시지를 모든 컴포넌트에 전달
        globalMessageCallbacks.forEach(cb => cb(payload));
      });

      const topicSideStats = `/sub/debate-room/${roomId}/side-stats`;
      console.log('[웹소켓] 구독 시작4:', topicSideStats);
      globalSideStatsSub = globalStompClient.subscribe(topicSideStats, function (message: any) {
        let payload;
        try {
          payload = JSON.parse(message.body);
        } catch (e) {
          console.error('[웹소켓][사이드 통계] JSON 파싱 실패:', e, message.body);
          return;
        }
        console.log('[웹소켓][사이드 통계] 메시지 수신:', payload);
        
        // 사이드 통계 메시지를 모든 컴포넌트에 전달
        globalMessageCallbacks.forEach(cb => cb(payload));
      });

      // HTML과 동일한 타이밍: 구독 완료 후 100ms 대기하고 JOIN 메시지 전송
      setTimeout(() => {
        const joinPayload = { roomId, role, side, nonce: myJoinNonce };
        console.log('[웹소켓][송신] /pub/debate/join:', joinPayload);
        globalStompClient.send('/pub/debate/join', {}, JSON.stringify(joinPayload));
      }, 100);

      // 10초 타임아웃
      setTimeout(() => {
        console.warn('[웹소켓] JOIN 응답 타임아웃');
        resolve(null);
      }, 10000);
    });
  }, []);

  const sendMessage = useCallback((destination: string, body: any) => {
    if (!globalStompClient?.connected) {
      console.warn('[웹소켓] 연결되지 않음');
      return;
    }

    globalStompClient.send(destination, {}, JSON.stringify(body));
  }, []);

  const sendChatMessage = useCallback(async (roomId: string, message: string): Promise<boolean> => {
    if (!globalStompClient || !globalStompClient.connected) {
      console.error('[채팅] STOMP 클라이언트가 연결되지 않았습니다');
      return false;
    }

    try {
      const chatData = {
        roomId: roomId,
        message: message
      };

      console.log('[채팅] 메시지 전송:', chatData);
      
      globalStompClient.send(
        '/pub/chat/message',
        {},
        JSON.stringify(chatData)
      );
      
      return true;
    } catch (error) {
      console.error('[채팅] 메시지 전송 실패:', error);
      return false;
    }
  }, []);

  const subscribeExpire = useCallback((roomId: string, onExpireMessage: (data: { debateExpireTime: string }) => void) => {
    if (!globalStompClient?.connected) {
      console.warn('[웹소켓] 연결되지 않음');
      return;
    }

    // 기존 expire 구독이 있다면 정리
    if (globalExpireSub) {
      globalExpireSub.unsubscribe();
      globalExpireSub = null;
    }

    const topicExpire = `/topic/debate/${roomId}/expire`;
    console.log('[웹소켓] expire 구독 시작:', topicExpire);
    
    globalExpireSub = globalStompClient.subscribe(topicExpire, function (message: any) {
      let payload;
      try {
        payload = JSON.parse(message.body);
        console.log('[웹소켓][expire] 만료시간 수신:', payload);
      } catch (e) {
        console.error('[웹소켓][expire] JSON 파싱 실패:', e, message.body);
        return;
      }

      // 만료시간 콜백 호출
      if (payload.debateExpireTime) {
        onExpireMessage(payload);
      }
    });
  }, []);

  const subscribeSpeakerExpire = useCallback((roomUUID: string, onSpeakerExpireMessage: (data: { speakerExpireTime: string, currentUserId: string }) => void) => {
    if (!globalStompClient?.connected) {
      console.warn('[웹소켓] 연결되지 않음');
      return;
    }

    // 기존 speaker expire 구독이 있다면 정리
    if (globalSpeakerExpireSub) {
      globalSpeakerExpireSub.unsubscribe();
      globalSpeakerExpireSub = null;
    }

    const topicSpeakerExpire = `/topic/speaker/${roomUUID}/expire`;
    console.log('[웹소켓] speaker expire 구독 시작:', topicSpeakerExpire);
    
    globalSpeakerExpireSub = globalStompClient.subscribe(topicSpeakerExpire, function (message: any) {
      let payload;
      try {
        payload = JSON.parse(message.body);
        console.log('[웹소켓][speaker expire] 발언자 만료시간 수신:', payload);
      } catch (e) {
        console.error('[웹소켓][speaker expire] JSON 파싱 실패:', e, message.body);
        return;
      }

      // 발언자 만료시간 콜백 호출
      if (payload.speakerExpireTime && payload.currentUserId) {
        onSpeakerExpireMessage(payload);
      }
    });
  }, []);


  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    joinRoom,
    sendMessage,
    sendChatMessage,
    subscribeExpire,
    subscribeSpeakerExpire
  };
};