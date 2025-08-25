import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Discussion, UserRole, ParticipationRole, DISCUSSION_STATUSES } from '../../types/discussion';
import { useUser } from '../UserProvider';
import { LoginModal } from './LoginModal';
import { useWebSocket } from '../../hooks/useWebSocket';
import { toast } from "sonner";

interface JoinDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussion: Discussion | null;
  onJoin: (discussionId: string, nickname: string, role: UserRole, participationMode?: ParticipationRole) => void;
  onNavigate?: (page: 'debate', discussionId: string, userInfo?: { userRole: 'SPEAKER' | 'AUDIENCE', userPosition: string, userSelectedSide: 'A' | 'B' }) => void;
  isDirectLink?: boolean;
}

export function JoinDiscussionModal({ 
  isOpen, 
  onClose, 
  discussion, 
  onJoin,
  onNavigate,
  isDirectLink = false
}: JoinDiscussionModalProps) {
  const { isLoggedIn } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'speaker' | 'audience' | null>(null);
  const [currentStep, setCurrentStep] = useState<'role' | 'side'>('role');
  const [selectedRole, setSelectedRole] = useState<'SPEAKER' | 'AUDIENCE' | null>(null);
  const [selectedSide, setSelectedSide] = useState<'A' | 'B' | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const { connect, joinRoom, isConnected, isConnecting } = useWebSocket();

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
    if (!isLoggedIn) {
      // 비로그인 사용자: Toast 메시지 표시 후 로그인 모달 열기
      toast.error('발언자로 참여하려면 회원가입을 하셔야 합니다.', {
        position: 'bottom-right',
        duration: 3000,
      });
      setPendingAction('speaker');
      setShowLoginModal(true);
      return;
    }

    // 로그인한 사용자: 입장 선택 단계로 이동
    setSelectedRole('SPEAKER');
    setCurrentStep('side');
  };

  const handleJoinAsAudience = () => {
    // 청중은 로그인 검증 없이 입장 선택 단계로 이동
    setSelectedRole('AUDIENCE');
    setCurrentStep('side');
  };

  const handleSideSelection = (side: 'A' | 'B') => {
    setSelectedSide(side);
  };

  const handleJoinRoom = async () => {
    if (!discussion || !selectedRole || !selectedSide) return;

    setIsJoining(true);

    try {
      console.log('[토론방입장] 입장 시도:', { discussionId: discussion.id, role: selectedRole, side: selectedSide });
      
      // WebSocket 연결 (역할에 따른 연결)
      const connected = await connect(selectedRole);
      
      if (!connected) {
        throw new Error('WebSocket 연결에 실패했습니다');
      }
      
      console.log('[토론방입장] WebSocket 연결 완료, JOIN 요청 전송');
      
      // 방 참여 정보만 저장하고 DebatePage에서 joinRoom 호출하도록 변경
      console.log('[토론방입장] 연결 완료, DebatePage로 이동');
      
      // JOIN_ACCEPTED 시뮬레이션 (실제 JOIN은 DebatePage에서 수행)
      if (true) {
        toast.success('토론방에 입장했습니다!', {
          position: 'bottom-right',
          duration: 2000,
        });
        
        // 토론방 페이지로 이동 (선택한 역할과 입장 정보 포함)
        if (onNavigate) {
          onNavigate('debate', discussion.id, {
            userRole: selectedRole,
            userPosition: selectedSide === 'A' ? discussion.sideA : discussion.sideB,
            userSelectedSide: selectedSide
          });
        }
        onClose();
      }
    } catch (error) {
      console.error('[토론방입장] 오류:', error);
      toast.error(`토론방 입장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, {
        position: 'bottom-right',
        duration: 3000,
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleBack = () => {
    setCurrentStep('role');
    setSelectedRole(null);
    setSelectedSide(null);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    
    // 로그인 성공 후 입장 선택 단계로 이동
    if (pendingAction === 'speaker') {
      setSelectedRole('SPEAKER');
      setCurrentStep('side');
    }
    
    setPendingAction(null);
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
    setPendingAction(null);
    // 원래 모달은 그대로 유지 (onClose 호출하지 않음)
  };

  const handleClose = () => {
    // 상태 초기화
    setCurrentStep('role');
    setSelectedRole(null);
    setSelectedSide(null);
    setIsJoining(false);
    onClose();
  };

  const isSpeakerFull = discussion.speakers.current >= discussion.speakers.max;
  const isAudienceFull = discussion.audience.current >= discussion.audience.max;
  const canJoin = discussion.status !== DISCUSSION_STATUSES[2]; // '종료됨'
  const isSpeakerDisabledForDirectLink = isDirectLink; // 직접 링크로 들어온 경우 발언자 비활성화

  return (
    <>
      <Dialog open={isOpen && !showLoginModal} onOpenChange={handleClose}>
        <DialogContent className="max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-2xl border-2 shadow-xl sm:max-w-lg">
          <DialogHeader className="text-center">
            <DialogTitle>토론방 입장</DialogTitle>
            <DialogDescription>
              {currentStep === 'role' 
                ? '참여 방식을 선택하여 토론방에 입장하세요.'
                : '토론에서 지지할 입장을 선택하세요.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
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

            {/* 단계별 콘텐츠 */}
            {canJoin ? (
              <>
                {currentStep === 'role' && (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleJoinAsSpeaker}
                        disabled={isSpeakerFull || isSpeakerDisabledForDirectLink}
                        className="w-full"
                        title={isSpeakerDisabledForDirectLink ? "링크로 들어온 사용자는 청중으로만 참여할 수 있습니다" : undefined}
                      >
                        발언자로 참여하기
                        {isSpeakerFull && ' (정원 초과)'}
                        {isSpeakerDisabledForDirectLink && ' (로그인 필요)'}
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
                      {isDirectLink && (
                        <p className="text-orange-600 dark:text-orange-400 font-medium">
                          ⚠️ 링크로 들어온 사용자는 발언자로 참여하려면 별도 로그인이 필요합니다
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 'side' && (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      선택한 역할: <strong>{selectedRole === 'SPEAKER' ? '발언자' : '청중'}</strong>
                    </div>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleSideSelection('A')}
                        variant={selectedSide === 'A' ? 'default' : 'outline'}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">A</span>
                          </div>
                          <span>{discussion.sideA}</span>
                        </div>
                      </Button>
                      
                      <Button
                        onClick={() => handleSideSelection('B')}
                        variant={selectedSide === 'B' ? 'default' : 'outline'}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">B</span>
                          </div>
                          <span>{discussion.sideB}</span>
                        </div>
                      </Button>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1"
                        disabled={isJoining}
                      >
                        이전
                      </Button>
                      <Button
                        onClick={handleJoinRoom}
                        disabled={!selectedSide || isJoining || isConnecting}
                        className="flex-1"
                      >
                        {isJoining || isConnecting ? '입장 중...' : '입장하기'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">종료된 토론방입니다.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleLoginClose}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}