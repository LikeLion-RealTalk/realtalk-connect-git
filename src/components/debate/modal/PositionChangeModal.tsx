import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { RotateCcw } from 'lucide-react';
import { DiscussionCategory, DebateType, Position, POSITIONS } from '../../../types/discussion';
import { debateApi } from '../../../lib/api/apiClient';
import { toast } from 'sonner';

interface PositionChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (position: Position) => void;
  currentPosition: Position;
  title: string;
  category: DiscussionCategory;
  debateType: DebateType;
  aDescription: string;
  bDescription: string;
  sideA: string;
  sideB: string;
  roomId: string;
  userSubjectId: string | null;
}

export function PositionChangeModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  currentPosition,
  title,
  category,
  debateType,
  aDescription,
  bDescription,
  sideA,
  sideB,
  roomId,
  userSubjectId
}: PositionChangeModalProps) {
  const [selectedPosition, setSelectedPosition] = useState<Position>(currentPosition);
  const [isLoading, setIsLoading] = useState(false);

  // 모달이 열릴 때마다 selectedPosition을 현재 입장으로 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedPosition(currentPosition);
    }
  }, [isOpen, currentPosition]);

  const handleConfirm = async () => {
    if (!userSubjectId) {
      toast.error('사용자 정보가 없습니다. 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 선택한 입장을 'A' 또는 'B'로 변환
      const side: 'A' | 'B' = selectedPosition === POSITIONS[0] ? 'A' : 'B';
      
      // API 호출
      await debateApi.sendSideInfo(roomId, userSubjectId, side);
      
      // 성공 시 토스트 메시지
      if (selectedPosition === currentPosition) {
        toast.success('현재 입장을 유지합니다');
      } else {
        const sideText = selectedPosition === POSITIONS[0] ? (sideA || POSITIONS[0]) : (sideB || POSITIONS[1]);
        toast.success(`입장을 ${sideText}으로 변경했습니다`);
      }
      
      // 부모 컴포넌트에 변경된 입장 전달
      onConfirm(selectedPosition);
    } catch (error) {
      console.error('[입장 변경] API 호출 실패:', error);
      toast.error('입장 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPosition(currentPosition);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-400 dark:bg-blue-400">
              <RotateCcw className="w-6 h-6 text-white dark:text-white" />
            </div>
            <div>
              <DialogTitle>입장을 변경하시겠습니까?</DialogTitle>
              <DialogDescription className="mt-1">
                원하는 입장을 선택해주세요.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* 변경할 입장 */}
          <div className="space-y-4">
            <h4 className="text-center font-medium">변경할 입장을 선택해주세요</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* A입장 */}
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPosition === POSITIONS[0]
                    ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedPosition(POSITIONS[0])}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-700 dark:text-green-300 text-sm">
                        {sideA || POSITIONS[0]}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        {aDescription}
                      </p>
                      {currentPosition === POSITIONS[0] && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          현재 입장
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* B입장 */}
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPosition === POSITIONS[1]
                    ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedPosition(POSITIONS[1])}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">B</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-red-700 dark:text-red-300 text-sm">
                        {sideB || POSITIONS[1]}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        {bDescription}
                      </p>
                      {currentPosition === POSITIONS[1] && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          현재 입장
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : selectedPosition === currentPosition ? '현재 입장 유지' : '입장 변경하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}