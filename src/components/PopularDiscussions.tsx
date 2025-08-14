import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { DiscussionCard } from './DiscussionCard';
import { JoinDiscussionModal } from './modal/JoinDiscussionModal';
import { AiDebateSummaryModal } from './modal/AiDebateSummaryModal';
import { Discussion, DebateSummary } from '../types/discussion';
import { getDebateSummaryByDiscussionId } from '../mock/debateSummaries';
import { debateApi } from '../lib/api/apiClient';



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

  // 인기 토론 데이터 로드
  useEffect(() => {
    const loadPopularDebateRooms = async () => {
      try {
        const apiData = await debateApi.getAllDebateRooms();
        
        // 카테고리 매핑 함수
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

        // API 응답을 Discussion 인터페이스에 맞게 변환
        const convertedDiscussions: Discussion[] = apiData.map((room: any) => ({
          id: room.roomId,
          type: room.debateType === 'FAST' ? '3분토론' : '일반토론',
          status: room.status === 'waiting' ? '대기중' : '진행중',
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
          }
        }));
        
        // 현재 청중 수로 내림차순 정렬 후 상위 6개만 선택
        const topDiscussions = convertedDiscussions
          .sort((a, b) => b.audience.current - a.audience.current)
          .slice(0, 6);
        
        setDiscussions(topDiscussions);
      } catch (error) {
        console.error('인기 토론방 데이터 로드 실패:', error);
        setDiscussions([]);
      }
    };

    loadPopularDebateRooms();
  }, []);

  const handleJoinDiscussion = (discussionId: string) => {
    const discussion = discussions.find(d => d.id === discussionId);
    if (discussion) {
      setSelectedDiscussion(discussion);
      setIsJoinModalOpen(true);
    }
  };

  const handleJoinConfirm = (discussionId: string, nickname: string, role: 'speaker' | 'audience') => {
    console.log('토론방 입장:', { discussionId, nickname, role });
    // 실제로는 사용자 정보를 저장하고 토론방으로 이동
    onJoinDebate?.();
  };

  const handleViewSummary = (discussionId: string) => {
    const summary = getDebateSummaryByDiscussionId(discussionId);
    if (summary) {
      setSelectedSummary(summary);
      setIsSummaryModalOpen(true);
    } else {
      console.log('해당 토론방의 요약을 찾을 수 없습니다:', discussionId);
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