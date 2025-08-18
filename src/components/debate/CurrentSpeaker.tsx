import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Position, DebateStage } from '../../types/discussion';

interface CurrentSpeakerProps {
  speaker: {
    name: string;
    avatar?: string;
    position: Position;
  };
  stage: DebateStage;
  timeProgress: number; // 0-100
  remainingSeconds: number | null;
}

// 시간 포맷팅 함수: 60초 이상이면 분:초, 60초 미만이면 초
const formatRemainingTime = (totalSeconds: number): string => {
  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}분 ${seconds}초 남음`;
  } else {
    return `${totalSeconds}초 남음`;
  }
};

export function CurrentSpeaker({
  speaker,
  stage,
  timeProgress,
  remainingSeconds
}: CurrentSpeakerProps) {
  const positionColor = speaker.position === 'A입장' ? 'border-green-500' : 'border-red-500';
  const positionBadgeColor = speaker.position === 'A입장' ? 'bg-green-400 text-white' : 'bg-red-400 text-white';
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#11172a' }}>
        {/* 아바타 */}
        <div className="relative">
          <Avatar 
            className={`h-16 w-16 border-4 ${positionColor} animate-pulse`}
          >
            <AvatarImage src={speaker.avatar} />
            <AvatarFallback className="bg-slate-700 text-white">{speaker.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        
        {/* 발언자명 및 입장 뱃지 */}
        <div className="flex items-center gap-2">
          <h4 className="text-white text-center">{speaker.name}</h4>
          <Badge className={positionBadgeColor}>
            {speaker.position}
          </Badge>
        </div>
        
        {/* 현재 발언 단계 */}
        <div className="flex gap-2">
          <Badge 
            variant={stage === '1. 발언' ? 'default' : 'outline'}
            className={stage === '1. 발언' ? 'bg-blue-400 text-white' : 'text-slate-400 border-slate-600'}
          >
            1. 발언
          </Badge>
          <Badge 
            variant={stage === '2. 논의' ? 'default' : 'outline'}
            className={stage === '2. 논의' ? 'bg-blue-400 text-white' : 'text-slate-400 border-slate-600'}
          >
            2. 논의
          </Badge>
        </div>
        
        {/* 잔여 발언 시간 프로그래스바 */}
        <div className="w-1/3 space-y-2">
          <div className="relative">
            <Progress 
              value={timeProgress} 
              className="h-2 bg-slate-600 [&>div]:bg-blue-400" 
            />
          </div>
          <p className="text-sm text-center text-slate-400">
            {remainingSeconds !== null ? formatRemainingTime(remainingSeconds) : '--'}
          </p>
        </div>
      </div>
    </div>
  );
}