import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Discussion, UserRole, ParticipationRole, DISCUSSION_STATUSES } from '../types/discussion';



interface JoinDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussion: Discussion | null;
  onJoin: (discussionId: string, nickname: string, role: UserRole, participationMode?: ParticipationRole) => void;
}

export function JoinDiscussionModal({ 
  isOpen, 
  onClose, 
  discussion, 
  onJoin 
}: JoinDiscussionModalProps) {
  if (!discussion) return null;

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

  const getTypeColor = (type: string) => {
    return type === '3분토론' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white';
  };

  const handleJoinAsSpeaker = () => {
    onJoin(discussion.id, '', 'speaker', '발언자');
    onClose();
  };

  const handleJoinAsAudience = () => {
    onJoin(discussion.id, '', 'audience', '청중');
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const isSpeakerFull = discussion.speakers.current >= discussion.speakers.max;
  const isAudienceFull = discussion.audience.current >= discussion.audience.max;
  const canJoin = discussion.status !== DISCUSSION_STATUSES[2]; // '종료됨'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-2 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>토론방 입장</DialogTitle>
          <DialogDescription>
            닉네임을 설정하고 참여 방식을 선택하여 토론방에 입장하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 토론방 카드 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2 mb-3">
                <Badge className={getTypeColor(discussion.type)}>{discussion.type}</Badge>
                <Badge className={getStatusColor(discussion.status)}>{discussion.status}</Badge>
              </div>
              
              <h3 className="mb-2 line-clamp-2">{discussion.title}</h3>
              
              <p className="text-sm text-muted-foreground mb-1">{discussion.category}</p>
              <p className="text-sm text-muted-foreground mb-4">{discussion.timeStatus}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  발언자 {discussion.speakers.current}/{discussion.speakers.max}명
                </Badge>
                <Badge variant="outline">
                  청중 {discussion.audience.current}/{discussion.audience.max}명
                </Badge>
              </div>
            </CardContent>
          </Card>



          {/* 참여 모드 선택 버튼 */}
          {canJoin ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleJoinAsSpeaker}
                  disabled={isSpeakerFull}
                  className="w-full"
                >
                  발언자로 참여하기
                  {isSpeakerFull && ' (정원 초과)'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleJoinAsAudience}
                  disabled={isAudienceFull}
                  className="w-full"
                >
                  청중으로 참여하기
                  {isAudienceFull && ' (정원 초과)'}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• 발언자: 토론에 직접 발언할 수 있습니다</p>
                <p>• 청중: 토론을 관찰하고 채팅으로 참여할 수 있습니다</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">종료된 토론방입니다.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}