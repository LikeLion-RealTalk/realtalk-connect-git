// components/DebateMatchingModal.tsx
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
  onStartMatching?: () => void; // 상위와 연동되면 true 설정
}

export const DebateMatchingModal = ({
                                      open,
                                      onOpenChange,
                                      onStartMatching,
                                    }: DebateMatchingModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'matched'>('idle');
  const [matchedDebate, setMatchedDebate] = useState<Debate | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleStartMatching = async () => {
    if (!selectedCategory) return;

    // 상위 컴포넌트와 연동
    onStartMatching?.();
    setStatus('loading');
    onOpenChange(false);

    // UX: 매칭 대기 연출
    await new Promise((r) => setTimeout(r, 1500));

    const category = debateCategories.find((c) => c.id === selectedCategory);
    const mockDebate: Debate = {
      id: crypto.randomUUID(),
      title: `${category?.name} 관련 실시간 토론`,
      description: `${category?.description}에 대한 다양한 의견을 나누는 토론입니다.`,
      category: category?.name || '일반',
      icon: getCategoryIcon(selectedCategory),
      type: 'quick',
      status: 'waiting',
      participants: { current: 2, max: 6 },
      audience: { current: 8, max: 50 },
      duration: 3,
    };

    setMatchedDebate(mockDebate);
    setStatus('matched');
    setShowJoinModal(true);
  };

  return (
      <>
        {/* Step 1: 카테고리 선택 모달 */}
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-[500px] border-4 border-quick-debate rounded-xl p-0">
            <div className="relative p-6 sm:p-10">
              <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-5 text-muted-foreground hover:text-foreground border-2 border-muted bg-background"
              >
                <X size={16} />
              </button>

              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-2xl font-bold">토론 매칭 시작</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  관심 카테고리를 선택해주세요
                  <br />
                  <span className="text-xs text-foreground">
                  어떤 주제로 토론하고 싶으신가요?
                </span>
                </p>
              </DialogHeader>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {debateCategories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 border-2 rounded transition-all ${
                            selectedCategory === cat.id
                                ? 'border-quick-debate bg-blue-50 text-primary'
                                : 'border-border hover:border-quick-debate'
                        }`}
                    >
                      <div className="text-sm mb-1">{getCategoryIcon(cat.id)}</div>
                      <div className="text-xs font-bold">{cat.name}</div>
                    </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                    className="w-full bg-quick-debate text-white"
                    disabled={!selectedCategory}
                    onClick={handleStartMatching}
                >
                  매칭 시작
                </Button>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onOpenChange(false)}
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Step 2: 매칭 중 오버레이 */}
        {status === 'loading' && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <div className="bg-background rounded-2xl p-8 mx-4 max-w-sm w-full text-center border-4 border-quick-debate">
                <Progress value={75} className="mb-4" />
                <h3 className="text-lg font-bold text-foreground">토론방을 찾고 있어요...</h3>
                <p className="text-sm text-muted-foreground">잠시만 기다려 주세요</p>
              </div>
            </div>
        )}

        {/* Step 3: 매칭된 토론방 입장 모달 */}
        <JoinDebateModal
            open={status === 'matched' && showJoinModal}
            onOpenChange={(open) => {
              setShowJoinModal(open);
              if (!open) setStatus('idle');
            }}
            debate={matchedDebate}
        />
      </>
  );
};
