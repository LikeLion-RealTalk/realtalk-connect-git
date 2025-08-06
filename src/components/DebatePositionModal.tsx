
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { generateNickname } from "@/lib/nickname/generator";
import { validateUserNickname } from "@/lib/nickname/validate-user-nickname";
import { adjectives, nouns } from "@/lib/nickname/wordlists";

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
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/browse");
  };

  const getSafeNickname = (): string => {
    const nick = generateNickname(adjectives, nouns, true, 50);
    return nick ?? getSafeNickname();
  };

  const handleGenerateNickname = () => {
    const generatedNickname = getSafeNickname();
    setNickname(generatedNickname);
  };

  const handleEnter = () => {
    if (selectedPosition && nickname.trim()) {
      const result = validateUserNickname(nickname);
      if (result.isValid) {
        console.log("✅ 유효한 닉네임입니다.");
        onEnter(selectedPosition);
      } else {
        console.log("❌ 유효하지 않은 닉네임입니다.");
        console.log(`   이유: ${result.reason}`);
        // You can add toast notification here if needed
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl w-full max-w-md relative shadow-2xl">
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

          {/* Nickname Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">닉네임</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateNickname}
                className="whitespace-nowrap"
              >
                임의생성
              </Button>
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
              disabled={!selectedPosition || !nickname.trim()}
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
