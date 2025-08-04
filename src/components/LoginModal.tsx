import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
}

export const LoginModal = ({ open, onOpenChange, onLoginSuccess }: LoginModalProps) => {
  const handleKakaoLogin = () => {
    // 카카오 로그인 로직
    console.log("카카오 로그인");
    onLoginSuccess?.();
    onOpenChange(false);
  };

  const handleGoogleLogin = () => {
    // 구글 로그인 로직
    console.log("구글 로그인");
    onLoginSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-w-[320px] mx-4 p-0 gap-0 border-4 border-quick-debate rounded-2xl bg-background">
        <div className="relative p-6 sm:p-10">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-5 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
          </button>

          <DialogHeader className="text-center mb-6 sm:mb-10">
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground">
              로그인
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {/* Kakao Login */}
            <Button
              onClick={handleKakaoLogin}
              className="w-full h-12 sm:h-14 bg-[#FEE500] hover:bg-[#FEE500]/90 text-black border-2 border-[#FEE500] font-bold text-sm sm:text-base flex items-center justify-center gap-3"
              variant="outline"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black rounded flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                K
              </div>
              카카오 로그인
            </Button>

            {/* Divider */}
            <div className="text-center text-muted-foreground text-sm sm:text-base py-2">
              또는
            </div>

            {/* Google Login */}
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-12 sm:h-14 bg-background hover:bg-muted text-foreground border-2 border-border font-bold text-sm sm:text-base flex items-center justify-center gap-3"
              variant="outline"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#4285f4] rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                G
              </div>
              구글 로그인
            </Button>
          </div>

          {/* Cancel button */}
          <div className="text-center">
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground text-sm sm:text-base underline transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};