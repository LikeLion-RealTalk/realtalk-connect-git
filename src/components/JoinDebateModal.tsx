import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Debate } from "@/types/debate";

interface JoinDebateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debate: Debate | null;
}

export const JoinDebateModal = ({ open, onOpenChange, debate }: JoinDebateModalProps) => {
  if (!debate) return null;

  const handleJoinAsSpeaker = () => {
    console.log("발언자로 참여:", debate.id);
    // TODO: 실제 토론방 입장 로직
    onOpenChange(false);
  };

  const handleJoinAsAudience = () => {
    console.log("청중으로 참여:", debate.id);
    // TODO: 실제 토론방 입장 로직
    onOpenChange(false);
  };

  const isActive = debate.status === 'active';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[320px] mx-4 p-0 gap-0 border-4 border-quick-debate rounded-2xl bg-background">
        <div className="relative p-6 sm:p-10">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-5 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
          </button>

          {/* Icon */}
          <div className="w-15 h-15 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-8">
            <MessageCircle size={24} className="sm:w-8 sm:h-8 text-muted-foreground" />
          </div>

          <DialogHeader className="text-center mb-6 sm:mb-8">
            <DialogTitle className="text-xl sm:text-3xl font-bold text-foreground mb-2">
              토론방 입장
            </DialogTitle>
            <p className="text-sm sm:text-base text-muted-foreground">
              실시간 토론에 참여하시겠습니까?
            </p>
          </DialogHeader>

          {/* Debate Info Card */}
          <div className="bg-muted border-2 border-border rounded-xl p-5 sm:p-6 mb-6 sm:mb-8 text-left">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Badge 
                variant="secondary" 
                className={`text-xs font-semibold ${
                  debate.type === 'quick' 
                    ? 'bg-quick-debate text-white' 
                    : 'bg-normal-debate text-white'
                }`}
              >
                {debate.type === 'quick' ? '3분토론' : '일반토론'}
              </Badge>
            </div>
            
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight mb-3 sm:mb-4">
              {debate.title}
            </h3>
            
            <div className="text-xs sm:text-sm text-muted-foreground font-medium mb-4 sm:mb-5">
              {debate.icon} {debate.category} · {
                isActive ? `${debate.duration}분 진행중` : '대기중'
              }
            </div>

            <div className="flex gap-2 sm:gap-4">
              <Badge variant="outline" className="text-xs sm:text-sm">
                발언자 {debate.participants.current}/{debate.participants.max}명
              </Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">
                청중 {debate.audience.current}/{debate.audience.max}명
              </Badge>
            </div>
          </div>

          {/* Join Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <Button
              onClick={handleJoinAsSpeaker}
              className="w-full h-12 sm:h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm sm:text-base"
              disabled={debate.participants.current >= debate.participants.max}
            >
              발언자로 참여하기
            </Button>
            <Button
              onClick={handleJoinAsAudience}
              variant="outline"
              className="w-full h-12 sm:h-14 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold text-sm sm:text-base"
              disabled={debate.audience.max > 0 && debate.audience.current >= debate.audience.max}
            >
              청중으로 참여하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};