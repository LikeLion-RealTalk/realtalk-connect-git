import { DiscussionCard } from '../DiscussionCard';
import { Discussion } from '../../types/discussion';

interface DiscussionsListProps {
  discussions: Discussion[];
  onJoinDiscussion?: (discussionId: string) => void;
  onViewSummary?: (discussionId: string) => void;
}

export function DiscussionsList({ discussions, onJoinDiscussion, onViewSummary }: DiscussionsListProps) {
  if (discussions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">검색 조건에 맞는 토론방이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {discussions.map((discussion) => (
        <DiscussionCard 
          key={discussion.id} 
          {...discussion} 
          onJoin={() => onJoinDiscussion?.(discussion.id)}
          onViewSummary={onViewSummary}
        />
      ))}
    </div>
  );
}