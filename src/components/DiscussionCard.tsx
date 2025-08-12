import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DebateType, DiscussionStatus } from '../types/discussion';
import { MaterialCard, MaterialButton } from './MaterialDesign';
import { Brain } from 'lucide-react';

interface DiscussionCardProps {
  id?: string;
  type: DebateType;
  status: DiscussionStatus;
  title: string;
  category: string;
  timeStatus: string;
  speakers: { current: number; max: number };
  audience: { current: number; max: number };
  onJoin?: () => void;
  onViewSummary?: (discussionId: string) => void;
}

export function DiscussionCard({
  id,
  type,
  status,
  title,
  category,
  timeStatus,
  speakers,
  audience,
  onJoin,
  onViewSummary
}: DiscussionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case '진행중':
        return 'bg-green-500 text-white';
      case '대기중':
        return 'bg-yellow-500 text-white';
      case '종료됨':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeColor = (type: string) => {
    return type === '3분토론' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white';
  };

  return (
    <MaterialCard 
      clickable 
      className="h-full flex flex-col group"
      onClick={onJoin}
    >
      <div className="p-4 flex-grow">
        <div className="flex gap-2 mb-3">
          <Badge className={`${getTypeColor(type)} rounded-full px-2 py-1`}>{type}</Badge>
          <Badge className={`${getStatusColor(status)} rounded-full px-2 py-1`}>
            {status === '진행중' && <div className="w-2 h-2 bg-current rounded-full animate-pulse mr-1 inline-block" />}
            {status}
          </Badge>
        </div>
        
        <h3 className="mb-3 line-clamp-2 font-medium text-on-surface">{title}</h3>
        
        <p className="text-sm text-on-surface-variant mb-1 caption">{category}</p>
        <p className="text-sm text-on-surface-variant mb-4 caption">{timeStatus}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="border-divider text-on-surface-variant bg-surface-variant/50 rounded-full">
            발언자 {speakers.current}/{speakers.max}명
          </Badge>
          <Badge variant="outline" className="border-divider text-on-surface-variant bg-surface-variant/50 rounded-full">
            청중 {audience.current}/{audience.max}명
          </Badge>
        </div>
      </div>
      
      <div className="p-4 pt-0">
{status === '종료됨' ? (
          <MaterialButton 
            variant="contained"
            color="secondary"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              if (id && onViewSummary) {
                onViewSummary(id);
              }
            }}
          >
            <Brain className="h-4 w-4 mr-2" />
            AI 토론 요약
          </MaterialButton>
        ) : (
          <MaterialButton 
            variant="contained"
            color="primary"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.();
            }}
          >
            토론 참여하기
          </MaterialButton>
        )}
      </div>
    </MaterialCard>
  );
}