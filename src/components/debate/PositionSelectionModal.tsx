import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Users } from 'lucide-react';
import { DiscussionCategory, DebateType, Position, POSITIONS } from '../../types/discussion';
import { NicknameInput } from '../NicknameInput';
import { useUser } from '../UserProvider';

interface PositionSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (position: Position) => void;
  category: DiscussionCategory;
  debateType: DebateType;
  title: string;
  aDescription: string;
  bDescription: string;
}

export function PositionSelectionModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  category,
  debateType,
  title,
  aDescription,
  bDescription
}: PositionSelectionModalProps) {
  const { nickname, setNickname: setGlobalNickname } = useUser();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [localNickname, setLocalNickname] = useState('');

  // 모달이 열릴 때 기존 닉네임을 로컬 상태로 복사
  useEffect(() => {
    if (isOpen) {
      setLocalNickname(nickname);
    }
  }, [isOpen, nickname]);

  const handleConfirm = () => {
    if (selectedPosition && localNickname.trim()) {
      // 글로벌 닉네임 상태 업데이트
      setGlobalNickname(localNickname.trim());
      onConfirm(selectedPosition);
    }
  };

  const handleClose = () => {
    setSelectedPosition(null);
    setLocalNickname('');
    onClose();
  };

  const handleNicknameChange = (newNickname: string) => {
    setLocalNickname(newNickname);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl mx-2 sm:mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary elevation-2">
              <Users className="w-6 h-6 text-on-primary" />
            </div>
            <div>
              <DialogTitle className="text-on-surface">토론 입장을 선택해주세요</DialogTitle>
              <DialogDescription className="mt-1 text-on-surface-variant">
                토론에 참여하기 전에 본인의 입장을 결정해주세요.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* 토론 정보 */}
          <Card className="elevation-1 bg-surface border-divider">
            <CardContent className="p-4">
              <div className="flex gap-2 mb-3">
                <Badge className={`rounded-full ${debateType === '3분토론' ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'}`}>
                  {debateType}
                </Badge>
                <Badge className="bg-green-500 text-white rounded-full">진행중</Badge>
              </div>
              
              <h3 className="mb-2 line-clamp-2 text-on-surface font-medium">{title}</h3>
              
              <p className="text-sm text-on-surface-variant mb-1">{category}</p>
              <p className="text-sm text-on-surface-variant mb-4">토론 진행 중</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-divider text-on-surface-variant bg-surface-variant/50 rounded-full">
                  발언자 2/6명
                </Badge>
                <Badge variant="outline" className="border-divider text-on-surface-variant bg-surface-variant/50 rounded-full">
                  청중 8/20명
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 닉네임 설정 */}
          <NicknameInput
            nickname={localNickname}
            onNicknameChange={handleNicknameChange}
            autoGenerate={isOpen && !localNickname}
            buttonVariant="shuffle"
            description="최대 20자까지 입력 가능합니다."
          />

          {/* 입장 선택 */}
          <div className="space-y-4">
            <h4 className="text-center text-on-surface-variant font-medium">나의 입장은</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* A입장 버튼 */}
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] elevation-1 hover:elevation-4 transition-elevation ${
                  selectedPosition === POSITIONS[0] 
                    ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20 scale-[1.02] elevation-4 border-green-200 dark:border-green-800' 
                    : 'hover:bg-green-50/50 dark:hover:bg-green-900/10 border-green-100 dark:border-green-900/30'
                }`}
                onClick={() => setSelectedPosition(POSITIONS[0])}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">{aDescription}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* B입장 버튼 */}
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] elevation-1 hover:elevation-4 transition-elevation ${
                  selectedPosition === POSITIONS[1] 
                    ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20 scale-[1.02] elevation-4 border-red-200 dark:border-red-800' 
                    : 'hover:bg-red-50/50 dark:hover:bg-red-900/10 border-red-100 dark:border-red-900/30'
                }`}
                onClick={() => setSelectedPosition(POSITIONS[1])}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">B</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium">{bDescription}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>

        <DialogFooter className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 hover:scale-[1.02] transition-material border-divider text-on-surface hover:bg-surface-variant/50"
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedPosition || !localNickname.trim()}
            className="flex-1 hover:scale-[1.02] transition-material bg-primary text-on-primary hover:bg-primary-variant disabled:hover:scale-100 disabled:opacity-50"
          >
            입장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}