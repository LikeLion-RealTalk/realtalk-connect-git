import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useIsMobile } from './ui/use-mobile';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import {
  DiscussionData,
  DISCUSSION_CATEGORIES,
  SPEAKER_OPTIONS,
  AUDIENCE_OPTIONS,
  DURATION_OPTIONS,
  getMinDuration,
  getDefaultDuration,
  getAvailableDurations,
  getThreeMinuteDebateDuration,
  type DebateType,
  type Position
} from '../types/discussion';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: DiscussionData) => void;
}

export function CreateDiscussionModal({ 
  isOpen, 
  onClose, 
  onCreate 
}: CreateDiscussionModalProps) {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<DiscussionData>({
    title: '',
    description: '',
    category: DISCUSSION_CATEGORIES[0],
    position: 'A입장',
    aPosition: '',
    bPosition: '',
    debateType: '일반토론',
    duration: 20,
    maxSpeakers: 2,
    maxAudience: 20
  });

  // 토론방 카드와 동일한 뱃지 색상 함수
  const getDebateTypeBadgeClass = (type: string, isSelected: boolean) => {
    if (isSelected) {
      return type === '3분토론' 
        ? 'bg-purple-500 text-white hover:bg-purple-600' 
        : 'bg-blue-500 text-white hover:bg-blue-600';
    }
    return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  };

  // 토론 방식이나 발언자 수가 변경될 때 토론 시간 자동 조정
  useEffect(() => {
    if (formData.debateType === '3분토론') {
      // 3분토론에서 2명일 때는 3분으로 고정, 나머지는 발언자 수와 동일
      const threeMinuteDuration = getThreeMinuteDebateDuration(formData.maxSpeakers);
      setFormData(prev => ({ ...prev, duration: threeMinuteDuration }));
    } else {
      const minDuration = getMinDuration(formData.maxSpeakers);
      const defaultDuration = getDefaultDuration(formData.maxSpeakers);
      
      // 현재 설정된 시간이 최소 시간보다 작으면 기본값으로 설정
      if (formData.duration < minDuration) {
        setFormData(prev => ({ ...prev, duration: defaultDuration }));
      }
    }
  }, [formData.debateType, formData.maxSpeakers]);

  const handleInputChange = (field: keyof DiscussionData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDurationChange = (value: number[]) => {
    const newDuration = value[0];
    const minDuration = getMinDuration(formData.maxSpeakers);
    
    // 선택 가능한 시간 범위 내에서만 설정
    if (newDuration >= minDuration) {
      setFormData(prev => ({ ...prev, duration: newDuration }));
    }
  };

  const handleDebateTypeChange = (type: DebateType) => {
    setFormData(prev => ({ ...prev, debateType: type }));
  };

  const handleSpeakersChange = (count: number) => {
    setFormData(prev => ({ ...prev, maxSpeakers: count }));
  };

  const handlePositionSelect = (position: Position) => {
    setFormData(prev => ({ 
      ...prev, 
      position
      // 텍스트는 유지하여 입장 변경 시에도 이전 입력값 보존
    }));
  };

  const handlePositionTextChange = (position: Position, value: string) => {
    if (position === 'A입장') {
      setFormData(prev => ({ ...prev, aPosition: value }));
    } else {
      setFormData(prev => ({ ...prev, bPosition: value }));
    }
  };

  const getCurrentPositionText = () => {
    return formData.position === 'A입장' ? formData.aPosition : formData.bPosition;
  };

  const handleSubmit = () => {
    // 필수 필드 검증 - 선택한 입장의 텍스트가 입력되어야 함
    const currentPositionText = getCurrentPositionText();
    if (!formData.title.trim() || !formData.category || !currentPositionText.trim()) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    onCreate(formData);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    // 폼 데이터 초기화
    setFormData({
      title: '',
      description: '',
      category: DISCUSSION_CATEGORIES[0],
      position: 'A입장',
      aPosition: '',
      bPosition: '',
      debateType: '일반토론',
      duration: 20,
      maxSpeakers: 2,
      maxAudience: 20
    });
  };

  const currentPositionText = getCurrentPositionText();
  const isValid = formData.title.trim() && formData.category && currentPositionText.trim();
  const minDuration = getMinDuration(formData.maxSpeakers);
  const availableDurations = getAvailableDurations(formData.maxSpeakers);

  if (isMobile) {
    // 모바일 전체 화면 모달
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-none w-screen h-screen max-h-screen p-0 m-0 rounded-none border-0 flex flex-col">
          {/* 고정된 헤더 */}
          <div className="flex-shrink-0 bg-surface border-b border-divider elevation-2 px-4 py-4 safe-top">
            <DialogHeader>
              <DialogTitle className="text-lg">토론방 만들기</DialogTitle>
              <DialogDescription>
                새로운 토론방을 생성하여 다른 사용자들과 토론을 시작해보세요.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          {/* 스크롤 가능한 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto bg-background">
            <div className="space-y-6 p-4 pb-24">{/* 하단 버튼 공간 확보 */}
            {/* 토론 주제 */}
            <div className="space-y-2">
              <Label htmlFor="title">토론 주제 *</Label>
              <Input
                id="title"
                placeholder="토론하고 싶은 주제를 입력하세요"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100자
              </p>
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="토론에 대한 자세한 설명을 입력하세요 (선택사항)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500자
              </p>
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label>카테고리 *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {DISCUSSION_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 토론 입장 (하나만 선택, 각 입장 텍스트 유지) */}
            <div className="space-y-4">
              <Label>토론 입장 선택 *</Label>
              <div className="grid grid-cols-2 gap-4">
                {/* A입장 */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    formData.position === 'A입장' 
                      ? 'border-primary bg-accent/70' 
                      : 'border-border bg-muted/30 hover:border-muted-foreground/30'
                  }`}
                  onClick={() => handlePositionSelect('A입장')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">A</span>
                      </div>
                      <Label className="text-sm font-medium cursor-pointer">A입장</Label>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      formData.position === 'A입장' 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground/30'
                    }`}>
                      {formData.position === 'A입장' && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full m-0.5"></div>
                      )}
                    </div>
                  </div>
                  {formData.position === 'A입장' && (
                    <Input
                      placeholder="A입장을 입력하세요"
                      value={formData.aPosition}
                      onChange={(e) => handlePositionTextChange('A입장', e.target.value)}
                      maxLength={50}
                      className="border-0 bg-transparent p-0 focus:ring-0 focus:ring-offset-0 placeholder:text-muted-foreground/60"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {formData.position !== 'A입장' && (
                    <div className="text-muted-foreground/60 text-sm">
                      {formData.aPosition.trim() 
                        ? `"${formData.aPosition}"` 
                        : 'A입장을 선택하세요'
                      }
                    </div>
                  )}
                </div>

                {/* B입장 */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    formData.position === 'B입장' 
                      ? 'border-primary bg-accent/70' 
                      : 'border-border bg-muted/30 hover:border-muted-foreground/30'
                  }`}
                  onClick={() => handlePositionSelect('B입장')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">B</span>
                      </div>
                      <Label className="text-sm font-medium cursor-pointer">B입장</Label>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      formData.position === 'B입장' 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground/30'
                    }`}>
                      {formData.position === 'B입장' && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full m-0.5"></div>
                      )}
                    </div>
                  </div>
                  {formData.position === 'B입장' && (
                    <Input
                      placeholder="B입장을 입력하세요"
                      value={formData.bPosition}
                      onChange={(e) => handlePositionTextChange('B입장', e.target.value)}
                      maxLength={50}
                      className="border-0 bg-transparent p-0 focus:ring-0 focus:ring-offset-0 placeholder:text-muted-foreground/60"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {formData.position !== 'B입장' && (
                    <div className="text-muted-foreground/60 text-sm">
                      {formData.bPosition.trim() 
                        ? `"${formData.bPosition}"` 
                        : 'B입장을 선택하세요'
                      }
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                토론에 참여할 입장을 선택하고 구체적인 입장을 입력해주세요. 입력한 내용은 입장 변경 시에도 유지됩니다.
              </p>
            </div>

            {/* 토론 방식 (뱃지 형태) */}
            <div className="space-y-3">
              <Label>토론 방식</Label>
              <div className="flex gap-3">
                <Badge
                  className={`cursor-pointer px-4 py-2 text-sm transition-colors hover:opacity-80 ${getDebateTypeBadgeClass('일반토론', formData.debateType === '일반토론')}`}
                  onClick={() => handleDebateTypeChange('일반토론')}
                >
                  일반 토론
                </Badge>
                <Badge
                  className={`cursor-pointer px-4 py-2 text-sm transition-colors hover:opacity-80 ${getDebateTypeBadgeClass('3분토론', formData.debateType === '3분토론')}`}
                  onClick={() => handleDebateTypeChange('3분토론')}
                >
                  3분 토론
                </Badge>
              </div>
            </div>

            {/* 최대 발언자 수 */}
            <div className="space-y-3">
              <Label>최대 발언자 수</Label>
              <RadioGroup 
                value={formData.maxSpeakers.toString()} 
                onValueChange={(value) => handleSpeakersChange(parseInt(value))}
                className="flex gap-6"
              >
                {SPEAKER_OPTIONS.map((count) => (
                  <div key={count} className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    formData.maxSpeakers === count ? 'bg-accent border border-primary' : 'hover:bg-accent/50'
                  }`}>
                    <RadioGroupItem value={count.toString()} id={`speakers-${count}`} />
                    <Label htmlFor={`speakers-${count}`} className="cursor-pointer">{count}명</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* 토론 시간 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>토론 시간</Label>
                <span className="text-sm font-medium">
                  {formData.duration}분
                  {formData.debateType === '3분토론' && ` (${formData.maxSpeakers}명 × 1분)`}
                </span>
              </div>
              
              {formData.debateType === '일반토론' ? (
                <div className="space-y-2">
                  <Slider
                    value={[formData.duration]}
                    onValueChange={handleDurationChange}
                    min={20}
                    max={80}
                    step={20}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {DURATION_OPTIONS.map((duration) => {
                      const isAvailable = availableDurations.includes(duration);
                      return (
                        <span 
                          key={duration} 
                          className={`transition-colors ${
                            isAvailable 
                              ? formData.duration === duration 
                                ? 'text-primary font-medium' 
                                : 'text-foreground'
                              : 'text-muted-foreground/50'
                          }`}
                        >
                          {duration}분
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.maxSpeakers}명의 발언자로 인해 최소 {minDuration}분부터 선택 가능합니다.
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  3분 토론은 발언자 수에 따라 자동으로 시간이 설정됩니다.
                </div>
              )}
            </div>

            {/* 최대 청중 */}
            <div className="space-y-3">
              <Label>최대 청중</Label>
              <RadioGroup 
                value={formData.maxAudience.toString()} 
                onValueChange={(value) => handleInputChange('maxAudience', parseInt(value))}
                className="grid grid-cols-3 gap-3"
              >
                {AUDIENCE_OPTIONS.map((count) => (
                  <div key={count} className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    formData.maxAudience === count ? 'bg-accent border border-primary' : 'hover:bg-accent/50'
                  }`}>
                    <RadioGroupItem value={count.toString()} id={`audience-${count}`} />
                    <Label htmlFor={`audience-${count}`} className="cursor-pointer">
                      {count === 0 ? '없음' : `${count}명`}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            </div>
          </div>

          {/* 고정된 하단 버튼 영역 */}
          <div className="flex-shrink-0 bg-surface border-t border-divider elevation-4 p-4 safe-bottom">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-12"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isValid}
                className="flex-1 h-12"
              >
                만들기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 데스크톱 모달
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl mx-2 sm:mx-auto max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>토론방 만들기</DialogTitle>
          <DialogDescription>
            새로운 토론방을 생성하여 다른 사용자들과 토론을 시작해보세요.
          </DialogDescription>
        </DialogHeader>
        
        {/* 스크롤 가능한 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6 py-4">
            {/* 토론 주제 */}
            <div className="space-y-2">
              <Label htmlFor="title">토론 주제 *</Label>
              <Input
                id="title"
                placeholder="토론하고 싶은 주제를 입력하세요"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100자
              </p>
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="토론에 대한 자세한 설명을 입력하세요 (선택사항)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500자
              </p>
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label>카테고리 *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {DISCUSSION_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 토론 입장 (하나만 선택, 각 입장 텍스트 유지) */}
            <div className="space-y-4">
              <Label>토론 입장 선택 *</Label>
              <div className="grid grid-cols-2 gap-4">
                {/* A입장 */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    formData.position === 'A입장' 
                      ? 'border-primary bg-accent/70' 
                      : 'border-border bg-muted/30 hover:border-muted-foreground/30'
                  }`}
                  onClick={() => handlePositionSelect('A입장')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">A</span>
                      </div>
                      <Label className="text-sm font-medium cursor-pointer">A입장</Label>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      formData.position === 'A입장' 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground/30'
                    }`}>
                      {formData.position === 'A입장' && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full m-0.5"></div>
                      )}
                    </div>
                  </div>
                  {formData.position === 'A입장' && (
                    <Input
                      placeholder="A입장을 입력하세요"
                      value={formData.aPosition}
                      onChange={(e) => handlePositionTextChange('A입장', e.target.value)}
                      maxLength={50}
                      className="border-0 bg-transparent p-0 focus:ring-0 focus:ring-offset-0 placeholder:text-muted-foreground/60"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {formData.position !== 'A입장' && (
                    <div className="text-muted-foreground/60 text-sm">
                      {formData.aPosition.trim() 
                        ? `"${formData.aPosition}"` 
                        : 'A입장을 선택하세요'
                      }
                    </div>
                  )}
                </div>

                {/* B입장 */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    formData.position === 'B입장' 
                      ? 'border-primary bg-accent/70' 
                      : 'border-border bg-muted/30 hover:border-muted-foreground/30'
                  }`}
                  onClick={() => handlePositionSelect('B입장')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">B</span>
                      </div>
                      <Label className="text-sm font-medium cursor-pointer">B입장</Label>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      formData.position === 'B입장' 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground/30'
                    }`}>
                      {formData.position === 'B입장' && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full m-0.5"></div>
                      )}
                    </div>
                  </div>
                  {formData.position === 'B입장' && (
                    <Input
                      placeholder="B입장을 입력하세요"
                      value={formData.bPosition}
                      onChange={(e) => handlePositionTextChange('B입장', e.target.value)}
                      maxLength={50}
                      className="border-0 bg-transparent p-0 focus:ring-0 focus:ring-offset-0 placeholder:text-muted-foreground/60"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {formData.position !== 'B입장' && (
                    <div className="text-muted-foreground/60 text-sm">
                      {formData.bPosition.trim() 
                        ? `"${formData.bPosition}"` 
                        : 'B입장을 선택하세요'
                      }
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                토론에 참여할 입장을 선택하고 구체적인 입장을 입력해주세요. 입력한 내용은 입장 변경 시에도 유지됩니다.
              </p>
            </div>

            {/* 토론 방식 (뱃지 형태) */}
            <div className="space-y-3">
              <Label>토론 방식</Label>
              <div className="flex gap-3">
                <Badge
                  className={`cursor-pointer px-4 py-2 text-sm transition-colors hover:opacity-80 ${getDebateTypeBadgeClass('일반토론', formData.debateType === '일반토론')}`}
                  onClick={() => handleDebateTypeChange('일반토론')}
                >
                  일반 토론
                </Badge>
                <Badge
                  className={`cursor-pointer px-4 py-2 text-sm transition-colors hover:opacity-80 ${getDebateTypeBadgeClass('3분토론', formData.debateType === '3분토론')}`}
                  onClick={() => handleDebateTypeChange('3분토론')}
                >
                  3분 토론
                </Badge>
              </div>
            </div>

            {/* 최대 발언자 수 */}
            <div className="space-y-3">
              <Label>최대 발언자 수</Label>
              <RadioGroup 
                value={formData.maxSpeakers.toString()} 
                onValueChange={(value) => handleSpeakersChange(parseInt(value))}
                className="flex gap-6"
              >
                {SPEAKER_OPTIONS.map((count) => (
                  <div key={count} className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    formData.maxSpeakers === count ? 'bg-accent border border-primary' : 'hover:bg-accent/50'
                  }`}>
                    <RadioGroupItem value={count.toString()} id={`speakers-${count}`} />
                    <Label htmlFor={`speakers-${count}`} className="cursor-pointer">{count}명</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* 토론 시간 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>토론 시간</Label>
                <span className="text-sm font-medium">
                  {formData.duration}분
                  {formData.debateType === '3분토론' && ` (${formData.maxSpeakers}명 × 1분)`}
                </span>
              </div>
              
              {formData.debateType === '일반토론' ? (
                <div className="space-y-2">
                  <Slider
                    value={[formData.duration]}
                    onValueChange={handleDurationChange}
                    min={20}
                    max={80}
                    step={20}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {DURATION_OPTIONS.map((duration) => {
                      const isAvailable = availableDurations.includes(duration);
                      return (
                        <span 
                          key={duration} 
                          className={`transition-colors ${
                            isAvailable 
                              ? formData.duration === duration 
                                ? 'text-primary font-medium' 
                                : 'text-foreground'
                              : 'text-muted-foreground/50'
                          }`}
                        >
                          {duration}분
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.maxSpeakers}명의 발언자로 인해 최소 {minDuration}분부터 선택 가능합니다.
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  3분 토론은 발언자 수에 따라 자동으로 시간이 설정됩니다.
                </div>
              )}
            </div>

            {/* 최대 청중 */}
            <div className="space-y-3">
              <Label>최대 청중</Label>
              <RadioGroup 
                value={formData.maxAudience.toString()} 
                onValueChange={(value) => handleInputChange('maxAudience', parseInt(value))}
                className="grid grid-cols-3 gap-3"
              >
                {AUDIENCE_OPTIONS.map((count) => (
                  <div key={count} className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    formData.maxAudience === count ? 'bg-accent border border-primary' : 'hover:bg-accent/50'
                  }`}>
                    <RadioGroupItem value={count.toString()} id={`audience-${count}`} />
                    <Label htmlFor={`audience-${count}`} className="cursor-pointer">
                      {count === 0 ? '없음' : `${count}명`}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex-shrink-0 pt-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid}
              className="flex-1"
            >
              만들기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}