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
      <DialogContent className="sm:max-w-[400px] max-w-[375px] mx-4 p-0 gap-0 max-h-[90vh] overflow-hidden bg-muted">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 bg-background border-b border-border">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
              토론방 만들기
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-background p-6 space-y-6">
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
                <div className="text-lg font-bold text-foreground mb-2">3분</div>
                <div className="text-xs text-muted-foreground text-right">
                  발언자 수에 따라 연장
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                {timeOptions.map((time) => (
                  <div key={time} className="text-center flex-1">
                    <button
                      onClick={() => setSelectedTime(time)}
                      className={`w-5 h-5 rounded-full border-2 mx-auto mb-2 block relative ${
                        selectedTime === time 
                          ? 'border-primary' 
                          : 'border-muted-foreground'
                      }`}
                    >
                      {selectedTime === time && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </button>
                    <div className="text-sm text-muted-foreground">{time}분</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 최대 발언자 수 */}
          <div className="space-y-2">
            <Label className="text-base font-bold text-foreground">최대 발언자 수</Label>
            <Select value={formData.maxSpeakers} onValueChange={(value) => setFormData(prev => ({ ...prev, maxSpeakers: value }))}>
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
        <div className="flex gap-4 p-6 bg-background border-t border-border">
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