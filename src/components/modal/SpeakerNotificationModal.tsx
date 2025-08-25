import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Mic } from 'lucide-react';

interface SpeakerNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpeakerNotificationModal({ isOpen, onClose }: SpeakerNotificationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="mx-4 sm:mx-auto w-full max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-2xl border-2 shadow-xl text-center"
        onEscapeKeyDown={onClose}
        onPointerDownOutside={onClose}
      >
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {/* 마이크 아이콘 */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mic className="w-8 h-8 text-primary" />
          </div>
          
          {/* 메시지 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              발언자로 지정되었습니다!
            </h3>
            <p className="text-sm text-muted-foreground">
              이제 발언할 수 있습니다
            </p>
          </div>
          
          {/* 확인 버튼 */}
          <Button onClick={onClose} className="w-full mt-4">
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}