import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { DiscussionStatus, Position, DISCUSSION_STATUSES, POSITIONS } from '../../types/discussion';

interface DebateStatusProps {
  status: DiscussionStatus;
  audienceCount: number;
  remainingTime: string;
  supportRatio: number; // 0-100, A입장 비율
  currentPosition?: Position | null;
  onPositionChange: (position: Position) => void;
  onShowExtensionModal?: () => void;
}

export function DebateStatus({
  status,
  audienceCount,
  remainingTime,
  supportRatio,
  currentPosition,
  onPositionChange,
  onShowExtensionModal
}: DebateStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case DISCUSSION_STATUSES[0]: // '진행중'
        return 'bg-green-500 text-white';
      case DISCUSSION_STATUSES[1]: // '대기중'
        return 'bg-yellow-500 text-white';
      case DISCUSSION_STATUSES[2]: // '종료됨'
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 상태 바 */}
      <div className="flex items-center justify-between">
        <Badge className={getStatusColor(status)}>{status}</Badge>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">참여중인 청중</p>
          <p>{audienceCount}명</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">남은 토론 시간</p>
          <p 
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={onShowExtensionModal}
            title="클릭하여 토론 연장 신청"
          >
            {remainingTime}
          </p>
        </div>
      </div>

      {/* 여론 컴포넌트 */}
      <div className="space-y-4">
        <h4>실시간 여론</h4>
        
        {/* 여론 프로그래스 바 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={`text-green-600 ${
              currentPosition === POSITIONS[0] ? 'font-bold border-2 border-green-500 rounded px-2 py-1 bg-green-50' : ''
            }`}>
              {POSITIONS[0]} {supportRatio}%
            </span>
            <span className={`text-red-600 ${
              currentPosition === POSITIONS[1] ? 'font-bold border-2 border-red-500 rounded px-2 py-1 bg-red-50' : ''
            }`}>
              {POSITIONS[1]} {100 - supportRatio}%
            </span>
          </div>
          <Progress value={supportRatio} className="h-3" />
        </div>

        {/* 입장 선택 버튼 */}
        <div className="flex gap-4">
          <Button
            variant={currentPosition === POSITIONS[0] ? 'default' : 'outline'}
            className={`flex-1 ${
              currentPosition === POSITIONS[0] 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'hover:bg-green-50 hover:text-green-600 hover:border-green-300'
            }`}
            onClick={() => onPositionChange(POSITIONS[0])}
          >
            {POSITIONS[0]}
          </Button>
          <Button
            variant={currentPosition === POSITIONS[1] ? 'default' : 'outline'}
            className={`flex-1 ${
              currentPosition === POSITIONS[1] 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'hover:bg-red-50 hover:text-red-600 hover:border-red-300'
            }`}
            onClick={() => onPositionChange(POSITIONS[1])}
          >
            {POSITIONS[1]}
          </Button>
        </div>
      </div>
    </div>
  );
}