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
    if (newUserId === userIdRef.current) return;

    console.log(`새 사용자 입장: ${newUserId}, localStream 상태:`, !!localStream);
    
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

    // localStream이 있을 때만 피어 연결 생성 (offer 생성)
    if (localStream) {
      console.log(`새 사용자와 피어 연결 생성 (offer): ${newUserId}`);
      
      // 직접 피어 연결 생성 (순환 참조 방지)
      const pc = new RTCPeerConnection(config);
      peerConnectionsRef.current.set(newUserId, pc);

      // 로컬 스트림 추가
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });

      // 원격 스트림 수신
      pc.ontrack = (event) => {
        console.log(`원격 스트림 수신: ${newUserId}`);
        const [stream] = event.streams;
        
        setRemoteUsers(prev => {
          const updated = new Map(prev);
          const user = updated.get(newUserId);
          if (user) {
            updated.set(newUserId, { ...user, stream });
          }
          return updated;
        });
      };

      // ICE candidate
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            targetUserId: newUserId,
            candidate: event.candidate
          }));
        }
      };

      // Offer 생성
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.send(JSON.stringify({
        type: 'offer',
        targetUserId: newUserId,
        offer: offer
      }));
    } else {
      console.log('localStream 없음 - 피어 연결 지연:', newUserId);
    }
  }, [localStream]);

  // 기존 사용자 목록 처리
  const handleRoomUsers = useCallback(async (users: string[]) => {
    console.log('기존 사용자들:', users, 'localStream 상태:', !!localStream);
    
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
        
        // localStream이 있을 때만 피어 연결 생성
        if (localStream) {
          console.log(`기존 사용자와 피어 연결 생성: ${existingUserId}`);
          
          // 직접 피어 연결 생성 (순환 참조 방지)
          const pc = new RTCPeerConnection(config);
          peerConnectionsRef.current.set(existingUserId, pc);

          // 로컬 스트림 추가
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });

          // 원격 스트림 수신
          pc.ontrack = (event) => {
            console.log(`원격 스트림 수신: ${existingUserId}`);
            const [stream] = event.streams;
            
            setRemoteUsers(prev => {
              const updated = new Map(prev);
              const user = updated.get(existingUserId);
              if (user) {
                updated.set(existingUserId, { ...user, stream });
              }
              return updated;
            });
          };

          // ICE candidate
          pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
              socketRef.current.send(JSON.stringify({
                type: 'ice-candidate',
                targetUserId: existingUserId,
                candidate: event.candidate
              }));
            }
          };
        } else {
          console.log('localStream 없음 - 피어 연결 지연:', existingUserId);
        }
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

  // localStream이 준비된 후 지연된 피어 연결 처리
  useEffect(() => {
    if (localStream && remoteUsers.size > 0) {
      console.log('localStream 준비됨 - 지연된 피어 연결 생성:', remoteUsers.size);
      
      // 기존 원격 사용자들과 피어 연결 생성
      Array.from(remoteUsers.keys()).forEach(async (userId) => {
        const pc = peerConnectionsRef.current.get(userId);
        if (!pc && localStream) {
          console.log(`지연된 피어 연결 생성: ${userId}`);
          
          // 피어 연결을 직접 여기서 생성 (createPeerConnection 호출하지 않음)
          const newPc = new RTCPeerConnection(config);
          peerConnectionsRef.current.set(userId, newPc);

          // 로컬 스트림 추가
          localStream.getTracks().forEach(track => {
            newPc.addTrack(track, localStream);
          });

          // 원격 스트림 수신
          newPc.ontrack = (event) => {
            console.log(`지연 연결 - 원격 스트림 수신: ${userId}`);
            const [stream] = event.streams;
            
            setRemoteUsers(prev => {
              const updated = new Map(prev);
              const user = updated.get(userId);
              if (user) {
                updated.set(userId, { ...user, stream });
              }
              return updated;
            });
          };

          // ICE candidate
          newPc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
              socketRef.current.send(JSON.stringify({
                type: 'ice-candidate',
                targetUserId: userId,
                candidate: event.candidate
              }));
            }
          };
        }
      });
    }
  }, [localStream, remoteUsers]);

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