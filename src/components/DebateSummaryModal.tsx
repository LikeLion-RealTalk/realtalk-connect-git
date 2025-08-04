import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Debate } from "@/types/debate";

interface DebateSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debate: Debate | null;
}

export const DebateSummaryModal = ({ open, onOpenChange, debate }: DebateSummaryModalProps) => {
  if (!debate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[375px] mx-4 p-0 gap-0 border-4 border-primary rounded-xl bg-background">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 bg-muted border-b border-border text-center">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-5 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
          <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
            AI 토론 요약
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Debate Header */}
          <div className="mb-5">
            <Badge 
              variant="secondary" 
              className={`text-xs font-semibold mb-3 ${
                debate.type === 'quick' 
                  ? 'bg-quick-debate text-white' 
                  : 'bg-normal-debate text-white'
              }`}
            >
              {debate.type === 'quick' ? '3분토론' : '일반토론'}
            </Badge>
            
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight mb-3">
              {debate.title}
            </h2>
            
            <div className="text-sm text-muted-foreground font-medium">
              {debate.icon} {debate.category} · 완료됨 (90분 진행)
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted border-2 border-border rounded-lg p-4 sm:p-5 mb-6">
            <h3 className="text-sm font-bold text-foreground mb-3">토론 결과 요약</h3>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <div className="mb-3">
                <strong className="text-foreground">주요 발언 내용:</strong><br />
                • 찬성 측: "AI는 반복적 업무를 대체하며 인간은 더 창의적 업무에 집중 가능"<br />
                • 반대 측: "대량 실업과 인간 고유 가치의 상실 우려"
              </div>
              
              <div className="mb-3">
                <strong className="text-foreground">여론 동향:</strong><br />
                찬성 42% vs 반대 58% (총 156명 참여)
              </div>
              
              <div>
                <strong className="text-foreground">최종 결론:</strong><br />
                AI가 인간을 완전히 대체하기보다는 협력적 관계로 발전해야 한다는 절충안이 다수 의견으로 도출됨.
                교육 시스템 개편과 사회 안전망 구축의 필요성이 강조됨.
              </div>
            </div>
          </div>

          {/* Actions */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-12 sm:h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm sm:text-base"
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};