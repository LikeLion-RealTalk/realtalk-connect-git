import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { debateCategories } from "@/data/categories";

interface CreateDebateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DebateType = 'normal' | 'quick';
type DebateTime = 20 | 40 | 60 | 80;

export const CreateDebateModal = ({ open, onOpenChange }: CreateDebateModalProps) => {
  const [debateType, setDebateType] = useState<DebateType>('quick');
  const [selectedTime, setSelectedTime] = useState<DebateTime>(20);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    prosideLabel: '',
    consideLabel: '',
    maxSpeakers: '2',
    maxAudience: debateType === 'quick' ? '20' : '0'
  });

  const timeOptions: DebateTime[] = [20, 40, 60, 80];

  const handleTypeChange = (type: DebateType) => {
    setDebateType(type);
    setFormData(prev => ({
      ...prev,
      maxAudience: type === 'quick' ? '20' : '0'
    }));
  };

  const handleMaxSpeakersChange = (speakers: string) => {
    setFormData(prev => ({ ...prev, maxSpeakers: speakers }));
    
    // 발언자 수에 따른 토론 시간 자동 설정
    if (debateType === 'normal') {
      // 일반 토론: 발언자 수에 따른 고정 시간
      const speakerCount = parseInt(speakers);
      const timeMapping: Record<number, DebateTime> = {
        2: 20,
        4: 40,
        6: 60,
        8: 80
      };
      setSelectedTime(timeMapping[speakerCount] || 20);
    }
    // 3분 토론의 경우 슬라이더가 아닌 텍스트로 표시되므로 selectedTime을 변경하지 않음
  };

  const handleCreateDebate = () => {
    console.log('토론방 생성:', {
      ...formData,
      debateType,
      duration: debateType === 'quick' ? 3 : selectedTime
    });
    // TODO: 실제 토론방 생성 로직
    onOpenChange(false);
  };

  const isFormValid = formData.title && formData.category && formData.prosideLabel && formData.consideLabel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-w-[375px] mx-4 p-0 gap-0 max-h-[90vh] flex flex-col bg-muted">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 bg-background border-b border-border flex-shrink-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
              토론방 만들기
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-background p-6 space-y-6 min-h-0">
          {/* 토론 주제 */}
          <div className="space-y-2">
            <Label className="text-base font-bold text-foreground">토론 주제</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="토론 주제를 입력하세요"
              className="border-2 border-red-400 focus:border-red-500"
            />
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label className="text-base font-bold text-foreground">설명</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="토론에 대한 간단한 설명을 입력하세요"
              className="border-2 border-red-400 focus:border-red-500 resize-none h-[120px]"
            />
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <Label className="text-base font-bold text-foreground">카테고리</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="border-2 border-red-400 focus:border-red-500">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {debateCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 토론 사이드 */}
          <div className="space-y-2">
            <Label className="text-base font-bold text-foreground">토론 사이드</Label>
            <div className="flex gap-3">
              <Input
                value={formData.prosideLabel}
                onChange={(e) => setFormData(prev => ({ ...prev, prosideLabel: e.target.value }))}
                placeholder="찬성"
                className="border-2 border-red-400 focus:border-red-500"
              />
              <Input
                value={formData.consideLabel}
                onChange={(e) => setFormData(prev => ({ ...prev, consideLabel: e.target.value }))}
                placeholder="반대"
                className="border-2 border-red-400 focus:border-red-500"
              />
            </div>
          </div>

          {/* 토론 방식 */}
          <div className="space-y-3">
            <Label className="text-base font-bold text-foreground">토론 방식</Label>
            <div className="flex gap-3">
              <Button
                onClick={() => handleTypeChange('normal')}
                variant={debateType === 'normal' ? 'default' : 'outline'}
                className={`flex-1 rounded-full font-bold ${
                  debateType === 'normal' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground border-muted'
                }`}
              >
                일반 토론
              </Button>
              <Button
                onClick={() => handleTypeChange('quick')}
                variant={debateType === 'quick' ? 'default' : 'outline'}
                className={`flex-1 rounded-full font-bold ${
                  debateType === 'quick' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground border-muted'
                }`}
              >
                3분 토론
              </Button>
            </div>
          </div>

          {/* 토론 시간 */}
          <div className="space-y-3">
            <Label className="text-base font-bold text-foreground">토론 시간</Label>
            {debateType === 'quick' ? (
              <div>
                <div className="text-lg font-bold text-foreground mb-2">
                  {parseInt(formData.maxSpeakers) === 2 ? '3분' : `${parseInt(formData.maxSpeakers)}분`}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {parseInt(formData.maxSpeakers) === 2 
                    ? '기본 3분 고정' 
                    : `발언자 ${formData.maxSpeakers}명 × 1분`
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-lg font-bold text-foreground text-center">
                  {selectedTime}분
                </div>
                <Slider
                  value={[selectedTime]}
                  onValueChange={(value) => setSelectedTime(value[0] as DebateTime)}
                  min={20}
                  max={80}
                  step={20}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20분</span>
                  <span>40분</span>
                  <span>60분</span>
                  <span>80분</span>
                </div>
              </div>
            )}
          </div>

          {/* 최대 발언자 수 */}
          <div className="space-y-2">
            <Label className="text-base font-bold text-foreground">최대 발언자 수</Label>
            <Select value={formData.maxSpeakers} onValueChange={handleMaxSpeakersChange}>
              <SelectTrigger className="border border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 4, 6, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}명
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 최대 청중 수 */}
          <div className="space-y-2">
            <Label className="text-base font-bold text-foreground">최대 청중 수</Label>
            <Select value={formData.maxAudience} onValueChange={(value) => setFormData(prev => ({ ...prev, maxAudience: value }))}>
              <SelectTrigger className="border border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {debateType === 'quick' 
                  ? [0, 20, 40, 60, 80, 100].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}명
                      </SelectItem>
                    ))
                  : [0, 10, 20, 30, 50, 100].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}명
                      </SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-4 p-6 bg-background border-t border-border flex-shrink-0">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 bg-muted text-muted-foreground border-muted"
          >
            취소
          </Button>
          <Button
            onClick={handleCreateDebate}
            disabled={!isFormValid}
            className={`flex-1 font-bold ${
              isFormValid 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            토론방 만들기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};