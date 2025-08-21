import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Copy, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export function ShareRoomModal({ isOpen, onClose, roomId }: ShareRoomModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://www.realtalks.co.kr/${roomId}`;

  const handleCopyUrl = async () => {
    try {
      // 최신 브라우저의 Clipboard API 사용 시도
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('토론방 URL이 클립보드에 복사되었습니다!');
      } else {
        // Clipboard API를 사용할 수 없는 경우 대체 방법 사용
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          toast.success('토론방 URL이 클립보드에 복사되었습니다!');
        } else {
          throw new Error('복사 명령 실패');
        }
      }
      
      // 2초 후 복사 상태 리셋
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
      // 복사에 실패한 경우 사용자에게 수동 복사 안내
      toast.error('자동 복사에 실패했습니다. URL을 직접 복사해주세요.', {
        description: 'URL 입력란을 클릭하여 전체 선택 후 Ctrl+C(또는 Cmd+C)로 복사하실 수 있습니다.'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-2 sm:mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle>토론방 공유하기</DialogTitle>
              <DialogDescription className="mt-1">
                이 토론방을 다른 사람들과 공유해보세요.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="share-url">토론방 URL</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="flex items-center gap-1 px-3"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    복사
                  </>
                )}
              </Button>
            </div>
          </div>


        </div>


      </DialogContent>
    </Dialog>
  );
}