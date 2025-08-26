import { useState, useEffect, useRef } from 'react';
import { Flame } from 'lucide-react';
import { DiscussionCard } from './DiscussionCard';
import { JoinDiscussionModal } from './modal/JoinDiscussionModal';
import { AiDebateSummaryModal } from './modal/AiDebateSummaryModal';
import { Discussion, DebateSummary } from '../types/discussion';
import { getDebateSummaryByDiscussionId } from '../mock/debateSummaries';
import { debateApi } from '../lib/api/apiClient';
import { toast } from "sonner";



interface PopularDiscussionsProps {
  onNavigate?: (page: 'landing' | 'browser' | 'debate') => void;
  onJoinDebate?: () => void;
}

export function PopularDiscussions({ onNavigate, onJoinDebate }: PopularDiscussionsProps) {
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<DebateSummary | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 카테고리 매핑 함수 (공통 함수로 추출)
  const getCategoryName = (categoryId: number) => {
    const categoryMap: { [key: number]: string } = {
      1: '💕연애',
      2: '👥친구 & 인간관계',
      3: '🏠일상 & 라이프스타일',
      4: '💼취업 & 진로',
      5: '🔥밈 & 유행',
      6: '📱SNS & 온라인 문화',
      7: '🤖AI & 미래사회',
      8: '🎮게임 & e스포츠',
      9: '🎭K-콘텐츠',
      10: '⚖️논란 & 사회 이슈',
      11: '💰돈 & 소비문화',
      12: '💬자유 주제'
    };
    return categoryMap[categoryId] || '💬자유 주제';
  };

  // API 응답을 Discussion 인터페이스에 맞게 변환하는 함수
  const convertApiDataToDiscussions = (apiData: any[]): Discussion[] => {
    const convertedDiscussions: Discussion[] = apiData.map((room: any) => ({
      id: room.roomId,
      type: room.debateType === 'FAST' ? '3분토론' : '일반토론',
      status: room.status === 'waiting' ? '대기중' : room.status === 'started' ? '진행중' : '종료됨',
      title: room.title,
      category: room.category?.id ? getCategoryName(room.category.id) : '💬자유 주제',
      timeStatus: room.elapsedSeconds ? `${Math.floor(room.elapsedSeconds / 60)}분 째 진행중` : '곧 시작',
      speakers: { 
        current: room.currentSpeaker || 0, 
        max: room.maxSpeaker || 0 
      },
      audience: { 
        current: room.currentAudience || 0, 
        max: room.maxAudience || 0 
      },
      sideA: room.sideA,
      sideB: room.sideB
    }));
    
    // 현재 청중 수로 내림차순 정렬 후 상위 6개만 선택
    return convertedDiscussions
      .sort((a, b) => b.audience.current - a.audience.current)
      .slice(0, 6);
  };

  // 효율적 토론방 데이터 업데이트 함수
  const updateDiscussionsEfficiently = (newApiData: any[]) => {
    const newDiscussions = convertApiDataToDiscussions(newApiData);
    
    setDiscussions(prevDiscussions => {
      // 기존 토론방 ID 목록
      const prevIds = new Set(prevDiscussions.map(d => d.id));
      const newIds = new Set(newDiscussions.map(d => d.id));
      
      // 삭제된 토론방들 (인기 토론에서 제외된 것들)
      const removedIds = [...prevIds].filter(id => !newIds.has(id));
      
      // 새로 추가된 토론방들 (새로운 인기 토론)
      const addedDiscussions = newDiscussions.filter(d => !prevIds.has(d.id));
      
      // 기존 토론방 업데이트
      const updatedDiscussions = prevDiscussions
        .filter(d => !removedIds.includes(d.id)) // 인기 토론에서 제외된 것들 제거
        .map(prevDiscussion => {
          const newDiscussion = newDiscussions.find(d => d.id === prevDiscussion.id);
          if (newDiscussion) {
            // 실시간 업데이트가 필요한 필드들만 업데이트
            return {
              ...prevDiscussion,
              currentSpeaker: newDiscussion.speakers.current,
              currentAudience: newDiscussion.audience.current,
              status: newDiscussion.status,
              timeStatus: newDiscussion.timeStatus,
              speakers: newDiscussion.speakers,
              audience: newDiscussion.audience
            };
          }
          return prevDiscussion;
        });
      
      // 새로운 토론방 추가 및 정렬
      const finalDiscussions = [...updatedDiscussions, ...addedDiscussions];
      
      // 청중 수로 다시 정렬 (순위 변경 반영)
      return finalDiscussions.sort((a, b) => 
        b.audience.current - a.audience.current
      );
    });
  };

  // 3초 폴링 시작 함수
  const startPolling = () => {
    console.log('[인기토론] 3초 폴링 시작');
    
    const pollData = async () => {
      try {
        const apiData = await debateApi.getAllDebateRooms();
        updateDiscussionsEfficiently(apiData);
      } catch (error) {
        console.error('[인기토론] 폴링 중 오류:', error);
        toast.error('토론방 조회에 실패했습니다');
      }
    };
    
    // 3초마다 폴링
    pollingRef.current = setInterval(pollData, 3000);
  };

  // 폴링 중단 함수
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      console.log('[인기토론] 폴링 중단');
    }
  };

  // 인기 토론 데이터 로드 및 폴링 시작
  useEffect(() => {
    const loadPopularDebateRooms = async () => {
      try {
        const apiData = await debateApi.getAllDebateRooms();
        const convertedDiscussions = convertApiDataToDiscussions(apiData);
        
        setDiscussions(convertedDiscussions);
        
        // 초기 로드 완료 후 폴링 시작
        startPolling();
      } catch (error) {
        console.error('[인기토론] 초기 데이터 로드 실패:', error);
        toast.error('토론방 조회에 실패했습니다');
        setDiscussions([]);
      }
    };

    loadPopularDebateRooms();

    // 컴포넌트 언마운트 시 폴링 중단
    return () => {
      stopPolling();
    };
  }, []);

  const handleJoinDiscussion = (discussionId: string) => {
    const discussion = discussions.find(d => d.id === discussionId);
    if (discussion) {
      // 화상회의 방인지 확인 (title이 video-로 시작하는 경우)
      if (discussion.title.startsWith('video-')) {
        // video- 다음에 오는 숫자 ID 추출
        const videoRoomId = discussion.title.replace('video-', '');
        
        // 화상회의 방으로 직접 이동 (입장 선택 플로우 생략)
        window.location.href = `/debate/${discussionId}?video=true&room=${videoRoomId}`;
        
        // 폴링 중단
        stopPolling();
        return;
      }
      
      // 일반 토론방인 경우 기존 플로우
      setSelectedDiscussion(discussion);
      setIsJoinModalOpen(true);
    }
  };

  const handleJoinConfirm = (discussionId: string, nickname: string, role: 'speaker' | 'audience') => {
    console.log('토론방 입장:', { discussionId, nickname, role });
    
    // 토론방 입장 시 폴링 중단
    stopPolling();
    
    // 실제로는 사용자 정보를 저장하고 토론방으로 이동
    onJoinDebate?.();
  };

  const handleViewSummary = async (discussionId: string) => {
    try {
      const apiResponse = await debateApi.getDebateResults(discussionId);
      
      // API 응답을 DebateSummary 형식으로 변환
      const summary = {
        id: `summary-${discussionId}`,
        discussionId: discussionId,
        debateType: apiResponse.debateType === 'NORMAL' ? '일반토론' : '3분토론',
        title: apiResponse.title,
        category: apiResponse.categoryName,
        duration: Math.floor(apiResponse.durationSeconds / 60), // 초를 분으로 변환
        participantCount: apiResponse.totalCount,
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
      
      setSelectedSummary(summary);
      setIsSummaryModalOpen(true);
    } catch (error) {
      console.error('토론 요약 조회 실패:', error);
      toast.error('토론 요약을 불러오는데 실패했습니다.');
    }
  };

  return (
    <>
      <section className="py-10 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Flame className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold">지금 인기 토론</h2>
            </div>
            <p className="text-muted-foreground">실시간으로 진행되고 있는 뜨거운 토론들을 확인해보세요</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {discussions.map((discussion) => (
              <DiscussionCard 
                key={discussion.id} 
                {...discussion} 
                onJoin={() => handleJoinDiscussion(discussion.id)}
                onViewSummary={handleViewSummary}
              />
            ))}
          </div>
        </div>
      </section>

      <JoinDiscussionModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        discussion={selectedDiscussion}
        onJoin={handleJoinConfirm}
        onNavigate={onNavigate}
      />

      <AiDebateSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onRequestExit={() => setIsSummaryModalOpen(false)}
        summary={selectedSummary}
      />
    </>
  );
}