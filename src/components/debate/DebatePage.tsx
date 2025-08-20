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
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Menu, Users } from 'lucide-react';
import { DebateRoomInfo } from '../../mock/debateRooms';
import { MOCK_SPEAKERS, Speaker } from '../../mock/speakers';
import { MOCK_AI_SUMMARIES } from '../../mock/aiSummaries';
import { MOCK_CHAT_MESSAGES, ChatMessage } from '../../mock/chatMessages';
import { MOCK_DEBATE_SUMMARIES } from '../../mock/debateSummaries';
import { useWebSocket } from '../../hooks/useWebSocket';
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
  
  // 웹소켓 훅 초기화
  const { sendChatMessage, sendMessage, isConnected, subscribeExpire, subscribeSpeakerExpire, joinRoom, disconnect } = useWebSocket({
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
      } else if (message.message && message.username && message.side) {
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
      }
    },
    onParticipantsUpdate: (participants) => {
      console.log('[참가자] 목록 업데이트:', participants);
      handleParticipantsUpdate(participants);
    }
  });
  // 참여 모드: 입장 시 선택한 역할에 따라 결정 (토글 불가)
  const participationMode: ParticipationRole = debateRoomInfo.userRole === 'SPEAKER' ? PARTICIPATION_ROLES[0] : PARTICIPATION_ROLES[1];
  const [currentPosition, setCurrentPosition] = useState<Position | null>(
    debateRoomInfo.userPosition || null
  );
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
  const [speakerExpireTime, setSpeakerExpireTime] = useState<Date | null>(null); // 발언자 만료 시간
  const [currentDebateStage, setCurrentDebateStage] = useState<'1. 발언' | '2. 논의'>('1. 발언'); // 현재 토론 단계
  const [maxSpeakerTime, setMaxSpeakerTime] = useState(30); // 발언 시간 총 길이
  
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
      
      // 현재 사용자 ID와 비교해서 로그 출력
      const myUserId = user?.id?.toString();
      if (myUserId === data.currentUserId) {
        console.log('[발언자] 내가 현재 발언자로 지정됨:', data.currentUserId);
      } else {
        console.log('[발언자] 다른 사용자가 발언자로 지정됨:', data.currentUserId, '내 ID:', myUserId);
      }
    } catch (error) {
      console.error('[발언자] 발언자 만료시간 파싱 실패:', error);
    }
  }, [user?.id]);

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

  // 토론방 입장 시 로직
  useEffect(() => {
    setHasEnteredRoom(true);
    
    // JOIN_ACCEPTED 후 토론방 상태 조회
    fetchDebateRoomStatus();
    
    // userPosition이 이미 설정되어 있으면 해당 입장으로 설정 (JoinDiscussionModal에서 선택한 입장)
    if (debateRoomInfo.userPosition) {
      setCurrentPosition(debateRoomInfo.userPosition === 'A입장' ? POSITIONS[0] : POSITIONS[1]);
    } else {
      // 청중으로 참여하는 경우 기본 입장을 null로 설정
      setCurrentPosition(null);
    }
  }, [debateRoomInfo.userPosition, debateRoomInfo.id]);

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
              try {
                await debateApi.sendSideInfo(debateRoomInfo.id, result.subjectId, userSide);
                console.log('[토론방] 입장 정보 전송 완료:', { roomId: debateRoomInfo.id, subjectId: result.subjectId, side: userSide });
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

  const [speechMessages, setSpeechMessages] = useState([]);
  const [aiSummaries, setAiSummaries] = useState(MOCK_AI_SUMMARIES);
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);
  
  // 현재 발언자 추적 (웹소켓 데이터 기반)
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);


  // 새로운 발언에 대한 AI 요약 자동 생성 (다른 발언자들의 발언 포함)
  useEffect(() => {
    const existingSummaryIds = new Set(aiSummaries.map(summary => summary.id.replace('summary-', 'speech-')));
    const newSpeeches = speechMessages.filter(speech => !existingSummaryIds.has(speech.id));
    
    if (newSpeeches.length > 0) {
      setIsGeneratingAISummary(true);
    }
    
    newSpeeches.forEach((speech, index) => {
      // 각 발언마다 다른 지연 시간 적용 (2-5초 랜덤)
      const summaryDelay = Math.random() * 3000 + 2000 + (index * 1000);
      setTimeout(() => {
        generateAISummaryForSpeech(speech);
        // 마지막 요약이 생성되면 로딩 상태 해제
        if (index === newSpeeches.length - 1) {
          setTimeout(() => setIsGeneratingAISummary(false), 500);
        }
      }, summaryDelay);
    });
  }, [speechMessages, aiSummaries]);

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

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      // speaker expire 타이머가 별도로 관리되므로 여기서는 debateTimeLeft만 관리
      setDebateTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timerRef.current!);
          // 토론 시간 소진 시 바로 토론 종료 처리 (연장 모달 건너뛰기)
          handleDebateEnd();
          return 0;
        }
        
        // 동적 계산된 기준 시간 이하로 남았을 때 연장 모달 표시 (한 번만)
        const threshold = getExtensionThreshold();
        if (threshold !== null && prev === threshold && !hasShownExtensionModal) {
          console.log(`[토론방] 연장 모달 표시 - 남은시간: ${prev}초, 기준: ${threshold}초`);
          setIsExtensionModalOpen(true);
          setHasShownExtensionModal(true);
        }
        
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
        // 사용자가 선택한 A/B 입장 사용 (확실함)
        console.log('[발언] userSelectedSide:', debateRoomInfo.userSelectedSide);
        console.log('[발언] userPosition:', debateRoomInfo.userPosition);
        
        const userSide: 'A' | 'B' = debateRoomInfo.userSelectedSide || 'A';
        console.log('[발언] 계산된 userSide:', userSide);
        
        const speechMessage = {
          roomUUID: debateRoomInfo.id,
          userId: user.id,
          message: content,
          side: userSide
        };
        
        console.log('[발언] 채팅 메시지 전송:', speechMessage);
        sendMessage('/pub/speaker/text', speechMessage);
        
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

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
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

  // AI 요약 자동 생성 함수 (외부 발언용)
  const generateAISummaryForSpeech = useCallback((speech: any) => {
    // 이미 요약이 존재하는지 확인
    const existingSummary = aiSummaries.find(summary => 
      summary.id === `summary-${speech.id.replace('speech-', '')}`
    );
    
    if (existingSummary) {
      return; // 이미 요약이 존재하면 생성하지 않음
    }

    const positionText = speech.position === POSITIONS[0] ? 'A입장' : 'B입장';
    const content = speech.content;
    
    // 발언 내용의 키워드를 바탕으로 요약 생성
    let summaryText = '';
    
    if (content.includes('장점') || content.includes('이점') || content.includes('좋은')) {
      summaryText = `${speech.speakerName}님이 ${positionText}의 장점과 긍정적 측면을 강조하며 논증했습니다.`;
    } else if (content.includes('문제') || content.includes('단점') || content.includes('위험')) {
      summaryText = `${speech.speakerName}님이 ${positionText}에서 현재 상황의 문제점과 위험성을 지적했습니다.`;
    } else if (content.includes('해결') || content.includes('방안') || content.includes('개선')) {
      summaryText = `${speech.speakerName}님이 ${positionText}에서 구체적인 해결방안과 개선책을 제시했습니다.`;
    } else if (content.includes('예시') || content.includes('사례') || content.includes('경험')) {
      summaryText = `${speech.speakerName}님이 ${positionText}을 뒷받침하는 구체적 사례와 경험을 제시했습니다.`;
    } else if (content.includes('반대') || content.includes('반박') || content.includes('비판')) {
      summaryText = `${speech.speakerName}님이 상대방 논리에 대한 반박과 비판적 관점을 제시했습니다.`;
    } else if (content.includes('데이터') || content.includes('통계') || content.includes('연구')) {
      summaryText = `${speech.speakerName}님이 ${positionText}을 뒷받침하는 객관적 데이터와 연구 결과를 제시했습니다.`;
    } else if (content.includes('경제') || content.includes('비용') || content.includes('효율')) {
      summaryText = `${speech.speakerName}님이 ${positionText}의 경제적 측면과 효율성에 대해 분석했습니다.`;
    } else if (content.includes('사회') || content.includes('공동체') || content.includes('사람')) {
      summaryText = `${speech.speakerName}님이 ${positionText}의 사회적 영향과 공동체에 미치는 효과를 강조했습니다.`;
    } else if (content.includes('미래') || content.includes('전망') || content.includes('발전')) {
      summaryText = `${speech.speakerName}님이 ${positionText}의 미래 전망과 발전 가능성에 대해 논의했습니다.`;
    } else if (content.includes('현실') || content.includes('실제') || content.includes('현장')) {
      summaryText = `${speech.speakerName}님이 ${positionText}의 현실적 적용과 실제 상황을 고려한 관점을 제시했습니다.`;
    } else {
      // 기본 템플릿
      const summaryTemplates = [
        `${speech.speakerName}님이 ${positionText}에서 핵심 논점을 체계적으로 제시했습니다.`,
        `${speech.speakerName}님의 발언에서 중요한 근거와 논리적 분석이 이루어졌습니다.`,
        `${speech.speakerName}님이 ${positionText}의 관점에서 깊이 있는 분석을 제공했습니다.`,
        `${speech.speakerName}님이 토론 주제에 대한 새로운 시각을 제시했습니다.`,
        `${speech.speakerName}님이 ${positionText}의 논리적 근거를 명확히 설명했습니다.`,
        `${speech.speakerName}님의 발언에서 설득력 있는 주장과 논증이 전개되었습니다.`
      ];
      summaryText = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)];
    }
    
    const newSummary = {
      id: `summary-${speech.id.replace('speech-', '')}`,
      speakerName: speech.speakerName,
      position: speech.position,
      summary: summaryText,
      timestamp: new Date()
    };

    setAiSummaries(prev => [...prev, newSummary]);
    console.log('AI ���약 생성됨:', newSummary);
  }, []);

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

  // 발언 권한 체크: 토론이 끝나지 않았고, 발언자 모드에서 현재 발언자 ID가 내 ID와 같고, '1. 발언' 단계이면서 발언 시간이 남은 경우에만 활성화
  const canSpeak = !isDebateFinished && 
    (participationMode === PARTICIPATION_ROLES[0] && 
     currentUserId && 
     user?.id?.toString() === currentUserId && 
     currentDebateStage === '1. 발언' && 
     currentSpeakerTimeLeft !== null && 
     currentSpeakerTimeLeft > 0);

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
          {/* 데스크톱 왼쪽 사이드바 - 1/4 너비 */}
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

          {/* 모바일 사이드바 토글 버튼 (숨김 상태일 때 화면에 표시) */}
          {!isMobileSidebarOpen && (
            <div className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-30">
              <Button
                onClick={handleToggleMobileSidebar}
                className="rounded-l-none rounded-r-lg elevation-4 hover:elevation-6 transition-elevation bg-primary/80 hover:bg-primary/90 backdrop-blur-sm text-on-primary p-2 h-12 border border-primary/20"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* 모바일 사이드바 오버레이 (조건부 렌더링) */}
          {isMobileSidebarOpen && (
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

          {/* 중앙 토론 영역 - 데스크톱: 2/4 너비, 모바일: 전체 너비 */}
          <div className="flex-1 lg:w-2/4 h-full flex flex-col bg-background">
            {/* 데스크톱 레이아웃 */}
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

          {/* 우측 영역 - 1/4 너비, 데스크톱에서만 표시 */}
          <div className="hidden lg:flex lg:flex-col lg:w-1/4 h-full border-l border-divider bg-surface elevation-1">
            {/* AI 요약 영역 - 리사이즈 가능한 높이 */}
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
    </>
  );
}