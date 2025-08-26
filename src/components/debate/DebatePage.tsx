import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../UserProvider';
import { DebateHeader } from './DebateHeader';
import { SpeakersSidebar } from './SpeakersSidebar';
import { DebateInfo } from './DebateInfo';
import { CurrentSpeaker } from './CurrentSpeaker';
import { PositionSelector } from './PositionSelector';
import { SpeechContent, SpeechContentBody } from './SpeechContent';
import { SpeechInput } from './SpeechInput';
import { AISummary, AISummaryBody } from './AISummary';
import { ChatSection, ChatSectionBody } from './ChatSection';
import { DebateScrollButtons } from './DebateScrollButtons';

import { ShareRoomModal } from './modal/ShareRoomModal';
import { DebateExtensionModal } from './modal/DebateExtensionModal';
import { DebateExitConfirmModal } from './modal/DebateExitConfirmModal';
import { SpeakerNotificationModal } from '../modal/SpeakerNotificationModal';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Menu, Users } from 'lucide-react';
import { DebateRoomInfo } from '../../mock/debateRooms';
import { MOCK_SPEAKERS, Speaker } from '../../mock/speakers';
import { MOCK_CHAT_MESSAGES, ChatMessage } from '../../mock/chatMessages';
import { MOCK_DEBATE_SUMMARIES } from '../../mock/debateSummaries';
import { useWebSocket, getSpeechWebSocket } from '../../hooks/useWebSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import { AiDebateSummaryModal } from '../modal/AiDebateSummaryModal';
import { AiSummaryLoadingModal } from '../modal/AiSummaryLoadingModal';
import { Position, ParticipationRole, SpeechInputType, PARTICIPATION_ROLES, POSITIONS, SPEECH_INPUT_TYPES } from '../../types/discussion';
import { toast } from "sonner";
import { debateApi } from '../../lib/api/apiClient';

interface DebatePageProps {
  onNavigate?: (page: 'landing' | 'browser' | 'debate') => void;
  onGoBack?: () => void;
  debateRoomInfo: DebateRoomInfo;
}

export function DebatePage({ onNavigate, onGoBack, debateRoomInfo }: DebatePageProps) {
  const { nickname, isLoggedIn, user } = useUser();
  const [debateSummary, setDebateSummary] = useState(null);
  
  // 화상회의 모드 판별 (토론방 제목으로만 구분)
  const urlParams = new URLSearchParams(window.location.search);
  const isVideoMode = debateRoomInfo.title.startsWith('video-');
  const videoRoomId = urlParams.get('room') || (debateRoomInfo.title.startsWith('video-') ? debateRoomInfo.title.replace('video-', '') : null);
  const videoUsername = urlParams.get('name') || user?.name || user?.email || 'User';
  
  console.log('WebRTC 초기화 파라미터:', {
    isVideoMode,
    videoRoomId,
    videoUsername,
    debateRoomTitle: debateRoomInfo.title
  });
  
  // WebRTC Hook 초기화 (화상회의 모드일 때만)
  const {
    localStream,
    remoteUsers,
    isVideoEnabled,
    isAudioEnabled,
    connectionStatus,
    toggleVideo,
    toggleAudio,
    disconnect: disconnectWebRTC
  } = useWebRTC({
    roomId: videoRoomId || '',
    username: videoUsername,
    isEnabled: isVideoMode
  });
  
  // 웹소켓 훅 초기화
  const { sendChatMessage, sendMessage, isConnected, isSpeechConnected, connectSpeechWebSocket, subscribeExpire, subscribeSpeakerExpire, joinRoom, disconnect } = useWebSocket({
    onMessage: (message) => {
      // STOMP 메시지 처리
      if (message.type === 'CHAT') {
        // 채팅 메시지 수신
        const newChatMessage: ChatMessage = {
          id: `chat-${Date.now()}-${Math.random()}`,
          userName: message.userName,
          message: message.message,
          timestamp: new Date(message.timestamp),
          userPosition: message.side === 'A' ? POSITIONS[0] : POSITIONS[1],
          isSpeaker: message.role === 'SPEAKER'
        };
        
        console.log('[채팅] 메시지 수신:', newChatMessage);
        setChatMessages(prev => [...prev, newChatMessage]);
      } else if (message.message && message.username) {
        // /topic/speaker 발언 메시지 수신
        console.log('[발언] 원본 웹소켓 메시지:', message);
        console.log('[발언] side 값:', message.side);
        console.log('[발언] POSITIONS 배열:', POSITIONS);
        
        const newSpeechMessage = {
          id: `speech-${Date.now()}-${Math.random()}`,
          speakerName: message.username,
          position: message.side === 'A' ? POSITIONS[0] : POSITIONS[1],
          content: message.message,
          timestamp: new Date(), // 수신 시점으로 설정
          factCheck: message.verificationResult ? {
            result: message.verificationResult,
            explanation: message.evidence || '',
            sourceLinks: message.sourceLinks || []
          } : undefined
        };
        
        console.log('[발언] 매핑된 position:', newSpeechMessage.position);
        console.log('[발언] A입장인가?', newSpeechMessage.position === POSITIONS[0]);
        console.log('[발언] B입장인가?', newSpeechMessage.position === POSITIONS[1]);
        console.log('[발언] 메시지 수신:', newSpeechMessage);
        setSpeechMessages(prev => [...prev, newSpeechMessage]);
      } else if (message.countA !== undefined && message.countB !== undefined && message.percentA !== undefined && message.percentB !== undefined) {
        // /sub/debate-room/{roomUUID}/side-stats 메시지 수신
        console.log('[사이드 통계] 메시지 수신:', message);
        setSideStats({ percentA: message.percentA, percentB: message.percentB });
      } else if (message.summary && message.username && message.userId !== undefined) {
        // /topic/ai/{roomUUID} AI 요약 메시지 수신
        console.log('[AI 요약] 메시지 수신:', message);
        
        // 현재 참가자 목록에서 해당 사용자 찾기 (입장 정보를 얻기 위함)
        const targetUser = speakers.find(speaker => speaker.id === message.userId.toString());
        const userPosition = targetUser ? targetUser.position : POSITIONS[0]; // 기본값은 A입장
        
        const newAiSummary = {
          id: `ai-summary-${Date.now()}-${Math.random()}`,
          speakerName: message.username,
          position: userPosition,
          summary: message.summary,
          timestamp: new Date()
        };
        
        console.log('[AI 요약] 새 요약 생성:', newAiSummary);
        setAiSummaries(prev => [...prev, newAiSummary]);
      }
    },
    onParticipantsUpdate: (participants) => {
      console.log('[참가자] 목록 업데이트:', participants);
      handleParticipantsUpdate(participants);
    }
  });
  // 참여 모드: 입장 시 선택한 역할에 따라 결정 (토글 불가)
  const participationMode: ParticipationRole = debateRoomInfo.userRole === 'SPEAKER' ? PARTICIPATION_ROLES[0] : PARTICIPATION_ROLES[1];
  const [currentPosition, setCurrentPosition] = useState<Position | null>(() => {
    // JoinDiscussionModal에서 선택한 입장을 바로 사용
    if (debateRoomInfo.userSelectedSide) {
      return debateRoomInfo.userSelectedSide === 'A' ? POSITIONS[0] : POSITIONS[1];
    }
    return debateRoomInfo.userPosition || null;
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [hasShownExtensionModal, setHasShownExtensionModal] = useState(false);
  const [isDebateFinished, setIsDebateFinished] = useState(false);
  const [isAiSummaryLoadingOpen, setIsAiSummaryLoadingOpen] = useState(false);
  const [isAiSummaryModalOpen, setIsAiSummaryModalOpen] = useState(false);
  const [isExitConfirmModalOpen, setIsExitConfirmModalOpen] = useState(false);
  const [hasEnteredRoom, setHasEnteredRoom] = useState(false);
  const [isSpeakerNotificationOpen, setIsSpeakerNotificationOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [roomStatus, setRoomStatus] = useState<string>('waiting');
  const [aiSummaryHeight, setAiSummaryHeight] = useState(260); // AI 요약 섹션 높이 상태
  const [sideA, setSideA] = useState<string>('A입장');
  const [sideB, setSideB] = useState<string>('B입장');
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [currentSpeakerTimeLeft, setCurrentSpeakerTimeLeft] = useState<number | null>(null);
  const [debateTimeLeft, setDebateTimeLeft] = useState(5 * 60); // 5분을 초 단위로
  const [debateStartTime, setDebateStartTime] = useState<Date | null>(new Date('2025-08-09T23:15:00')); // 토론 시작 시간 고정
  const [isDebateStarted, setIsDebateStarted] = useState(false);
  const [debateExpireTime, setDebateExpireTime] = useState<Date | null>(null); // 토론 만료 시간
  const [expireTimeDisplay, setExpireTimeDisplay] = useState<string>('--'); // 만료시간 표시용
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // 현재 발언자 ID
  const [previousUserId, setPreviousUserId] = useState<string | null>(null); // 이전 발언자 ID (모달 트리거용)
  const [speakerExpireTime, setSpeakerExpireTime] = useState<Date | null>(null); // 발언자 만료 시간
  const [currentDebateStage, setCurrentDebateStage] = useState<'1. 발언' | '2. 논의'>('1. 발언'); // 현재 토론 단계
  const [maxSpeakerTime, setMaxSpeakerTime] = useState(30); // 발언 시간 총 길이
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false); // 발언 처리 중 상태 (1.5초 비활성화)
  const [userSubjectId, setUserSubjectId] = useState<string | null>(null); // JOIN_ACCEPTED에서 받은 subjectId
  
  // debateType에 따른 논의 시간 계산 함수
  const getDiscussionTime = () => {
    return debateRoomInfo.debateType === '일반토론' ? 300 : 30; // NORMAL: 5분(300초), FAST: 30초
  };
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expireTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speakerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 발언자 목록 상태 관리 (서버에서 받은 데이터로 업데이트됨)
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  
  // 사이드 통계 상태 (초기값 50% 50%)
  const [sideStats, setSideStats] = useState({ percentA: 50, percentB: 50 });

  // 화면 크기 감지 (데스크톱/모바일 구분)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // 토론방 상태 조회 함수
  const fetchDebateRoomStatus = useCallback(async () => {
    try {
      console.log('[토론방] 상태 조회 시작:', debateRoomInfo.id);
      const roomData = await debateApi.getDebateRoom(debateRoomInfo.id);
      console.log('[토론방] 상태 조회 성공:', roomData);

      // A입장/B입장 텍스트 업데이트
      setSideA(roomData.sideA);
      setSideB(roomData.sideB);

      // 토론방 정보 업데이트 (title, debateType, category)
      if (debateRoomInfo.title === '토론방 참여' || debateRoomInfo.category === '분류 미정') {
        // 초기 하드코딩된 값인 경우 실제 데이터로 업데이트
        debateRoomInfo.title = roomData.title;
        debateRoomInfo.debateType = roomData.debateType === 'FAST' ? '3분토론' : '일반토론';
        debateRoomInfo.category = roomData.category.name;
        console.log('[토론방] 토론방 정보 업데이트:', {
          title: roomData.title,
          debateType: debateRoomInfo.debateType,
          category: roomData.category.name
        });
      }

      // 토론방 상태 업데이트
      setRoomStatus(roomData.status);

      // 방장 여부 확인
      if (isLoggedIn && user?.id === roomData.createUserId) {
        setIsRoomOwner(true);
        console.log('[토론방] 사용자는 방장입니다');
      } else {
        setIsRoomOwner(false);
        console.log('[토론방] 사용자는 방장이 아닙니다');
      }

      // 토론 시작 상태 설정
      if (roomData.status === 'started') {
        setIsDebateStarted(true);
        if (roomData.startedAt) {
          setDebateStartTime(new Date(roomData.startedAt));
        }
        
        // started 상태이면 API로 만료시간 조회
        console.log('[토론방] 토론 시작됨 - API로 만료시간 조회');
        fetchExpireTime();
      } else {
        setIsDebateStarted(false);
      }

    } catch (error) {
      console.error('[토론방] 상태 조회 실패:', error);
      toast.error('토론방 상태를 불러오는데 실패했습니다.');
    }
  }, [debateRoomInfo.id, isLoggedIn, user?.id]);

  // 만료시간 계산 및 표시 함수
  const updateExpireTimeDisplay = useCallback(() => {
    // 만료시간이 없으면 시간 숨김
    if (!debateExpireTime) {
      setExpireTimeDisplay('--');
      return;
    }

    const now = new Date();
    const timeDiff = debateExpireTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      setExpireTimeDisplay('0분 0초 남음');
      setDebateTimeLeft(0); // 실제 타이머도 0으로 설정
      return;
    }

    const minutes = Math.floor(timeDiff / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    const totalSeconds = Math.floor(timeDiff / 1000);
    
    setExpireTimeDisplay(`${minutes}분 ${seconds}초 남음`);
    setDebateTimeLeft(totalSeconds); // 실제 타이머 동기화
    
    console.log('[토론방] 만료시간 계산됨:', `${minutes}분 ${seconds}초 남음`);
  }, [debateExpireTime]);

  // 만료시간 타이머 관리
  useEffect(() => {
    if (debateExpireTime) {
      // 기존 타이머 정리
      if (expireTimerRef.current) {
        clearInterval(expireTimerRef.current);
      }

      // 즉시 한 번 업데이트
      updateExpireTimeDisplay();

      // 1초마다 업데이트
      expireTimerRef.current = setInterval(updateExpireTimeDisplay, 1000);

      return () => {
        if (expireTimerRef.current) {
          clearInterval(expireTimerRef.current);
        }
      };
    } else {
      setExpireTimeDisplay('--');
    }
  }, [debateExpireTime, updateExpireTimeDisplay]);

  // 만료시간 설정 함수
  const handleExpireTimeReceived = useCallback((data: { debateExpireTime: string }) => {
    try {
      const expireTime = new Date(data.debateExpireTime);
      console.log('[토론방] 만료시간 수신 - 토론 시작됨:', data.debateExpireTime, '→', expireTime);
      
      // 토론 시작 상태로 변경 (웹소켓 메시지 수신 시 무조건 '진행중'으로 변경)
      setRoomStatus('started');
      setIsDebateStarted(true);
      setDebateStartTime(new Date());
      
      // 만료시간 설정
      setDebateExpireTime(expireTime);
    } catch (error) {
      console.error('[토론방] 만료시간 파싱 실패:', error);
      toast.error('시간 동기화에 실패했습니다');
      setExpireTimeDisplay('--');
    }
  }, []);

  // speaker expire 메시지 처리 함수
  const handleSpeakerExpireTimeReceived = useCallback((data: { speakerExpireTime: string, currentUserId: string }) => {
    try {
      console.log('[발언자] 발언자 만료시간 수신:', data);
      setCurrentUserId(data.currentUserId);
      
      // 발언자 만료시간 설정
      const expireTime = new Date(data.speakerExpireTime);
      setSpeakerExpireTime(expireTime);
      
      // 현재시간 대비 발언 시간 계산
      const now = new Date();
      const timeDiff = expireTime.getTime() - now.getTime();
      const timeDiffSeconds = Math.floor(timeDiff / 1000);
      
      if (timeDiffSeconds > 0) {
        // 양수: 아직 발언 시간이 남음 → 1. 발언 단계로 시작
        console.log('[발언자] 발언 시간 계산:', timeDiffSeconds, '초');
        startSpeakerCycle(timeDiffSeconds);
      } else {
        // 음수: 발언 시간이 이미 끝남 → 2. 논의 단계로 바로 시작
        const elapsedDiscussionTime = Math.abs(timeDiffSeconds); // 이미 흘러간 논의 시간
        const totalDiscussionTime = getDiscussionTime();
        const remainingDiscussionTime = Math.max(1, totalDiscussionTime - elapsedDiscussionTime); // 남은 논의 시간 (최소 1초)
        
        console.log('[발언자] 발언 시간 이미 종료 - 논의 단계로 시작:', {
          elapsedDiscussionTime,
          totalDiscussionTime,
          remainingDiscussionTime
        });
        
        startDiscussionCycle(remainingDiscussionTime, totalDiscussionTime);
      }
      
      // 현재 사용자 ID와 비교해서 로그 출력 및 모달 표시
      const myUserId = user?.id?.toString();
      if (myUserId === data.currentUserId) {
        console.log('[발언자] 내가 현재 발언자로 지정됨:', data.currentUserId);
        
        // 이전 발언자와 다르고, 내가 새로 발언자가 된 경우에만 모달 표시
        if (previousUserId !== data.currentUserId) {
          console.log('[발언자 모달] 발언자 지정 모달 표시');
          setIsSpeakerNotificationOpen(true);
        }
      } else {
        console.log('[발언자] 다른 사용자가 발언자로 지정됨:', data.currentUserId, '내 ID:', myUserId);
      }
      
      // 이전 발언자 ID 업데이트
      setPreviousUserId(data.currentUserId);
    } catch (error) {
      console.error('[발언자] 발언자 만료시간 파싱 실패:', error);
    }
  }, [user?.id, previousUserId]);

  // 참가자 목록 업데이트 함수
  const handleParticipantsUpdate = useCallback((participants: any[]) => {
    // 서버에서 받은 participants 데이터를 Speaker 형태로 변환
    const convertedSpeakers: Speaker[] = participants.map((participant) => {
      // side에 따른 position 설정
      const position = participant.side === 'A' ? POSITIONS[0] : POSITIONS[1];
      
      // 현재 발언자인지 확인 (currentUserId와 비교)
      const isSpeaking = currentUserId && participant.userId?.toString() === currentUserId;
      
      return {
        id: participant.userId?.toString() || participant.sessionId,
        name: participant.userName || '알수없음',
        position: position,
        avatar: participant.userName ? participant.userName.charAt(0) : '?',
        status: isSpeaking ? '발언중' : '대기중',
        // 방장은 API에서 확인 필요 (일단 기본값으로 설정)
        isCreator: participant.userId === user?.id && isRoomOwner,
        // 발언자인지 청중인지 구분 (SPEAKER/AUDIENCE)
        isSpeaker: participant.role === 'SPEAKER'
      };
    });

    console.log('[참가자] 변환된 발언자 목록:', convertedSpeakers);
    setSpeakers(convertedSpeakers);
  }, [currentUserId, user?.id, isRoomOwner]);

  // currentUserId 변경 시 발언자 상태 업데이트
  useEffect(() => {
    if (currentUserId) {
      setSpeakers(prev => prev.map(speaker => ({
        ...speaker,
        status: speaker.id === currentUserId ? '발언중' : '대기중'
      })));
      
      console.log('[발언자] 발언자 상태 업데이트 - 현재 발언자:', currentUserId);
    }
  }, [currentUserId]);

  // 발언자 사이클 시작 함수
  const startSpeakerCycle = useCallback((speakingTimeSeconds: number) => {
    // 기존 발언자 타이머 정리
    if (speakerTimerRef.current) {
      clearInterval(speakerTimerRef.current);
    }

    // 1. 발언 단계로 시작
    setCurrentDebateStage('1. 발언');
    setMaxSpeakerTime(speakingTimeSeconds);
    setCurrentSpeakerTimeLeft(speakingTimeSeconds);

    console.log('[발언자] 사이클 시작 - 발언 단계:', speakingTimeSeconds, '초');

    // 발언자 타이머 시작
    speakerTimerRef.current = setInterval(() => {
      setCurrentSpeakerTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          // 발언 시간 종료 -> 논의 단계로 전환
          setCurrentDebateStage('2. 논의');
          const discussionTime = getDiscussionTime();
          setMaxSpeakerTime(discussionTime);
          console.log('[발언자] 발언 시간 종료 - 논의 단계로 전환:', discussionTime, '초');
          return discussionTime;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // 논의 사이클 시작 함수 (발언 시간이 이미 지났을 때)
  const startDiscussionCycle = useCallback((remainingDiscussionTimeSeconds: number, totalDiscussionTime?: number) => {
    // 기존 발언자 타이머 정리
    if (speakerTimerRef.current) {
      clearInterval(speakerTimerRef.current);
    }

    // 2. 논의 단계로 바로 시작
    setCurrentDebateStage('2. 논의');
    const discussionTime = totalDiscussionTime || getDiscussionTime();
    setMaxSpeakerTime(discussionTime);
    setCurrentSpeakerTimeLeft(remainingDiscussionTimeSeconds);

    console.log('[발언자] 논의 사이클 시작 - 남은 논의 시간:', remainingDiscussionTimeSeconds, '초, 총 논의 시간:', discussionTime, '초');

    // 논의 타이머 시작
    speakerTimerRef.current = setInterval(() => {
      setCurrentSpeakerTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          // 논의 시간도 종료 - 타이머 정리
          if (speakerTimerRef.current) {
            clearInterval(speakerTimerRef.current);
            speakerTimerRef.current = null;
          }
          console.log('[발언자] 논의 시간도 종료');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [getDiscussionTime]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (speakerTimerRef.current) {
        clearInterval(speakerTimerRef.current);
      }
    };
  }, []);

  // API로 만료시간 조회하는 함수 (started 상태일 때)
  const fetchExpireTime = useCallback(async () => {
    try {
      console.log('[토론방] 만료시간 API 조회 시작:', debateRoomInfo.id);
      const expireData = await debateApi.getDebateExpireTime(debateRoomInfo.id);
      console.log('[토론방] 만료시간 API 조회 성공:', expireData);
      
      if (expireData.debateExpireTime) {
        const expireTime = new Date(expireData.debateExpireTime);
        setDebateExpireTime(expireTime);
      }
    } catch (error) {
      console.error('[토론방] 만료시간 API 조회 실패:', error);
      toast.error('시간 동기화에 실패했습니다');
      setExpireTimeDisplay('--');
    }
  }, [debateRoomInfo.id]);

  // 기존 발언 내용 조회 함수
  const loadExistingSpeechMessages = useCallback(async () => {
    try {
      console.log('[발언 내용] 기존 발언 내용 조회 시작:', debateRoomInfo.id);
      const existingSpeakers = await debateApi.getSpeakers(debateRoomInfo.id);
      console.log('[발언 내용] 기존 발언 내용 조회 성공:', existingSpeakers);
      
      if (Array.isArray(existingSpeakers) && existingSpeakers.length > 0) {
        // API 응답을 기존 SpeechMessage 구조에 매핑
        const mappedMessages = existingSpeakers.map((apiMessage, index) => ({
          id: `existing-speech-${Date.now()}-${index}`,
          speakerName: apiMessage.username,
          position: apiMessage.side === 'A' ? POSITIONS[0] : POSITIONS[1], // 'A' -> 'A입장', 'B' -> 'B입장'
          content: apiMessage.message,
          timestamp: new Date(), // 현재 시간으로 설정 (서버에서 타임스탬프를 제공하지 않는 경우)
          factCheck: apiMessage.verificationResult ? {
            result: apiMessage.verificationResult, // "사실", "거짓", "불분명", "검증 불가" 등
            explanation: apiMessage.evidence || '',
            sourceLinks: apiMessage.sourceLinks || []
          } : undefined
        }));
        
        console.log('[발언 내용] 매핑된 발언 메시지들:', mappedMessages);
        
        // 기존 발언 내용을 speechMessages에 추가 (덮어쓰기가 아닌 설정)
        setSpeechMessages(mappedMessages);
        
        toast.info(`기존 발언 내용 ${mappedMessages.length}개를 불러왔습니다.`, {
          position: 'bottom-right',
          duration: 3000,
        });
      } else {
        console.log('[발언 내용] 기존 발언 내용이 없습니다.');
      }
    } catch (error) {
      console.error('[발언 내용] 기존 발언 내용 조회 실패:', error);
      toast.error('기존 발언 내용을 불러오는데 실패했습니다.');
    }
  }, [debateRoomInfo.id]);

  // 기존 AI 요약 조회 함수  
  const loadExistingAiSummaries = useCallback(async () => {
    try {
      console.log('[AI 요약] 기존 AI 요약 조회 시작:', debateRoomInfo.id);
      const existingAiSummaries = await debateApi.getAiSummaries(debateRoomInfo.id);
      console.log('[AI 요약] 기존 AI 요약 조회 성공:', existingAiSummaries);
      
      if (Array.isArray(existingAiSummaries) && existingAiSummaries.length > 0) {
        // API 응답을 기존 SummaryItem 구조에 매핑
        const mappedSummaries = existingAiSummaries.map((apiSummary, index) => ({
          id: `existing-ai-summary-${Date.now()}-${index}`,
          speakerName: apiSummary.username,
          position: apiSummary.side === 'A' ? POSITIONS[0] : POSITIONS[1], // 'A' -> 'A입장', 'B' -> 'B입장'
          summary: apiSummary.summary,
          timestamp: new Date() // 현재 시간으로 설정
        }));
        
        console.log('[AI 요약] 매핑된 AI 요약들:', mappedSummaries);
        
        // 기존 AI 요약을 aiSummaries에 설정
        setAiSummaries(mappedSummaries);
        
        toast.info(`기존 AI 요약 ${mappedSummaries.length}개를 불러왔습니다.`, {
          position: 'bottom-right',
          duration: 3000,
        });
      } else {
        console.log('[AI 요약] 기존 AI 요약이 없습니다.');
      }
    } catch (error) {
      console.error('[AI 요약] 기존 AI 요약 조회 실패:', error);
      toast.error('기존 AI 요약을 불러오는데 실패했습니다.');
    }
  }, [debateRoomInfo.id]);

  // 토론방 입장 시 로직
  useEffect(() => {
    setHasEnteredRoom(true);
    
    // JOIN_ACCEPTED 후 토론방 상태 조회
    fetchDebateRoomStatus();
    
    // userSelectedSide를 사용해서 해당 입장으로 설정 (JoinDiscussionModal에서 선택한 입장)
    if (debateRoomInfo.userSelectedSide) {
      // userSelectedSide를 사용해서 A입장/B입장 매핑
      const mappedPosition = debateRoomInfo.userSelectedSide === 'A' ? POSITIONS[0] : POSITIONS[1];
      setCurrentPosition(mappedPosition);
      console.log('[토론방] 입장 설정 완료:', { userSelectedSide: debateRoomInfo.userSelectedSide, mappedPosition });
    } else {
      console.log('[토론방] userSelectedSide가 없음:', debateRoomInfo.userSelectedSide);
      // 이미 useState 초기값에서 설정했으므로 여기서는 null로 설정하지 않음
    }
  }, [debateRoomInfo.userSelectedSide, debateRoomInfo.id]);

  // 웹소켓 연결 후 expire 구독
  useEffect(() => {
    if (isConnected && hasEnteredRoom) {
      console.log('[토론방] 웹소켓 연결됨 - expire 구독 시작');
      subscribeExpire(debateRoomInfo.id, handleExpireTimeReceived);
    }
  }, [isConnected, hasEnteredRoom, debateRoomInfo.id, subscribeExpire, handleExpireTimeReceived]);

  // 웹소켓 연결 후 speaker expire 구독 (발언자와 청중 모두)
  useEffect(() => {
    if (isConnected && hasEnteredRoom) {
      console.log('[발언자 시간] 웹소켓 연결됨 - speaker expire 구독 시작 (발언자/청중 공통)');
      subscribeSpeakerExpire(debateRoomInfo.id, handleSpeakerExpireTimeReceived);
    }
  }, [isConnected, hasEnteredRoom, debateRoomInfo.id, subscribeSpeakerExpire, handleSpeakerExpireTimeReceived]);

  // 웹소켓 연결 후 토론방 참여 (콜백 등록 후에 joinRoom 호출)
  useEffect(() => {
    if (isConnected && hasEnteredRoom && debateRoomInfo.userRole && debateRoomInfo.userPosition) {
      console.log('[토론방] 콜백 등록 완료 - joinRoom 호출 시작');
      
      // 사용자가 선택한 A/B 입장 사용 (확실함)
      console.log('[joinRoom] userSelectedSide:', debateRoomInfo.userSelectedSide);
      console.log('[joinRoom] userPosition:', debateRoomInfo.userPosition);
      
      const userSide: 'A' | 'B' = debateRoomInfo.userSelectedSide || 'A';
      console.log('[joinRoom] 계산된 userSide:', userSide);
      
      // joinRoom 호출
      joinRoom(debateRoomInfo.id, debateRoomInfo.userRole, userSide)
        .then(async (result) => {
          console.log('[토론방] joinRoom 완료:', result);
          if (result?.type === 'JOIN_ACCEPTED') {
            console.log('[토론방] 참여 승인 - 정상 입장 완료');
            
            // 입장 완료 후 side 정보 API 호출
            if (result.subjectId) {
              // subjectId 상태에 저장 (입장 변경 시 사용)
              setUserSubjectId(result.subjectId);
              
              try {
                await debateApi.sendSideInfo(debateRoomInfo.id, result.subjectId, userSide);
                console.log('[토론방] 입장 정보 전송 완료:', { roomId: debateRoomInfo.id, subjectId: result.subjectId, side: userSide });
                
                // 토론방 입장 완료 후 기존 발언 내용 및 AI 요약 조회
                await loadExistingSpeechMessages();
                await loadExistingAiSummaries();
              } catch (error) {
                console.error('[토론방] 입장 정보 전송 실패:', error);
              }
            } else {
              console.warn('[토론방] subjectId가 없어서 입장 정보를 전송하지 못했습니다.');
            }
          } else if (result?.type === 'JOIN_REJECTED') {
            console.error('[토론방] 참여 거부:', result.reason);
            toast.error(`입장이 거부되었습니다: ${result.reason}`);
          } else {
            console.warn('[토론방] 예상치 못한 응답:', result);
          }
        })
        .catch((error) => {
          console.error('[토론방] joinRoom 실패:', error);
          toast.error('토론방 참여 중 오류가 발생했습니다.');
        });
    }
  }, [isConnected, hasEnteredRoom, debateRoomInfo.id, debateRoomInfo.userRole, debateRoomInfo.userPosition, sideA, joinRoom]);

  // 로그인한 사용자일 때 음성 웹소켓 연결 (connectSpeechWebSocket 의존성 제거로 중복 연결 방지)
  useEffect(() => {
    if (isConnected && isLoggedIn && user?.id && !isSpeechConnected) {
      console.log('[음성 웹소켓] 로그인한 사용자 - 음성 웹소켓 연결 시작:', user.id);
      connectSpeechWebSocket(user.id.toString());
    }
  }, [isConnected, isLoggedIn, user?.id, isSpeechConnected]);

  const [speechMessages, setSpeechMessages] = useState([]);
  const [aiSummaries, setAiSummaries] = useState([]);
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);
  
  // 현재 발언자 추적 (웹소켓 데이터 기반)
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);



  // 토론 종료 처리 함수
  const handleDebateEnd = useCallback(() => {
    if (!isDebateFinished) {
      setIsDebateFinished(true);
      // 시간 연장 모달이 열려있다면 닫기
      setIsExtensionModalOpen(false);
      // 로딩 모달 먼저 표시
      setIsAiSummaryLoadingOpen(true);
    }
  }, [isDebateFinished]);

  // AI 요약 로딩 완료 핸들러
  const handleAiSummaryLoadingComplete = async () => {
    setIsAiSummaryLoadingOpen(false);
    
    // 웹소켓 연결 정리 (모든 구독 해제 및 연결 종료)
    console.log('[토론방] 토론 종료 - 웹소켓 연결 정리 중...');
    disconnect();
    
    // API에서 요약 데이터 생성
    const summary = await generateDebateSummary();
    setDebateSummary(summary);
    
    setIsAiSummaryModalOpen(true);
  };

  // 연장 모달 표시 기준 계산 함수
  const getExtensionThreshold = useCallback(() => {
    // 토론방 만료시간이 설정되지 않은 경우 null 반환 (모달 안뜨게)
    if (expireTimeDisplay === '--') {
      return null;
    }
    
    // 현재 발언자 수 계산 (isSpeaker가 true인 사람들)
    const currentSpeakerCount = speakers.filter(speaker => speaker.isSpeaker).length;
    
    // 발언자가 없으면 기본값
    if (currentSpeakerCount === 0) {
      return 180; // 3분
    }
    
    // 토론 타입에 따른 기준 시간 계산
    if (debateRoomInfo.debateType === '일반토론') {
      // 일반토론: 10분 × 발언자 수
      return 600 * currentSpeakerCount;
    } else {
      // 3분토론: 1분 × 발언자 수
      return 60 * currentSpeakerCount;
    }
  }, [expireTimeDisplay, speakers, debateRoomInfo.debateType]);

  // 토론 타이머 관리
  useEffect(() => {
    // 토론이 종료되면 타이머 중단
    if (isDebateFinished) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    // 토론방 시간이 설정되지 않은 경우 타이머 작동 안함
    if (expireTimeDisplay === '--') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      // speaker expire 타이머가 별도로 관리되므로 여기서는 debateTimeLeft만 관리
      setDebateTimeLeft(prev => {
        console.log(`[DEBUG 타이머] 타이머 작동중 - 현재 남은시간: ${prev}초`);
        
        if (prev <= 0) {
          clearInterval(timerRef.current!);
          // 토론 시간 소진 시 바로 토론 종료 처리 (연장 모달 건너뛰기)
          handleDebateEnd();
          return 0;
        }
        
        // 시간 연장 모달 비활성화
        // const threshold = getExtensionThreshold();
        // if (threshold !== null && prev <= threshold && !hasShownExtensionModal) {
        //   console.log(`[토론방] 연장 모달 표시 - 남은시간: ${prev}초, 기준: ${threshold}초`);
        //   setIsExtensionModalOpen(true);
        //   setHasShownExtensionModal(true);
        // }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [handleDebateEnd, hasShownExtensionModal, isDebateFinished, getExtensionThreshold]);

  // 시간을 "분:초" 형식으로 변환
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}분 ${seconds}초`;
  };

  // 실제 시간을 표시하는 형식 (HH:mm:ss 또는 yyyy-mm-dd HH:mm:ss)
  const formatDisplayTime = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const timeString = date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // 오늘이 아닌 경우 날짜 포함
    if (messageDate.getTime() !== today.getTime()) {
      const dateString = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\./g, '-').replace(/ /g, '').slice(0, -1); // "2024-01-15" 형식으로 변환
      
      return `${dateString} ${timeString}`;
    }
    
    return timeString;
  };

  const handleModeChange = (mode: ParticipationRole) => {
    // 참여 모드는 입장 시 선택한 역할에 따라 결정되므로 토글 불가
    console.log('참여 모드는 토글할 수 없습니다. 현재 모드:', participationMode);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleStartDebate = async () => {
    try {
      console.log('[토론] 시작 API 호출:', debateRoomInfo.id);
      const response = await debateApi.startDebate(debateRoomInfo.id);
      console.log('[토론] 시작 API 성공:', response);

      if (response.status === 'started') {
        const startTime = new Date(response.startedAt);
        setDebateStartTime(startTime);
        setIsDebateStarted(true);
        setRoomStatus('started');
        
        toast.success('토론이 시작되었습니다!');
        console.log('[토론] 시작됨:', startTime);
      }
    } catch (error) {
      console.error('[토론] 시작 실패:', error);
      toast.error('토론 시작에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleLeaveRoom = () => {
    setIsLeaveModalOpen(true);
  };

  const handleConfirmLeave = () => {
    setIsLeaveModalOpen(false);
    
    // 백엔드로 나가기 메시지 전송
    if (isConnected && user?.id) {
      const leaveMessage = {
        roomId: debateRoomInfo.id,
        userId: user.id.toString()
      };
      
      console.log('[토론방] 나가기 메시지 전송:', leaveMessage);
      sendMessage('/pub/debate/leave', leaveMessage);
    }
    
    // 웹소켓 연결 정리 (모든 구독 해제 및 연결 종료)
    console.log('[토론방] 웹소켓 연결 정리 중...');
    disconnect();
    
    // 발언자로 참여했던 경우 퇴장 메시지 표시
    if (participationMode === PARTICIPATION_ROLES[0] && (isLoggedIn ? user?.username : nickname)) {
      const userName = isLoggedIn ? user?.username : nickname;
      toast.info(`${userName}님이 토론방에서 퇴장했습니다.`, {
        position: 'bottom-right',
        duration: 3000,
      });
      
      // 발언자 목록에서 사용자 제거
      setSpeakers(prev => prev.filter(speaker => speaker.name !== userName));
    }
    
    onGoBack?.();
  };

  const handleCancelLeave = () => {
    setIsLeaveModalOpen(false);
  };

  const handlePositionChange = (position: Position) => {
    const userName = isLoggedIn ? user?.username : nickname;
    
    // 발언자 모드인 경우 현재 발언 중인지 확인
    if (participationMode === PARTICIPATION_ROLES[0]) { // '발언자'
      // 현재 사용자가 발언 중인지 확인
      const isCurrentlyUserSpeaking = currentSpeaker && currentSpeaker.name === userName;
      
      if (isCurrentlyUserSpeaking) {
        // 현재 발언 중인 경우 입장 변경 차단
        toast.warning('발언이 진행 중일 때는 입장을 변경할 수 없습니다. 발언이 끝난 후 다시 시도해주세요.', {
          position: 'bottom-right',
          duration: 4000,
        });
        return;
      }
    }
    
    setCurrentPosition(position);
    
    // 발언자 모드인 경우 발언자 목록에서도 사용자의 입장을 업데이트
    if (participationMode === PARTICIPATION_ROLES[0]) { // '발언자'
      if (userName) {
        setSpeakers(prev => prev.map(speaker => 
          speaker.name === userName 
            ? { ...speaker, position: position }
            : speaker
        ));
        
        // 입장 변경 토스트 메시지 표시
        toast.info(`${userName}님이 입장을 ${position}으로 변경했습니다.`, {
          position: 'bottom-right',
          duration: 3000,
        });
      }
    }
    
    console.log('입장 변경:', position);
  };

  const handleSendSpeech = useCallback((content: string, type: SpeechInputType) => {
    if (participationMode === PARTICIPATION_ROLES[0] && user?.id && debateRoomInfo.userPosition) {
      // 채팅 모드인 경우 웹소켓으로 서버에 전송
      if (type === SPEECH_INPUT_TYPES[1] && isConnected) { // 'text' 모드
        // 현재 변경된 입장을 기반으로 side 계산
        const userSide: 'A' | 'B' = currentPosition === POSITIONS[0] ? 'A' : 'B';
        console.log('[발언] 디버깅 정보:', {
          currentPosition,
          'POSITIONS[0]': POSITIONS[0],
          'POSITIONS[1]': POSITIONS[1],
          'currentPosition === POSITIONS[0]': currentPosition === POSITIONS[0],
          'debateRoomInfo.userSelectedSide': debateRoomInfo.userSelectedSide,
          '계산된 userSide': userSide
        });
        
        const speechMessage = {
          roomUUID: debateRoomInfo.id,
          userId: user.id,
          message: content,
          side: userSide
        };
        
        console.log('[발언] 채팅 메시지 전송:', speechMessage);
        sendMessage('/pub/speaker/text', speechMessage);
        
        // 텍스트 발언 완료 토스트 메시지
        toast.success('발언 완료하였습니다');
        
        // 2초간 발언 섹션 비활성화 (발언 분석 중 느낌)
        setIsProcessingSpeech(true);
        setTimeout(() => {
          setIsProcessingSpeech(false);
        }, 2000);
        
        // 서버 응답은 /topic/speaker/{roomUUID} 구독으로 받아서 처리됨
      } else {
        // 음성 모드인 경우 기존 로직 (로컬 추가)
        const newSpeech = {
          id: `speech-${Date.now()}`,
          speakerName: nickname || user.username || '알수없음',
          position: currentPosition || POSITIONS[0],
          content: content,
          timestamp: new Date(),
          factCheck: undefined
        };
        
        setSpeechMessages(prev => [...prev, newSpeech]);
        console.log('음성 발언 추가됨:', newSpeech);
      }
    }
  }, [participationMode, user?.id, user?.username, nickname, currentPosition, debateRoomInfo.id, debateRoomInfo.userPosition, isConnected, sendMessage]);

  // 음성 녹음 관련 상태
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // 음성 녹음 시작 함수
  const startRecording = useCallback(async () => {
    if (!isConnected || !isSpeechConnected) {
      toast.error('웹소켓 연결을 확인해주세요');
      return;
    }

    if (!user?.id) {
      toast.error('로그인이 필요합니다');
      return;
    }

    try {
      console.log('[음성 녹음] 녹음 시작 요청');
      
      // 음성 웹소켓 상태 확인
      const speechSocket = getSpeechWebSocket();
      console.log('[음성 녹음] 음성 웹소켓 상태 확인:', {
        웹소켓존재: !!speechSocket,
        웹소켓상태: speechSocket?.readyState,
        연결됨: speechSocket?.readyState === WebSocket.OPEN
      });

      // 1. STOMP로 제어 신호 전송
      const userSide: 'A' | 'B' = currentPosition === POSITIONS[0] ? 'A' : 'B';
      const voiceControlMessage = {
        roomUUID: debateRoomInfo.id,
        userId: user.id,
        mode: '녹음 시작',
        side: userSide
      };
      
      console.log('[음성 녹음] STOMP 제어 신호 전송:', voiceControlMessage);
      sendMessage('/pub/speaker/voice', voiceControlMessage);

      // 2. 브라우저 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      // 3. MediaRecorder 설정
      const preferTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg'
      ];
      
      let mimeType = '';
      for (const type of preferTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      console.log('[음성 녹음] 사용할 MIME 타입:', mimeType || '기본값');

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      setMediaRecorder(recorder);
      mediaRecorderRef.current = recorder;

      // 4. 실시간 전송 설정
      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          try {
            const buffer = await event.data.arrayBuffer();
            // 순수 WebSocket으로 바이너리 전송
            const speechSocket = getSpeechWebSocket();
            if (speechSocket && speechSocket.readyState === WebSocket.OPEN) {
              speechSocket.send(buffer);
              console.log('[음성 녹음] 청크 전송 성공:', {
                크기: event.data.size + 'bytes',
                웹소켓상태: speechSocket.readyState,
                타임스탬프: new Date().toISOString()
              });
            } else {
              console.warn('[음성 녹음] 음성 웹소켓이 연결되지 않음:', {
                웹소켓존재: !!speechSocket,
                웹소켓상태: speechSocket?.readyState,
                예상상태: WebSocket.OPEN
              });
            }
          } catch (error) {
            console.error('[음성 녹음] 청크 전송 실패:', error);
          }
        } else {
          console.warn('[음성 녹음] 빈 데이터 청크:', event.data);
        }
      };

      recorder.onstart = () => {
        console.log('[음성 녹음] MediaRecorder 시작됨');
        setIsRecording(true);
      };

      recorder.onstop = () => {
        console.log('[음성 녹음] MediaRecorder 중지됨');
        setIsRecording(false);
      };

      recorder.onerror = (event) => {
        console.error('[음성 녹음] MediaRecorder 오류:', event);
        toast.error('녹음 중 오류가 발생했습니다');
      };

      // 5. 녹음 시작! (250ms마다 청크 생성)
      recorder.start(250);
      console.log('[음성 녹음] 녹음 시작됨');

    } catch (error) {
      console.error('[음성 녹음] 녹음 시작 실패:', error);
      toast.error('마이크 권한이 필요합니다');
    }
  }, [isConnected, isSpeechConnected, user?.id, debateRoomInfo.id, sendMessage, currentPosition]);

  // 음성 녹음 완료 함수
  const finishRecording = useCallback(() => {
    if (!user?.id) return;

    try {
      console.log('[음성 녹음] 녹음 완료 요청');

      // 1. STOMP로 종료 신호
      const userSide: 'A' | 'B' = currentPosition === POSITIONS[0] ? 'A' : 'B';
      const voiceControlMessage = {
        roomUUID: debateRoomInfo.id,
        userId: user.id,
        mode: '종료',
        side: userSide
      };
      
      console.log('[음성 녹음] STOMP 종료 신호 전송:', voiceControlMessage);
      sendMessage('/pub/speaker/voice', voiceControlMessage);

      // 음성 발언 완료 토스트 메시지
      toast.success('발언 완료하였습니다');
      
      // 2초간 발언 섹션 비활성화 (발언 분석 중 느낌)
      setIsProcessingSpeech(true);
      setTimeout(() => {
        setIsProcessingSpeech(false);
      }, 2000);

      // 2. 녹음 중지
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      // 3. 미디어 스트림 정리
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }

      setMediaRecorder(null);
      mediaRecorderRef.current = null;
      console.log('[음성 녹음] 녹음 완료 및 정리됨');

    } catch (error) {
      console.error('[음성 녹음] 녹음 완료 실패:', error);
      toast.error('녹음 완료 중 오류가 발생했습니다');
    }
  }, [user?.id, debateRoomInfo.id, sendMessage, mediaStream, currentPosition]);

  const handleToggleRecording = () => {
    if (isRecording) {
      finishRecording();
    } else {
      startRecording();
    }
  };

  const handleSendMessage = useCallback(async (message: string) => {
    if (!isConnected) {
      toast.error('웹소켓 연결이 끊어졌습니다. 다시 시도해주세요.');
      return;
    }

    try {
      // STOMP로 채팅 메시지 전송
      const success = await sendChatMessage(debateRoomInfo.id, message);
      
      if (!success) {
        toast.error('채팅 전송에 실패했습니다. 다시 시도해주세요.');
      }
      
      // 서버에서 브로드캐스트로 받을 예정이므로 여기서는 로컬 상태 업데이트 하지 않음
      
    } catch (error) {
      console.error('[채팅] 전송 실패:', error);
      toast.error('채팅 전송 중 오류가 발생했습니다.');
    }
  }, [isConnected, sendChatMessage, debateRoomInfo.id]);


  const handleExtendDebate = (minutes: number) => {
    // 토론 시간 연장
    setDebateTimeLeft(prev => prev + (minutes * 60));
    setIsExtensionModalOpen(false);
    console.log(`토론 시간 ${minutes}분 연장됨`);
  };

  const handleExtensionModalClose = () => {
    setIsExtensionModalOpen(false);
  };

  // 토론 종료 버튼 핸들러 (시간 연장 모달에서 호출)
  const handleManualDebateEnd = () => {
    console.log('수동으로 토론 종료됨');
    handleDebateEnd();
  };

  // AI 요약 모달에서 나가기 요청 시 확인 모달 표시
  const handleAiSummaryExitRequest = () => {
    setIsExitConfirmModalOpen(true);
  };

  // AI 요약 모달 닫기 (내부 상태 변경용)
  const handleAiSummaryModalClose = () => {
    setIsAiSummaryModalOpen(false);
  };

  // 나가기 확인 모달 처리
  const handleExitConfirm = () => {
    setIsExitConfirmModalOpen(false);
    setIsAiSummaryModalOpen(false);
    // 토론방 둘러보기 페이지로 이동
    onNavigate?.('browser');
  };

  const handleExitCancel = () => {
    setIsExitConfirmModalOpen(false);
  };

  // 토론 종료 시 표시할 AI 요약 데이터 생성
  const generateDebateSummary = async () => {
    try {
      const apiResponse = await debateApi.getDebateResults(debateRoomInfo.id);
      
      // API 응답을 DebateSummary 형식으로 변환
      const completedSummary = {
        id: `summary-${debateRoomInfo.id}`,
        discussionId: debateRoomInfo.id,
        debateType: apiResponse.debateType === 'NORMAL' ? '일반토론' : '3분토론',
        title: apiResponse.title,
        category: apiResponse.categoryName,
        duration: Math.floor(apiResponse.durationSeconds / 60), // 초를 분으로 변환
        participantCount: apiResponse.totalCount,
        sideA: apiResponse.sideA, // API에서 받은 A입장 텍스트
        sideB: apiResponse.sideB, // API에서 받은 B입장 텍스트
        keyStatements: {
          aSide: [apiResponse.aiSummaryResult.sideA],
          bSide: [apiResponse.aiSummaryResult.sideB]
        },
        publicOpinion: {
          totalVotes: apiResponse.totalCount,
          aPercentage: apiResponse.sideARate,
          bPercentage: apiResponse.sideBCRate
        },
        finalConclusion: apiResponse.aiSummaryResult.aiResult,
        summary: apiResponse.aiSummaryResult.aiResult,
        completedAt: new Date()
      };
      return completedSummary;
    } catch (error) {
      console.error('토론 요약 조회 실패:', error);
      // 에러 시 기본 데이터 반환
      return {
        id: `summary-${debateRoomInfo.id}`,
        discussionId: debateRoomInfo.id,
        debateType: debateRoomInfo.debateType,
        title: debateRoomInfo.title,
        category: debateRoomInfo.category,
        duration: Math.ceil(debateRoomInfo.duration / 60),
        participantCount: debateRoomInfo.currentSpeakers + debateRoomInfo.currentAudience,
        keyStatements: {
          aSide: ["토론 요약을 불러오는데 실패했습니다."],
          bSide: ["토론 요약을 불러오는데 실패했습니다."]
        },
        publicOpinion: {
          totalVotes: 0,
          aPercentage: 0,
          bPercentage: 0
        },
        finalConclusion: "토론 요약을 불러오는데 실패했습니다.",
        summary: "토론 요약을 불러오는데 실패했습니다.",
        completedAt: new Date()
      };
    }
  };


  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // AI 요약/채팅 섹션 리사이즈 핸들러
  const handleResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = aiSummaryHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(150, Math.min(startHeight + deltaY, window.innerHeight - 300)); // 최소 150px, 최대 화면 높이 - 300px
      setAiSummaryHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [aiSummaryHeight]);

  // roomStatus를 DiscussionStatus로 매핑하는 함수
  const getDisplayStatus = () => {
    if (isDebateFinished) return '종료됨';
    
    switch (roomStatus) {
      case 'waiting':
        return '대기중';
      case 'started':
        return '진행중';
      case 'ended':
        return '종료됨';
      default:
        return '대기중';
    }
  };

  // 발언 권한 체크: 토론이 끝나지 않았고, 발언자 모드에서 현재 발언자 ID가 내 ID와 같고, '1. 발언' 단계이면서 발언 시간이 남고, 발언 처리 중이 아닌 경우에만 활성화
  const canSpeak = !isDebateFinished && 
    !isProcessingSpeech &&
    (participationMode === PARTICIPATION_ROLES[0] && 
     currentUserId && 
     user?.id?.toString() === currentUserId && 
     currentDebateStage === '1. 발언' && 
     currentSpeakerTimeLeft !== null && 
     currentSpeakerTimeLeft > 0);

  // 토론 단계 변경 시 녹음 자동 종료 (1. 발언 → 2. 논의로 전환 시)
  useEffect(() => {
    if (isRecording && currentDebateStage === '2. 논의') {
      console.log('[음성 녹음] 논의 단계로 전환됨 - 자동 녹음 종료');
      finishRecording();
    }
  }, [currentDebateStage, isRecording, finishRecording]);

  return (
    <>
      <div className={`h-screen flex flex-col overflow-hidden ${(isAiSummaryLoadingOpen || isAiSummaryModalOpen) && !isExitConfirmModalOpen ? 'debate-end-blur' : ''}`}>
        {/* 헤더 */}
        <DebateHeader
          title={debateRoomInfo.title}
          category={debateRoomInfo.category}
          debateType={debateRoomInfo.debateType}
          participationMode={participationMode}
          onModeChange={handleModeChange}
          onShare={handleShare}
          onNavigate={onNavigate}
        />

        {/* 메인 컨텐츠 영역 */}
        <div className="flex-1 flex h-[calc(100vh-64px)] lg:h-[calc(100vh-64px-48px)]">
          {/* 데스크톱 왼쪽 사이드바 - 화상회의 모드가 아닐 때만 표시 */}
          {!isVideoMode && (
            <div className="hidden lg:block lg:w-1/4 border-r border-divider">
              <SpeakersSidebar
                speakers={speakers}
                debateStartTime={debateStartTime}
                isDebateStarted={isDebateStarted}
                onStartDebate={handleStartDebate}
                onLeaveRoom={handleLeaveRoom}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={handleToggleSidebar}
                isOpen={false}
                onClose={() => {}}
                isRoomOwner={isRoomOwner}
                roomStatus={roomStatus}
              />
            </div>
          )}

          {/* 모바일 사이드바 토글 버튼 - 화상회의 모드가 아닐 때만 */}
          {!isVideoMode && !isMobileSidebarOpen && (
            <div className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-30">
              <Button
                onClick={handleToggleMobileSidebar}
                className="rounded-l-none rounded-r-lg elevation-4 hover:elevation-6 transition-elevation bg-primary/80 hover:bg-primary/90 backdrop-blur-sm text-on-primary p-2 h-12 border border-primary/20"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* 모바일 사이드바 오버레이 - 화상회의 모드가 아닐 때만 */}
          {!isVideoMode && isMobileSidebarOpen && (
            <div className="lg:hidden">
              <SpeakersSidebar
                speakers={speakers}
                debateStartTime={debateStartTime}
                isDebateStarted={isDebateStarted}
                onStartDebate={handleStartDebate}
                onLeaveRoom={handleLeaveRoom}
                isCollapsed={false}
                onToggleCollapse={handleToggleSidebar}
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
                isRoomOwner={isRoomOwner}
                roomStatus={roomStatus}
              />
            </div>
          )}

          {/* 중앙 토론 영역 - 화상회의 모드: 전체 너비, 일반 모드: 데스크톱 2/4 너비, 모바일 전체 너비 */}
          <div className={`flex-1 ${isVideoMode ? 'w-full' : 'lg:w-2/4'} h-full flex flex-col bg-background`}>
            
            {/* 화상회의 모드 레이아웃 */}
            {isVideoMode ? (
              <div className="flex flex-col h-full">
                {/* 연결 상태 */}
                <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
                  <div className="text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                      connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {connectionStatus === 'connected' ? '연결됨' : 
                       connectionStatus === 'connecting' ? '연결 중...' : '연결 실패'}
                    </span>
                  </div>
                </div>

                {/* 비디오 그리드 */}
                <div className="flex-1 p-4">
                  <div className={`
                    grid gap-4 h-full
                    ${remoteUsers.size + 1 === 1 ? 'grid-cols-1' :
                      remoteUsers.size + 1 === 2 ? 'grid-cols-2' :
                      remoteUsers.size + 1 <= 4 ? 'grid-cols-2 grid-rows-2' :
                      'grid-cols-3 grid-rows-2'
                    }
                  `}>
                    {/* 로컬 비디오 */}
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                      {localStream ? (
                        <video
                          ref={(video) => {
                            if (video && localStream) {
                              video.srcObject = localStream;
                            }
                          }}
                          autoPlay
                          muted
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl font-bold">
                                {videoUsername.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm">카메라 연결 중...</div>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm font-medium">
                        {videoUsername} (나)
                      </div>
                      {!isVideoEnabled && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="text-3xl mb-2">📹</div>
                            <div className="text-sm">비디오 꺼짐</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 원격 비디오들 */}
                    {Array.from(remoteUsers.values()).map((remoteUser) => (
                      <div key={remoteUser.userId} className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                        {remoteUser.stream ? (
                          <video
                            key={`${remoteUser.userId}-${remoteUser.stream.id}`}
                            ref={(video) => {
                              if (video && remoteUser.stream) {
                                console.log(`비디오 요소에 스트림 할당: ${remoteUser.userId}`, remoteUser.stream.id);
                                video.srcObject = remoteUser.stream;
                              }
                            }}
                            autoPlay
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold">
                                  {remoteUser.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="text-sm">연결 중...</div>
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm font-medium">
                          {remoteUser.username}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 미디어 컨트롤 */}
                <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={toggleVideo}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                        isVideoEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      <span className="text-xl">📹</span>
                    </button>
                    <button
                      onClick={toggleAudio}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                        isAudioEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      <span className="text-xl">🎤</span>
                    </button>
                    <button
                      onClick={() => {
                        disconnectWebRTC();
                        onGoBack?.();
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      나가기
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
              {/* 일반 토론 모드 레이아웃 */}
              <div className="hidden lg:flex lg:flex-col h-full">
              {/* 상단 고정 영역 */}
              <div className="flex-shrink-0 border-b border-divider elevation-1" id="debate-fixed-header">
                <DebateInfo
                  status={getDisplayStatus()}
                  audienceCount={45}
                  remainingTime="--"
                  expireTimeDisplay={expireTimeDisplay}
                  onShowExtensionModal={() => setIsExtensionModalOpen(true)}
                />
                <CurrentSpeaker
                  speaker={(() => {
                    // 디버깅 로그 추가
                    console.log('[CurrentSpeaker] 디버깅 정보:', {
                      currentUserId,
                      speakers: speakers,
                      speakersCount: speakers.length
                    });
                    
                    // currentUserId와 매칭되는 발언자 찾기
                    const currentSpeaker = speakers.find(speaker => speaker.id === currentUserId);
                    if (currentSpeaker) {
                      console.log('[CurrentSpeaker] 매칭된 발언자:', currentSpeaker);
                      return {
                        name: currentSpeaker.name,
                        position: currentSpeaker.position,
                        avatar: currentSpeaker.name.charAt(0) // 이름 첫글자
                      };
                    }
                    // 발언자를 찾지 못한 경우 기본값
                    console.log('[CurrentSpeaker] 발언자 찾지 못함 - 기본값 사용');
                    return {
                      name: '발언자 없음',
                      position: POSITIONS[0],
                      avatar: '?'
                    };
                  })()}
                  stage={currentDebateStage}
                  timeProgress={currentSpeakerTimeLeft !== null ? ((maxSpeakerTime - currentSpeakerTimeLeft) / maxSpeakerTime) * 100 : 0}
                  remainingSeconds={currentSpeakerTimeLeft}
                />
                <PositionSelector
                  supportRatio={sideStats.percentA}
                  currentPosition={currentPosition}
                  onPositionChange={handlePositionChange}
                  debateTitle={debateRoomInfo.title}
                  category={debateRoomInfo.category}
                  debateType={debateRoomInfo.debateType}
                  aDescription={debateRoomInfo.aDescription}
                  bDescription={debateRoomInfo.bDescription}
                  isUserCurrentlySpeaking={participationMode === PARTICIPATION_ROLES[0] && currentSpeaker?.name === (isLoggedIn ? user?.username : nickname)}
                  isSpeakerMode={participationMode === PARTICIPATION_ROLES[0]}
                  sideA={sideA}
                  sideB={sideB}
                  roomId={debateRoomInfo.id}
                  userSubjectId={userSubjectId}
                />
              </div>

              {/* 중앙 확장 영역 - 발언 내용 */}
              <div className="flex-1 min-h-0">
                <SpeechContent messages={speechMessages} />
              </div>

              {/* 하단 고정 영역 - 발언 입력 (발언자 모드일 때만 표시) */}
              {participationMode === PARTICIPATION_ROLES[0] && (
                <div className="flex-shrink-0 p-3 bg-surface-variant/30">
                  <SpeechInput
                    onSendSpeech={handleSendSpeech}
                    isRecording={isRecording}
                    onToggleRecording={handleToggleRecording}
                    isActive={canSpeak}
                  />
                </div>
              )}
            </div>

            {/* 모바일 레이아웃 */}
            <div className="lg:hidden flex flex-col h-full">
              {/* 모바일 상단 고정 영역 */}
              <div className="flex-shrink-0 border-b border-divider bg-surface elevation-2">
                <DebateInfo
                  status={getDisplayStatus()}
                  audienceCount={45}
                  remainingTime="--"
                  expireTimeDisplay={expireTimeDisplay}
                  onShowExtensionModal={() => setIsExtensionModalOpen(true)}
                />
                <CurrentSpeaker
                  speaker={(() => {
                    // 디버깅 로그 추가
                    console.log('[CurrentSpeaker] 디버깅 정보:', {
                      currentUserId,
                      speakers: speakers,
                      speakersCount: speakers.length
                    });
                    
                    // currentUserId와 매칭되는 발언자 찾기
                    const currentSpeaker = speakers.find(speaker => speaker.id === currentUserId);
                    if (currentSpeaker) {
                      console.log('[CurrentSpeaker] 매칭된 발언자:', currentSpeaker);
                      return {
                        name: currentSpeaker.name,
                        position: currentSpeaker.position,
                        avatar: currentSpeaker.name.charAt(0) // 이름 첫글자
                      };
                    }
                    // 발언자를 찾지 못한 경우 기본값
                    console.log('[CurrentSpeaker] 발언자 찾지 못함 - 기본값 사용');
                    return {
                      name: '발언자 없음',
                      position: POSITIONS[0],
                      avatar: '?'
                    };
                  })()}
                  stage={currentDebateStage}
                  timeProgress={currentSpeakerTimeLeft !== null ? ((maxSpeakerTime - currentSpeakerTimeLeft) / maxSpeakerTime) * 100 : 0}
                  remainingSeconds={currentSpeakerTimeLeft}
                />
                <PositionSelector
                  supportRatio={sideStats.percentA}
                  currentPosition={currentPosition}
                  onPositionChange={handlePositionChange}
                  debateTitle={debateRoomInfo.title}
                  category={debateRoomInfo.category}
                  debateType={debateRoomInfo.debateType}
                  aDescription={debateRoomInfo.aDescription}
                  bDescription={debateRoomInfo.bDescription}
                  isUserCurrentlySpeaking={participationMode === PARTICIPATION_ROLES[0] && currentSpeaker?.name === (isLoggedIn ? user?.username : nickname)}
                  isSpeakerMode={participationMode === PARTICIPATION_ROLES[0]}
                  sideA={sideA}
                  sideB={sideB}
                  roomId={debateRoomInfo.id}
                  userSubjectId={userSubjectId}
                />
              </div>

              {/* 모바일 3개 탭 (발언 내용, AI 요약, 채팅) */}
              <div className="flex-1 bg-background overflow-hidden">
                <Tabs defaultValue="speech" className="w-full h-full flex flex-col">
                  {/* SpeakersSidebar 헤더 스타일과 동일한 탭 헤더 */}
                  <div className="border-b border-divider bg-surface elevation-1 flex-shrink-0">
                    <TabsList className="w-full bg-transparent border-0 h-auto p-0 rounded-none">
                      <div className="grid w-full grid-cols-3">
                        <TabsTrigger 
                          value="speech" 
                          className="flex-1 h-12 rounded-none border-0 bg-transparent text-sm font-medium text-on-surface-variant data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-material"
                        >
                          발언 내용
                        </TabsTrigger>
                        <TabsTrigger 
                          value="summary"
                          className="flex-1 h-12 rounded-none border-0 bg-transparent text-sm font-medium text-on-surface-variant data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-material"
                        >
                          AI 요약
                        </TabsTrigger>
                        <TabsTrigger 
                          value="chat"
                          className="flex-1 h-12 rounded-none border-0 bg-transparent text-sm font-medium text-on-surface-variant data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-material"
                        >
                          채팅
                        </TabsTrigger>
                      </div>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="speech" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col">
                    <div className="flex-1 min-h-0 relative">
                      <SpeechContentBody messages={speechMessages} />
                      <DebateScrollButtons />
                    </div>
                    {/* 발언 내용 탭에서도 발언자 모드일 때 발언 입력 영역 표시 */}
                    {participationMode === PARTICIPATION_ROLES[0] && (
                      <div className="flex-shrink-0">
                        <SpeechInput
                          onSendSpeech={handleSendSpeech}
                          isRecording={isRecording}
                          onToggleRecording={handleToggleRecording}
                          isActive={canSpeak}
                        />
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="summary" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col">
                    <div className="flex-1 min-h-0">
                      <AISummaryBody summaries={aiSummaries} isGenerating={isGeneratingAISummary} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="chat" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col">
                    {!isDesktop && (
                      <ChatSectionBody 
                        messages={chatMessages}
                        onSendMessage={handleSendMessage}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
        </div>

        {!isVideoMode && (
            <div className="hidden lg:flex lg:flex-col lg:w-1/4 h-full border-l border-divider bg-surface elevation-1">
            <div className="flex-shrink-0 bg-surface-variant/30" style={{ height: `${aiSummaryHeight}px` }}>
              <AISummary summaries={aiSummaries} isGenerating={isGeneratingAISummary} />
            </div>
            
            {/* 리사이즈 핸들 */}
            <div 
              className="h-1 bg-divider hover:bg-primary/50 cursor-ns-resize transition-colors duration-200 relative group"
              onMouseDown={handleResize}
            >
              <div className="absolute inset-0 -my-1"></div>
            </div>
            
            {/* 채팅 영역 - 나머지 공간 */}
            <div className="flex-1 min-h-0">
              {isDesktop && (
                <ChatSection 
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                />
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* 모달들 */}
      <ShareRoomModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomId={debateRoomInfo.id}
        title={debateRoomInfo.title}
      />


      <DebateExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={handleExtensionModalClose}
        onExtend={handleExtendDebate}
        onEndDebate={handleManualDebateEnd}
        remainingTime={formatTime(debateTimeLeft)}
      />

      <DebateExitConfirmModal
        isOpen={isLeaveModalOpen}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
        context="debate"
      />

      <AiSummaryLoadingModal 
        isOpen={isAiSummaryLoadingOpen}
        onComplete={handleAiSummaryLoadingComplete}
        debateTitle={debateRoomInfo.title}
      />

      <AiDebateSummaryModal
        isOpen={isAiSummaryModalOpen}
        onClose={handleAiSummaryModalClose}
        onRequestExit={handleAiSummaryExitRequest}
        summary={debateSummary}
      />

      <DebateExitConfirmModal
        isOpen={isExitConfirmModalOpen}
        onClose={handleExitCancel}
        onConfirm={handleExitConfirm}
        context="summary"
      />

      <SpeakerNotificationModal
        isOpen={isSpeakerNotificationOpen}
        onClose={() => setIsSpeakerNotificationOpen(false)}
      />
    </>
  );
}