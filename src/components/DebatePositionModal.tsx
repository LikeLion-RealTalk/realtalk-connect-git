import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DebatePositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnter: (position: "pros" | "cons") => void;
  debateTitle: string;
  category: string;
  type: string;
}

export const DebatePositionModal = ({
  isOpen,
  onClose,
  onEnter,
  debateTitle,
  category,
  type
}: DebatePositionModalProps) => {
  const [selectedPosition, setSelectedPosition] = useState<"pros" | "cons" | null>(null);
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/browse");
  };

  const handleEnter = () => {
    if (selectedPosition) {
      onEnter(selectedPosition);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border-3 border-primary rounded-xl w-full max-w-md relative shadow-2xl">
        {/* Header */}
        <div className="bg-muted px-6 py-4 border-b-2 border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">토론 입장 선택</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Debate Info */}
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-2 mb-3">
              <Badge className="bg-primary text-primary-foreground text-xs">
                {type}토론
              </Badge>
              <span className="text-sm text-muted-foreground">{category}</span>
            </div>
            <h3 className="text-xl font-bold leading-tight mb-6">
              {debateTitle}
            </h3>
          </div>

          {/* Position Selection */}
          <div className="mb-6">
            <h4 className="text-base font-semibold text-center mb-4">
              입장을 선택해주세요
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPosition("pros")}
                className={`border-2 rounded-lg p-4 text-center transition-all ${
                  selectedPosition === "pros"
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary hover:bg-muted'
                }`}
              >
                <div className="font-semibold">인간 창의성 중요</div>
              </button>
              
              <button
                onClick={() => setSelectedPosition("cons")}
                className={`border-2 rounded-lg p-4 text-center transition-all ${
                  selectedPosition === "cons"
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary hover:bg-muted'
                }`}
              >
                <div className="font-semibold">AI가 더 창의적</div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6"
            >
              취소
            </Button>
            <Button
              onClick={handleEnter}
              disabled={!selectedPosition}
              className="px-6"
            >
              토론 입장하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};