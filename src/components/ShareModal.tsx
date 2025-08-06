
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl?: string;
}

export const ShareModal = ({ open, onOpenChange, shareUrl = "https://api.realtalks.co.kr/debate/b7b2e571-7939-47cf-a599-cb2f3bdd508cb" }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        description: "URL이 클립보드에 복사되었습니다.",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        description: "복사에 실패했습니다.",
        duration: 2000,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-w-[320px] p-0 gap-0 rounded-2xl bg-background fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative p-6 sm:p-8">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>

          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
              토론 공유하기
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                공유 URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-border rounded text-sm bg-muted text-muted-foreground"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      복사
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={() => onOpenChange(false)}
                className="px-6"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
