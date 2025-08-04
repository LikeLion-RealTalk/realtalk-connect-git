import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { debateCategories, getCategoryIcon } from "@/data/categories";

interface DebateMatchingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DebateMatchingModal = ({ open, onOpenChange }: DebateMatchingModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const handleStartMatching = () => {
    if (selectedCategory) {
      console.log("매칭 시작:", selectedCategory);
      // TODO: 실제 매칭 로직 구현
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[320px] mx-4 p-0 gap-0 border-4 border-quick-debate rounded-xl bg-background max-h-[80vh] overflow-y-auto">
        <div className="relative p-6 sm:p-10">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-5 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border-2 border-muted bg-background"
          >
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
  );
};