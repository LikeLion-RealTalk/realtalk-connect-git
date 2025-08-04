import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { debateCategories, getCategoryIcon } from "@/data/categories";
import { JoinDebateModal } from "./JoinDebateModal";
import { Debate } from "@/types/debate";

interface DebateMatchingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DebateMatchingModal = ({ open, onOpenChange }: DebateMatchingModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [matchedDebate, setMatchedDebate] = useState<Debate | null>(null);

  const handleStartMatching = () => {
    if (selectedCategory) {
      setIsMatching(true);
      onOpenChange(false); // 모달 즉시 닫기
      
      // 1초 딜레이 후 토론방 입장 모달 표시
      setTimeout(() => {
        const category = debateCategories.find(cat => cat.id === selectedCategory);
        const mockDebate: Debate = {
          id: Math.random().toString(),
          title: `${category?.name} 관련 실시간 토론`,
          description: `${category?.description}에 대한 다양한 의견을 나누는 토론입니다.`,
          category: category?.name || "일반",
          icon: getCategoryIcon(selectedCategory),
          type: "quick",
          status: "waiting",
          participants: { current: 2, max: 6 },
          audience: { current: 8, max: 50 },
          duration: 3
        };
        
        setMatchedDebate(mockDebate);
        setIsMatching(false);
        setShowJoinModal(true);
      }, 1000);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-w-[320px] p-0 gap-0 border-4 border-quick-debate rounded-xl bg-background max-h-[80vh] overflow-y-auto fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative p-6 sm:p-10">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-5 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border-2 border-muted bg-background"
          >
            <X size={16} />
          </button>

          <DialogHeader className="text-center mb-6 sm:mb-8">
            <DialogTitle className="text-xl sm:text-3xl font-bold text-foreground mb-2">
              토론 매칭 시작
            </DialogTitle>
            <p className="text-sm sm:text-base text-muted-foreground">
              어떤 주제로 토론하고 싶으신가요?
            </p>
          </DialogHeader>

          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-base font-bold text-foreground mb-3 sm:mb-4">
              관심 카테고리를 선택해주세요
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {debateCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    p-3 sm:p-4 border-2 rounded text-center cursor-pointer transition-all duration-200
                    ${selectedCategory === category.id 
                      ? 'border-quick-debate bg-blue-50 text-primary' 
                      : 'border-border bg-background hover:border-quick-debate'
                    }
                  `}
                >
                  <div className="text-sm sm:text-base mb-1 sm:mb-2">
                    {getCategoryIcon(category.id)}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                    {category.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              onClick={handleStartMatching}
              disabled={!selectedCategory}
              className="w-full sm:w-auto bg-quick-debate hover:bg-quick-debate/90 text-white font-bold px-6 sm:px-8 py-3 text-sm sm:text-base"
            >
              매칭 시작
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto font-bold px-6 sm:px-8 py-3 text-sm sm:text-base order-first sm:order-last"
            >
              취소
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* 매칭 중 오버레이 */}
    {isMatching && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-background rounded-2xl p-8 mx-4 max-w-sm w-full text-center border-4 border-quick-debate">
          <div className="mb-6">
            <Progress value={75} className="w-full mb-4" />
            <h3 className="text-lg font-bold text-foreground">토론방을 찾고 있어요</h3>
          </div>
        </div>
      </div>
    )}

    <JoinDebateModal
      open={showJoinModal}
      onOpenChange={setShowJoinModal}
      debate={matchedDebate}
    />
    </>
  );
};