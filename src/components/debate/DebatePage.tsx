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
import { MOCK_SPEECH_MESSAGES } from '../../mock/speechMessages';
import { MOCK_AI_SUMMARIES } from '../../mock/aiSummaries';
import { MOCK_CHAT_MESSAGES, ChatMessage } from '../../mock/chatMessages';
import { MOCK_DEBATE_SUMMARIES } from '../../mock/debateSummaries';
import { useWebSocket } from '../../hooks/useWebSocket';
import { AiDebateSummaryModal } from '../modal/AiDebateSummaryModal';
import { AiSummaryLoadingModal } from '../modal/AiSummaryLoadingModal';
import { Position, ParticipationRole, SpeechInputType, PARTICIPATION_ROLES, POSITIONS, SPEECH_INPUT_TYPES } from '../../types/discussion';
import { toast } from "sonner";

interface DebatePageProps {
  onNavigate?: (page: 'landing' | 'browser' | 'debate') => void;
  onGoBack?: () => void;
  debateRoomInfo: DebateRoomInfo;
}

export function DebatePage({ onNavigate, onGoBack, debateRoomInfo }: DebatePageProps) {
  const { nickname, isLoggedIn, user } = useUser();
  
  // 웹소켓 훅 초기화
  const { sendChatMessage, isConnected } = useWebSocket({
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
      }
    }
  });
  const [participationMode, setParticipationMode] = useState<ParticipationRole>(PARTICIPATION_ROLES[1]); // '청중'
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
  const [currentSpeakerTimeLeft, setCurrentSpeakerTimeLeft] = useState(18);
  const [debateTimeLeft, setDebateTimeLeft] = useState(5 * 60); // 5분을 초 단위로
  const [debateStartTime, setDebateStartTime] = useState<Date | null>(new Date('2025-08-09T23:15:00')); // 토론 시작 시간 고정
  const [isDebateStarted, setIsDebateStarted] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 발언자 목록 상태 관리
  const [speakers, setSpeakers] = useState<Speaker[]>(() => {
    return MOCK_SPEAKERS.map((speaker, index) => ({
      ...speaker,
      isCreator: index === 0 && debateRoomInfo.isCreatedByUser
    }));
  });

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

  // 토론방 입장 시 로직
  useEffect(() => {
    setHasEnteredRoom(true);
    // userPosition이 이미 설정되어 있으면 해당 입장으로 설정 (JoinDiscussionModal에서 선택한 입장)
    if (debateRoomInfo.userPosition) {
      setCurrentPosition(debateRoomInfo.userPosition === 'A입장' ? POSITIONS[0] : POSITIONS[1]);
    } else {
      // 청중으로 참여하는 경우 기본 입장을 null로 설정
      setCurrentPosition(null);
    }
  }, [debateRoomInfo.userPosition]);

  const [speechMessages, setSpeechMessages] = useState(MOCK_SPEECH_MESSAGES);
  const [aiSummaries, setAiSummaries] = useState(MOCK_AI_SUMMARIES);
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);
  
  // 현재 발언자 추적 (mock 데이터로 시작)
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(() => {
    // 발언 중인 speaker 찾기
    const speakingSpeaker = MOCK_SPEAKERS.find(speaker => speaker.status === '발언중');
    return speakingSpeaker || null;
  });


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
  const handleAiSummaryLoadingComplete = () => {
    setIsAiSummaryLoadingOpen(false);
    setIsAiSummaryModalOpen(true);
  };

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
      setCurrentSpeakerTimeLeft(prev => {
        if (prev <= 1) {
          return 30; // 새로운 발언자로 전환 (30초로 리셋)
        }
        return prev - 1;
      });

      setDebateTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timerRef.current!);
          // 토론 시간 소진 시 바로 토론 종료 처리 (연장 모달 건너뛰기)
          handleDebateEnd();
          return 0;
        }
        
        // 3분(180초) 미만 남았을 때 연장 모달 표시 (한 번만)
        if (prev === 180 && !hasShownExtensionModal) {
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
  }, [handleDebateEnd, hasShownExtensionModal, isDebateFinished]);

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
    setParticipationMode(mode);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleStartDebate = () => {
    const startTime = new Date();
    setDebateStartTime(startTime);
    setIsDebateStarted(true);
    console.log('토론 시작하기:', startTime);
  };

  const handleLeaveRoom = () => {
    setIsLeaveModalOpen(true);
  };

  const handleConfirmLeave = () => {
    setIsLeaveModalOpen(false);
    
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
    if (participationMode === PARTICIPATION_ROLES[0] && nickname && currentPosition) {
      // 새로운 발언을 speechMessages에 추가
      const newSpeech = {
        id: `speech-${Date.now()}`,
        speakerName: nickname,
        position: currentPosition,
        content: content,
        timestamp: new Date(),
        // AI 팩트체크는 실제로는 백엔드에서 처리되겠지만, 여기서는 mock 데이터로 처리
        factCheck: undefined // 일단 팩트체크 없이 추가, 추후 AI가 분석 후 업데이트
      };
      
      setSpeechMessages(prev => [...prev, newSpeech]);
      
      // 음성 발언과 텍스트 발언을 구분하여 로그 출력
      if (type === SPEECH_INPUT_TYPES[0]) {
        console.log('음성 발언 추가됨:', newSpeech);
      } else {
        console.log('텍스트 발언 추가됨:', newSpeech);
      }

      // 사용자 발언은 즉시 AI 요약 생성 대기열에 추가
      // useEffect에서 자동으로 처리됨
    }
  }, [participationMode, nickname, currentPosition]);

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
  const generateDebateSummary = () => {
    const completedSummary = {
      id: `summary-${debateRoomInfo.id}`,
      discussionId: debateRoomInfo.id,
      debateType: debateRoomInfo.debateType,
      title: debateRoomInfo.title,
      category: debateRoomInfo.category,
      duration: Math.ceil(debateRoomInfo.duration / 60), // 초를 분으로 변환
      participantCount: debateRoomInfo.currentSpeakers + debateRoomInfo.currentAudience,
      keyStatements: {
        aSide: ["AI 기술은 창의성 영역에서 인간의 보조 도구로서 새로운 가능성을 열어주고 있습니다."],
        bSide: ["진정한 창의성은 인간의 감정과 경험에서 나오는 것으로, AI로는 대체할 수 없는 고유한 영역입니다."]
      },
      publicOpinion: {
        totalVotes: 127,
        aPercentage: 58,
        bPercentage: 42
      },
      finalConclusion: "AI와 인간의 창의성은 대립이 아닌 상호 보완적 관계로 발전해 나가야 한다는 것이 이번 토론의 핵심 결론입니다.",
      summary: "이번 토론에서는 AI 기술이 창의성 영역에 미치는 영향에 대해 심도 있는 논의가 이루어졌습니다.",
      completedAt: new Date()
    };
    return completedSummary;
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
                  status={isDebateFinished ? "종료" : "진행중"}
                  audienceCount={45}
                  remainingTime={formatTime(debateTimeLeft)}
                  onShowExtensionModal={() => setIsExtensionModalOpen(true)}
                />
                <CurrentSpeaker
                  speaker={{
                    name: '김민수',
                    position: POSITIONS[0],
                    avatar: ''
                  }}
                  stage="1. 발언"
                  timeProgress={((30 - currentSpeakerTimeLeft) / 30) * 100}
                  remainingSeconds={currentSpeakerTimeLeft}
                />
                <PositionSelector
                  supportRatio={67}
                  currentPosition={currentPosition}
                  onPositionChange={handlePositionChange}
                  debateTitle={debateRoomInfo.title}
                  category={debateRoomInfo.category}
                  debateType={debateRoomInfo.debateType}
                  aDescription={debateRoomInfo.aDescription}
                  bDescription={debateRoomInfo.bDescription}
                  isUserCurrentlySpeaking={participationMode === PARTICIPATION_ROLES[0] && currentSpeaker?.name === (isLoggedIn ? user?.username : nickname)}
                  isSpeakerMode={participationMode === PARTICIPATION_ROLES[0]}
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
                    isActive={!isDebateFinished}
                  />
                </div>
              )}
            </div>

            {/* 모바일 레이아웃 */}
            <div className="lg:hidden flex flex-col h-full">
              {/* 모바일 상단 고정 영역 */}
              <div className="flex-shrink-0 border-b border-divider bg-surface elevation-2">
                <DebateInfo
                  status={isDebateFinished ? "종료" : "진행중"}
                  audienceCount={45}
                  remainingTime={formatTime(debateTimeLeft)}
                  onShowExtensionModal={() => setIsExtensionModalOpen(true)}
                />
                <CurrentSpeaker
                  speaker={{
                    name: '김민수',
                    position: POSITIONS[0],
                    avatar: ''
                  }}
                  stage="1. 발언"
                  timeProgress={((30 - currentSpeakerTimeLeft) / 30) * 100}
                  remainingSeconds={currentSpeakerTimeLeft}
                />
                <PositionSelector
                  supportRatio={67}
                  currentPosition={currentPosition}
                  onPositionChange={handlePositionChange}
                  debateTitle={debateRoomInfo.title}
                  category={debateRoomInfo.category}
                  debateType={debateRoomInfo.debateType}
                  aDescription={debateRoomInfo.aDescription}
                  bDescription={debateRoomInfo.bDescription}
                  isUserCurrentlySpeaking={participationMode === PARTICIPATION_ROLES[0] && currentSpeaker?.name === (isLoggedIn ? user?.username : nickname)}
                  isSpeakerMode={participationMode === PARTICIPATION_ROLES[0]}
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
                          isActive={!isDebateFinished}
                        />
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="summary" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col">
                    <div className="flex-1 min-h-0">
                      <AISummaryBody summaries={aiSummaries} isGenerating={isGeneratingAISummary} />
                    </div>
                    {/* AI 요약 탭이 활성화된 경우에만 발언 입력 영역 표시 (발언자 모드 조건 유지) */}
                    {participationMode === PARTICIPATION_ROLES[0] && (
                      <div className="flex-shrink-0">
                        <SpeechInput
                          onSendSpeech={handleSendSpeech}
                          isRecording={isRecording}
                          onToggleRecording={handleToggleRecording}
                          isActive={!isDebateFinished}
                        />
                      </div>
                    )}
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
            {/* AI 요약 영역 - 상단 고정 영역과 동일한 높이 */}
            <div className="flex-shrink-0 h-[260px] bg-surface-variant/30">
              <AISummary summaries={aiSummaries} isGenerating={isGeneratingAISummary} />
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
        onExitRequest={handleAiSummaryExitRequest}
        summary={generateDebateSummary()}
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