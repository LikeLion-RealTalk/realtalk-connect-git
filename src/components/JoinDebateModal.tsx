import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Debate } from "@/types/debate";
import { DebateSummaryModal } from "./DebateSummaryModal";
import { LoginModal } from "./LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { generateNickname } from "@/lib/nickname/generator";
import { adjectives, nouns } from "@/lib/nickname/wordlists";
import {Input} from "postcss";

interface JoinDebateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debate: Debate | null;
}

/* 닉네임 무작위 생성 기능 */
function getSafeNickname(): string {
  const nick = generateNickname(adjectives, nouns, true, 50);
  return nick ?? getSafeNickname(); // 재귀적으로 안전 닉네임 생성
}

export const JoinDebateModal = ({ open, onOpenChange, debate }: JoinDebateModalProps) => {
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  if (!debate) return null;

  const handleJoinAsSpeaker = () => {
    if (!isLoggedIn) {
      toast({
        description: "로그인이 필요합니다.",
        duration: 3000,
      });
      setShowLoginModal(true);
      return;
    }
    
    console.log("발언자로 참여:", debate.id);
    navigate(`/debate/${debate.id}`);
    onOpenChange(false);
  };

  const handleJoinAsAudience = () => {
    console.log("청중으로 참여:", debate.id);
    navigate(`/debate/${debate.id}`);
    onOpenChange(false);
  };

  const isActive = debate.status === 'active';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-w-[320px] p-0 gap-0 border-4 border-quick-debate rounded-2xl bg-background fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative p-6 sm:p-10">
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-5 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-8">
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
                      ? 'bg-quick-debate text-white hover:bg-quick-debate' 
                      : 'bg-normal-debate text-white hover:bg-normal-debate'
                  }`}
                >
                  {debate.type === 'quick' ? '3분토론' : '일반토론'}
                </Badge>
                {isActive ? (
                  <Badge className="bg-debate-active text-white hover:bg-debate-active">진행중</Badge>
                ) : debate.status === 'ended' ? (
                  <Badge className="text-debate-ended-text hover:bg-debate-ended" style={{ backgroundColor: 'hsl(var(--debate-ended))' }}>종료됨</Badge>
                ) : (
                  <Badge className="bg-debate-waiting text-white hover:bg-debate-waiting">대기중</Badge>
                )}
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

{/*            {!isLoggedIn && (
                <div className="flex flex-col gap-2 mt-4">
                  <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="닉네임을 입력하세요"
                  />
                  <Button variant="outline" onClick={() => setNickname(getSafeNickname())}>
                    랜덤 닉네임 생성
                  </Button>
                </div>
            )}*/}

            {/* Join Buttons */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <Button
                onClick={handleJoinAsSpeaker}
                className="w-full h-12 sm:h-14 text-white font-bold text-sm sm:text-base"
                style={{ backgroundColor: 'hsl(var(--speaker-button))' }}
                disabled={debate.participants.current >= debate.participants.max}
              >
                발언자로 참여하기
              </Button>
              <Button
                onClick={handleJoinAsAudience}
                className="w-full h-12 sm:h-14 text-white font-bold text-sm sm:text-base"
                style={{ backgroundColor: 'hsl(var(--audience-button))' }}
                disabled={debate.audience.max > 0 && debate.audience.current >= debate.audience.max}
              >
                청중으로 참여하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Modal */}
      <DebateSummaryModal 
        open={showSummaryModal}
        onOpenChange={setShowSummaryModal}
        debate={debate}
      />

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          // After login, proceed with joining as speaker
          navigate(`/debate/${debate.id}`);
          onOpenChange(false);
        }}
      />
    </>
  );
};