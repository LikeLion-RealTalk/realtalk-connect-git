import { useState, useEffect, useCallback, useRef } from 'react';

interface WebRTCHookProps {
  roomId: string;
  username: string;
  isEnabled: boolean; // 화상회의 모드일 때만 활성화
}

interface RemoteUser {
  userId: string;
  username: string;
  stream?: MediaStream;
}

export const useWebRTC = ({ roomId, username, isEnabled }: WebRTCHookProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Map<string, RemoteUser>>(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'failed'>('disconnected');
  
  const socketRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const userIdRef = useRef<string>('');
  
  // WebRTC 설정
  const config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  // 로컬 미디어 스트림 초기화
  const initializeLocalStream = useCallback(async () => {
    if (!isEnabled) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('카메라/마이크 접근 실패:', error);
      throw error;
    }
  }, [isEnabled]);

  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    if (!isEnabled || !roomId || !username) {
      console.log('WebRTC 연결 조건 미충족:', { isEnabled, roomId, username });
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//api.realtalks.co.kr:8443/signal`;
    
    console.log('WebRTC WebSocket 연결 시도:', { wsUrl, roomId, username });
    
    socketRef.current = new WebSocket(wsUrl);
    userIdRef.current = `${username}-${Math.random().toString(36).substr(2, 5)}`;

    socketRef.current.onopen = () => {
      console.log('WebRTC WebSocket 연결됨');
      setConnectionStatus('connecting');
      
      const joinMessage = {
        type: 'join-room',
        roomId: roomId,
        userId: userIdRef.current
      };
      
      console.log('방 입장 메시지 전송:', joinMessage);
      
      // 방 입장 요청
      socketRef.current?.send(JSON.stringify(joinMessage));
    };

    socketRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log('WebRTC 메시지 수신:', data);

      switch (data.type) {
        case 'user-joined':
          await handleUserJoined(data.userId);
          break;
        case 'room-users':
          await handleRoomUsers(data.users);
          break;
        case 'user-left':
          handleUserLeft(data.userId);
          break;
        case 'offer':
          await handleOffer(data);
          break;
        case 'answer':
          await handleAnswer(data);
          break;
        case 'ice-candidate':
          await handleIceCandidate(data);
          break;
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebRTC WebSocket 오류:', error);
      setConnectionStatus('failed');
    };

    socketRef.current.onclose = () => {
      console.log('WebRTC WebSocket 연결 종료');
      setConnectionStatus('disconnected');
    };
  }, [isEnabled, roomId, username]);

  // 새 사용자 입장 처리
  const handleUserJoined = useCallback(async (newUserId: string) => {
    if (!localStream || newUserId === userIdRef.current) return;

    console.log(`새 사용자 입장: ${newUserId}`);
    
    setRemoteUsers(prev => {
      const updated = new Map(prev);
      if (!updated.has(newUserId)) {
        updated.set(newUserId, {
          userId: newUserId,
          username: newUserId.split('-')[0]
        });
      }
      return updated;
    });

    await createPeerConnection(newUserId, true);
  }, [localStream]);

  // 기존 사용자 목록 처리
  const handleRoomUsers = useCallback(async (users: string[]) => {
    if (!localStream) return;

    console.log('기존 사용자들:', users);
    
    for (const existingUserId of users) {
      if (existingUserId !== userIdRef.current) {
        setRemoteUsers(prev => {
          const updated = new Map(prev);
          if (!updated.has(existingUserId)) {
            updated.set(existingUserId, {
              userId: existingUserId,
              username: existingUserId.split('-')[0]
            });
          }
          return updated;
        });
        
        await createPeerConnection(existingUserId, false);
      }
    }

    if (users.length > 0) {
      setConnectionStatus('connected');
    }
  }, [localStream]);

  // 사용자 퇴장 처리
  const handleUserLeft = useCallback((leftUserId: string) => {
    console.log(`사용자 퇴장: ${leftUserId}`);
    
    const pc = peerConnectionsRef.current.get(leftUserId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(leftUserId);
    }

    setRemoteUsers(prev => {
      const updated = new Map(prev);
      updated.delete(leftUserId);
      return updated;
    });
  }, []);

  // 피어 연결 생성
  const createPeerConnection = useCallback(async (remoteUserId: string, shouldOffer: boolean) => {
    const currentLocalStream = localStream;
    if (!currentLocalStream) return;

    console.log(`피어 연결 생성: ${remoteUserId}, offer: ${shouldOffer}`);

    const pc = new RTCPeerConnection(config);
    peerConnectionsRef.current.set(remoteUserId, pc);

    // 로컬 스트림 추가
    currentLocalStream.getTracks().forEach(track => {
      pc.addTrack(track, currentLocalStream);
    });

    // 원격 스트림 수신
    pc.ontrack = (event) => {
      console.log(`원격 스트림 수신: ${remoteUserId}`);
      const [stream] = event.streams;
      
      setRemoteUsers(prev => {
        const updated = new Map(prev);
        const user = updated.get(remoteUserId);
        if (user) {
          updated.set(remoteUserId, { ...user, stream });
        }
        return updated;
      });
    };

    // ICE candidate
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          targetUserId: remoteUserId,
          candidate: event.candidate
        }));
      }
    };

    // 연결 상태 변경
    pc.onconnectionstatechange = () => {
      console.log(`연결 상태 (${remoteUserId}):`, pc.connectionState);
      if (pc.connectionState === 'connected') {
        setConnectionStatus('connected');
      }
    };

    // Offer 생성
    if (shouldOffer) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.send(JSON.stringify({
        type: 'offer',
        targetUserId: remoteUserId,
        offer: offer
      }));
    }
  }, []);

  // Offer 처리
  const handleOffer = useCallback(async (data: any) => {
    const pc = peerConnectionsRef.current.get(data.fromUserId);
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketRef.current?.send(JSON.stringify({
      type: 'answer',
      targetUserId: data.fromUserId,
      answer: answer
    }));
  }, []);

  // Answer 처리
  const handleAnswer = useCallback(async (data: any) => {
    const pc = peerConnectionsRef.current.get(data.fromUserId);
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
  }, []);

  // ICE Candidate 처리
  const handleIceCandidate = useCallback(async (data: any) => {
    const pc = peerConnectionsRef.current.get(data.fromUserId);
    if (!pc) return;

    try {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
      console.error('ICE candidate 오류:', error);
    }
  }, []);

  // 비디오 토글
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const newState = !isVideoEnabled;
        videoTrack.enabled = newState;
        setIsVideoEnabled(newState);
      }
    }
  }, [localStream, isVideoEnabled]);

  // 오디오 토글
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        const newState = !isAudioEnabled;
        audioTrack.enabled = newState;
        setIsAudioEnabled(newState);
      }
    }
  }, [localStream, isAudioEnabled]);

  // 연결 해제
  const disconnect = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setRemoteUsers(new Map());
    setConnectionStatus('disconnected');
  }, [localStream]);

  // 초기화
  useEffect(() => {
    if (isEnabled && roomId && username) {
      initializeLocalStream()
        .then((stream) => {
          if (stream) {
            connectWebSocket();
          }
        })
        .catch(console.error);
    }

    return () => {
      disconnect();
    };
  }, [isEnabled, roomId, username]);

  return {
    localStream,
    remoteUsers,
    isVideoEnabled,
    isAudioEnabled,
    connectionStatus,
    toggleVideo,
    toggleAudio,
    disconnect
  };
};