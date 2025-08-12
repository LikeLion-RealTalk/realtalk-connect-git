import { Badge } from '../ui/badge';
import { Users, Clock } from 'lucide-react';
import { DiscussionStatus } from '../../types/discussion';

interface DebateInfoProps {
  status: DiscussionStatus;
  audienceCount: number;
  remainingTime: string;
  onShowExtensionModal?: () => void;
}

export function DebateInfo({ status, audienceCount, remainingTime, onShowExtensionModal }: DebateInfoProps) {
  const getStatusBadgeColor = () => {
    switch (status) {
      case '진행중':
        return 'bg-green-400 text-white dark:bg-green-400 dark:text-white';
      case '대기중':
        return 'bg-blue-400 text-white dark:bg-blue-400 dark:text-white';
      case '종료됨':
        return 'bg-gray-400 text-white dark:bg-gray-400 dark:text-white';
      default:
        return 'bg-gray-400 text-white dark:bg-gray-400 dark:text-white';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50">
      {/* 왼쪽: 진행 상태 */}
      <div className="flex items-center gap-2">
        <Badge className={getStatusBadgeColor()}>
          {status === '진행중' && <div className="w-2 h-2 bg-current rounded-full animate-pulse mr-1" />}
          {status}
        </Badge>
      </div>

      {/* 중앙: 청중 수 */}
      <div className="flex items-center gap-1 text-muted-foreground">
        <Users className="w-4 h-4" />
        <span className="text-sm">청중 {audienceCount}명</span>
      </div>

      {/* 오른쪽: 남은 시간 */}
      <div 
        className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition-colors"
        onClick={onShowExtensionModal}
        title="클릭하여 토론 연장 신청"
      >
        <Clock className="w-4 h-4 text-red-600" />
        <span className="text-sm text-red-600 font-medium">{remainingTime}</span>
      </div>
    </div>
  );
}