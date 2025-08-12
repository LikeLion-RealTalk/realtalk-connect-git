import { useState } from 'react';
import { Flame } from 'lucide-react';
import { DiscussionCard } from './DiscussionCard';
import { JoinDiscussionModal } from './modal/JoinDiscussionModal';
import { AiDebateSummaryModal } from './modal/AiDebateSummaryModal';
import { Discussion, DebateSummary } from '../types/discussion';
import { getDebateSummaryByDiscussionId } from '../mock/debateSummaries';



interface PopularDiscussionsProps {
  onNavigate?: (page: 'landing' | 'browser' | 'debate') => void;
  onJoinDebate?: () => void;
}

export function PopularDiscussions({ onNavigate, onJoinDebate }: PopularDiscussionsProps) {
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<DebateSummary | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const discussions: Discussion[] = [
    {
      id: '1',
      type: '3분토론' as const,
      status: '진행중' as const,
      title: 'AI 시대, 인간의 창의성은 여전히 중요할까?',
      category: '🤖AI & 미래사회',
      timeStatus: '45분 째 불타는 중',
      speakers: { current: 6, max: 8 },
      audience: { current: 45, max: 60 }
    },
    {
      id: '2',
      type: '일반토론' as const,
      status: '진행중' as const,
      title: '원격근무 vs 사무실 근무, 어떤 것이 더 효율적일까?',
      category: '💼취업 & 진로',
      timeStatus: '12분 째 진행중',
      speakers: { current: 4, max: 6 },
      audience: { current: 23, max: 40 }
    },
    {
      id: '3',
      type: '일반토론' as const,
      status: '대기중' as const,
      title: '환경보호를 위한 개인의 실천, 어디까지 해야 할까?',
      category: '⚖️논란 & 사회 이슈',
      timeStatus: '10분 후 시작',
      speakers: { current: 2, max: 8 },
      audience: { current: 15, max: 50 }
    },
    {
      id: '4',
      type: '3분토론' as const,
      status: '진행중' as const,
      title: '메타버스는 미래의 주류가 될 수 있을까?',
      category: '🤖AI & 미래사회',
      timeStatus: '23분 째 진행중',
      speakers: { current: 5, max: 6 },
      audience: { current: 38, max: 45 }
    },
    {
      id: 'discussion-1',
      type: '일반토론' as const,
      status: '종료됨' as const,
      title: '온라인 교육 vs 오프라인 교육, 어느 것이 더 효과적일까?',
      category: '💼취업 & 진로',
      timeStatus: '3시간 전 종료',
      speakers: { current: 8, max: 8 },
      audience: { current: 120, max: 120 }
    },
    {
      id: 'discussion-3',
      type: '일반토론' as const,
      status: '종료됨' as const,
      title: 'AI가 인간의 창의성을 대체할 수 있을까?',
      category: '🤖AI & 미래사회',
      timeStatus: '2일 전 종료',
      speakers: { current: 8, max: 8 },
      audience: { current: 95, max: 100 }
    }
  ];

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