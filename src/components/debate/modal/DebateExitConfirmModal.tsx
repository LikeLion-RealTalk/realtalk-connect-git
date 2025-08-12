import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { AlertTriangle } from 'lucide-react';

interface DebateExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isFromSummary?: boolean;
}

export function DebateExitConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  isFromSummary = false
}: DebateExitConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-400 dark:bg-orange-400">
              <AlertTriangle className="w-6 h-6 text-white dark:text-white" />
            </div>
            <div>
              <DialogTitle>토론방에서 나가시겠습니까?</DialogTitle>
              <DialogDescription className="mt-1">
                {isFromSummary 
                  ? '토론 요약을 확인한 후 다른 토론을 둘러보시겠습니까?'
                  : '현재 진행 중인 토론방에서 나가시겠습니까?'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {!isFromSummary && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ 주의사항
              </h4>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• 토론방을 나가면 현재까지의 발언 기록을 볼 수 없습니다.</li>
                <li>• 진행 중인 토론에 다시 참여할 수 없습니다.</li>
                <li>• 저장되지 않은 내용은 모두 사라집니다.</li>
              </ul>
            </div>
          )}

          {isFromSummary && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                💡 다음 단계
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                토론방 둘러보기에서 다른 흥미로운 토론들을 발견해보세요. 
                새로운 주제의 토론에 참여하거나 토론을 직접 생성할 수도 있습니다.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1"
          >
            {isFromSummary ? '토론 둘러보기' : '나가기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}