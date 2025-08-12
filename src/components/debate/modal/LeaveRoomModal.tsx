import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { AlertTriangle } from 'lucide-react';

interface LeaveRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LeaveRoomModal({ isOpen, onClose, onConfirm }: LeaveRoomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-2 sm:mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle>토론방을 나가시겠습니까?</DialogTitle>
              <DialogDescription className="mt-1">
                토론방을 나가면 현재 진행 중인 토론에서 제외됩니다.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1"
          >
            나가기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}