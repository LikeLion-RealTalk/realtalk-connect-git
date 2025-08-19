import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LogOut, Play, Menu, X, Users } from 'lucide-react';
import { cn } from '../ui/utils';
import { MaterialCard } from '../MaterialDesign';
import { Position, SpeakerStatus, POSITIONS, SPEAKER_STATUSES } from '../../types/discussion';

interface Speaker {
  id: string;
  name: string;
  avatar?: string;
  position: Position;
  status: SpeakerStatus;
  isCreator?: boolean;
}

interface SpeakersSidebarProps {
  speakers: Speaker[];
  debateStartTime?: Date;
  isDebateStarted: boolean;
  onStartDebate: () => void;
  onLeaveRoom: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isRoomOwner?: boolean;
  roomStatus?: string;
}

// 발언자 카드 배경색 (입장에 따른 색상)
const getCardBackgroundColor = (position: Position) => {
  return position === POSITIONS[0] ? 'bg-green-300' : 'bg-red-300'; // A입장: 진한 녹색, B입장: 진한 빨간색
};

const getStatusColor = (status: string) => {
  switch (status) {
    case SPEAKER_STATUSES[0]: // '발언중'
      return 'bg-blue-400 text-white';
    case SPEAKER_STATUSES[1]: // '대기중'
      return 'bg-yellow-400 text-yellow-950';
    case SPEAKER_STATUSES[2]: // '발언완료'
      return 'bg-gray-400 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

export function SpeakersSidebar({
  speakers,
  debateStartTime,
  isDebateStarted,
  onStartDebate,
  onLeaveRoom,
  isCollapsed,
  onToggleCollapse,
  isOpen = false,
  onClose,
  isRoomOwner = false,
  roomStatus = 'waiting'
}: SpeakersSidebarProps) {
  // 모바일 오버레이
  if (isOpen) {
    return (
      <>
        {/* 모바일 오버레이 배경 */}
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
        
        {/* 모바일 사이드바 */}
        <div className="fixed left-0 top-0 h-full w-80 bg-surface border-r border-divider z-50 lg:hidden elevation-16">
          <SidebarContent 
            speakers={speakers}
            debateStartTime={debateStartTime}
            isDebateStarted={isDebateStarted}
            onStartDebate={onStartDebate}
            onLeaveRoom={onLeaveRoom}
            isCollapsed={false}
            isMobile={true}
            onClose={onClose}
            isRoomOwner={isRoomOwner}
            roomStatus={roomStatus}
          />
        </div>
        
        {/* 모바일 사이드바 오른쪽 토글 버튼 (사이드바가 열려있을 때) */}
        <div className="fixed left-80 top-1/2 -translate-y-1/2 z-50 lg:hidden">
          <Button
            onClick={onClose}
            className="rounded-l-none rounded-r-lg elevation-4 hover:elevation-6 transition-elevation bg-primary text-on-primary p-2 h-12"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </>
    );
  }

  // 데스크톱 사이드바 - 1:2:1 비율에서 사이드바는 고정 너비
  return (
    <div className="h-full w-full bg-surface elevation-1">
      <SidebarContent 
        speakers={speakers}
        debateStartTime={debateStartTime}
        isDebateStarted={isDebateStarted}
        onStartDebate={onStartDebate}
        onLeaveRoom={onLeaveRoom}
        isCollapsed={false}
        onToggleCollapse={onToggleCollapse}
        isMobile={false}
        isRoomOwner={isRoomOwner}
        roomStatus={roomStatus}
      />
    </div>
  );
}

// 사이드바 내용 컴포넌트 분리
function SidebarContent({
  speakers,
  debateStartTime,
  isDebateStarted,
  onStartDebate,
  onLeaveRoom,
  isCollapsed,
  onToggleCollapse,
  isMobile = false,
  onClose,
  isRoomOwner = false,
  roomStatus = 'waiting'
}: {
  speakers: Speaker[];
  debateStartTime?: Date;
  isDebateStarted: boolean;
  onStartDebate: () => void;
  onLeaveRoom: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onClose?: () => void;
  isRoomOwner?: boolean;
  roomStatus?: string;
}) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* 헤더 영역 */}
      <div className="p-4 border-b border-divider flex items-center justify-between bg-surface elevation-1">
        <h4 className="flex items-center gap-2 text-on-surface font-medium">
          <Users className="h-5 w-5 text-primary" />
          발언자 목록 ({speakers.length}명)
        </h4>
      </div>

      {/* 발언자 목록 */}
      <div className="flex-1 p-4 space-y-3 min-h-0 overflow-y-auto bg-background">
        {speakers.map((speaker) => (
          <MaterialCard
            key={speaker.id}
            elevation={speaker.status === '발언중' ? 4 : 1}
            className={`transition-elevation ${getCardBackgroundColor(speaker.position)} ${
              speaker.status === SPEAKER_STATUSES[0] // '발언중'
                ? 'border-2 border-primary ring-2 ring-primary/20' 
                : ''
            }`}
          >
            <div className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 elevation-1">
                  <AvatarImage src={speaker.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {speaker.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate flex items-center gap-1 text-on-surface font-medium">
                    {speaker.name}
                    {speaker.isCreator && <span>👑</span>}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <Badge 
                      className={`${getStatusColor(speaker.status)} rounded-full text-xs`}
                    >
                      {speaker.status === SPEAKER_STATUSES[0] && ( // '발언중'
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse mr-1 inline-block" />
                      )}
                      {speaker.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </MaterialCard>
        ))}
      </div>

      {/* 하단 액션 버튼들 */}
      <div className="p-4 space-y-3 border-t border-divider bg-surface elevation-2">
        {/* 토론 시간 정보 또는 시작 버튼 */}
        {isDebateStarted ? (
          <MaterialCard className="text-center">
            <div className="p-3">
              <p className="text-sm text-on-surface-variant mb-2 caption">토론 시작 시간</p>
              <p className="text-sm text-on-surface font-medium">
                {debateStartTime ? (() => {
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const startDate = new Date(debateStartTime.getFullYear(), debateStartTime.getMonth(), debateStartTime.getDate());
                  
                  const timeString = debateStartTime.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  });
                  
                  if (startDate.getTime() !== today.getTime()) {
                    const dateString = debateStartTime.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\./g, '-').replace(/ /g, '').slice(0, -1);
                    
                    return `${dateString} ${timeString}`;
                  }
                  
                  return timeString;
                })() : '방금 전'}
              </p>
            </div>
          </MaterialCard>
        ) : (
          // 방장일 때만 토론 시작 버튼 표시
          isRoomOwner && (
            <Button 
              onClick={onStartDebate} 
              disabled={roomStatus !== 'waiting'}
              className="w-full bg-primary text-on-primary hover:bg-primary-variant transition-material elevation-2 hover:elevation-4 disabled:opacity-50 disabled:cursor-not-allowed"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              토론 시작하기
            </Button>
          )
        )}
        
        {/* 나가기 버튼 */}
        <Button 
          variant="destructive" 
          onClick={onLeaveRoom}
          className="w-full bg-error text-on-error hover:bg-error/90 transition-material elevation-1 hover:elevation-3"
          size="sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          토론방 나가기
        </Button>
      </div>
    </div>
  );
}