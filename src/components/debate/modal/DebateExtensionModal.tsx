import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Clock, AlertTriangle } from 'lucide-react';
import { DebateType } from '../../../types/discussion';

interface DebateExtensionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExtend: (minutes: number) => void;
    onEndDebate: () => void;
    remainingSeconds: number;
    maxSpeakers: number;
    debateType: DebateType;
}

export function DebateExtensionModal({
                                         isOpen,
                                         onClose,
                                         onExtend,
                                         onEndDebate,
                                         remainingSeconds,
                                         maxSpeakers,
                                         debateType
                                     }: DebateExtensionModalProps) {
    const [currentSeconds, setCurrentSeconds] = useState(remainingSeconds);

    // 모달이 열릴 때 현재 시간으로 초기화
    useEffect(() => {
        if (isOpen) {
            setCurrentSeconds(remainingSeconds);
        }
    }, [isOpen, remainingSeconds]);

    // 실시간 타이머 업데이트
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setCurrentSeconds(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    // 연장 시간 계산 로직
    const getExtensionMinutes = () => {
        if (debateType === '일반토론') {
            return 10;
        }

        // 3분토론의 경우 발언자 수에 따라 결정
        if (maxSpeakers <= 2) return 3;
        if (maxSpeakers <= 4) return 4;
        if (maxSpeakers <= 6) return 6;
        return 8; // 8명 이상
    };

    const extensionMinutes = getExtensionMinutes();

    // 남은 시간을 분:초 형태로 포맷
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSecondsInTime = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}분 ${remainingSecondsInTime.toString().padStart(2, '0')}초`;
    };

    const handleExtend = () => {
        onExtend(extensionMinutes);
        onClose();
    };

    const handleEndDebate = () => {
        onEndDebate();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-400 dark:bg-orange-400">
                            <AlertTriangle className="w-6 h-6 text-white dark:text-white" />
                        </div>
                        <div>
                            <DialogTitle>시간이 얼마 남지 않았습니다</DialogTitle>
                            <DialogDescription className="mt-1">
                                토론을 연장하시겠습니까?
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* 남은 시간 표시 */}
                    <div className="text-center">
                        <div className="relative bg-red-50 dark:bg-red-900/20 rounded-lg px-12 py-9">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-5 h-5 text-muted-foreground" />
                                    <p className="text-lg text-muted-foreground">토론 종료까지</p>
                                </div>
                                <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                                    {formatTime(currentSeconds)} 남음
                                </p>
                            </div>

                            {/* 연장 시간 안내 - 타이머 영역 우측 하단 */}
                            <div className="absolute bottom-3 right-4">
                                <p className="text-xs text-muted-foreground">
                                    {debateType === '일반토론'
                                        ? '일반토론은 10분씩 연장됩니다.'
                                        : `현재 발언자 ${maxSpeakers}명 기준으로 ${extensionMinutes}분 연장됩니다.`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 경고 메시지 */}
                    {/* <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
              💡 토론 연장은 참여자들의 동의가 필요합니다.
            </p>
          </div> */}
                </div>

                <DialogFooter className="flex gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        취소
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleEndDebate}
                        className="flex-1"
                    >
                        토론 종료
                    </Button>
                    <Button
                        onClick={handleExtend}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {extensionMinutes}분 추가
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}