import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { RotateCcw } from 'lucide-react';
import { DiscussionCategory, DebateType, Position, POSITIONS } from '../../types/discussion';

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
  bDescription
}: PositionChangeModalProps) {
  const [selectedPosition, setSelectedPosition] = useState<Position>(
    currentPosition === POSITIONS[0] ? POSITIONS[1] : POSITIONS[0]
  );

  // 모달이 열릴 때마다 selectedPosition 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedPosition(currentPosition === POSITIONS[0] ? POSITIONS[1] : POSITIONS[0]);
    }
  }, [isOpen, currentPosition]);

  const handleConfirm = () => {
    onConfirm(selectedPosition);
  };

  const handleClose = () => {
    setSelectedPosition(currentPosition === POSITIONS[0] ? POSITIONS[1] : POSITIONS[0]);
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
                } ${
                  currentPosition === POSITIONS[0] ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => currentPosition !== POSITIONS[0] && setSelectedPosition(POSITIONS[0])}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-700 dark:text-green-300 text-sm">
                        {POSITIONS[0]}
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
                } ${
                  currentPosition === POSITIONS[1] ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => currentPosition !== POSITIONS[1] && setSelectedPosition(POSITIONS[1])}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">B</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-red-700 dark:text-red-300 text-sm">
                        {POSITIONS[1]}
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
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={selectedPosition === currentPosition}
          >
            입장 변경하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}