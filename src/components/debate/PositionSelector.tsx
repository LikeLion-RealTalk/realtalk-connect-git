import { useState, useEffect, useRef } from 'react';
import { PositionChangeModal } from './modal/PositionChangeModal';
import { DiscussionCategory, DebateType, Position, POSITIONS } from '../../types/discussion';

interface PositionSelectorProps {
  supportRatio: number;
  currentPosition: Position | null;
  onPositionChange: (position: Position) => void;
  debateTitle: string;
  category: DiscussionCategory;
  debateType: DebateType;
  aDescription: string;
  bDescription: string;
  isUserCurrentlySpeaking?: boolean;
  isSpeakerMode?: boolean;
  sideA?: string;
  sideB?: string;
}

export function PositionSelector({ 
  supportRatio, 
  currentPosition, 
  onPositionChange,
  debateTitle,
  category,
  debateType,
  aDescription,
  bDescription,
  isUserCurrentlySpeaking = false,
  isSpeakerMode = false,
  sideA,
  sideB
}: PositionSelectorProps) {
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);
  const [pendingPosition, setPendingPosition] = useState<Position | null>(null);

  // 애니메이션을 위한 상태
  const [animatedRatio, setAnimatedRatio] = useState(supportRatio);
  const animationRef = useRef<number | null>(null);

  // supportRatio 변경 시 부드러운 애니메이션 적용
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startValue = animatedRatio;
    const endValue = supportRatio;
    const startTime = Date.now();
    const duration = 1000; // 1초 애니메이션

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeInOutCubic 이징 함수
      const eased = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      const currentValue = startValue + (endValue - startValue) * eased;
      setAnimatedRatio(Math.round(currentValue * 100) / 100);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [supportRatio]);

  const handlePositionClick = (position: Position) => {
    if (currentPosition === position) return; // 같은 입장이면 아무것도 안함
    
    // 발언자 모드에서 현재 발언 중인 경우 입장 변경 차단
    if (isSpeakerMode && isUserCurrentlySpeaking && currentPosition !== null) {
      // 차단 로직은 DebatePage의 handlePositionChange에서 처리되므로 
      // 여기서는 그냥 함수를 호출해서 에러 메시지가 표시되도록 함
      onPositionChange(position);
      return;
    }
    
    if (currentPosition === null) {
      // 처음 입장 선택
      onPositionChange(position);
    } else {
      // 입장 변경 - 변경할 입장을 저장하고 모달 표시
      setPendingPosition(position);
      setIsChangeModalOpen(true);
    }
  };

  const handleChartClick = (position: Position) => {
    handlePositionClick(position);
  };

  const handlePositionChangeConfirm = (newPosition: Position) => {
    onPositionChange(newPosition);
    setIsChangeModalOpen(false);
    setPendingPosition(null);
  };

  const handleModalClose = () => {
    setIsChangeModalOpen(false);
    setPendingPosition(null);
  };

  return (
    <>
      <div className="bg-card rounded-lg">
        <div className="p-4">
          <div className="space-y-3">
            {/* 여론 차트 */}
            <div className={`relative h-8 w-full overflow-hidden rounded-full bg-red-200 dark:bg-red-900/30 transition-all duration-300 ${
              currentPosition === POSITIONS[1] ? 'ring-4 ring-red-500 ring-offset-2' : 
              currentPosition === POSITIONS[0] ? 'ring-4 ring-green-500 ring-offset-2' : ''
            } ${isSpeakerMode && isUserCurrentlySpeaking ? 'opacity-60' : ''}`}>
              {/* 배경 (B입장 영역) - 클릭 가능 */}
              <div 
                className={`absolute inset-0 transition-all duration-200 ${
                  isSpeakerMode && isUserCurrentlySpeaking 
                    ? 'cursor-not-allowed bg-red-200 dark:bg-red-900/30' 
                    : `cursor-pointer ${hoveredPosition === POSITIONS[1] 
                        ? 'bg-red-300 dark:bg-red-800/50' 
                        : 'bg-red-200 dark:bg-red-900/30'
                      }`
                }`}
                onClick={() => handleChartClick(POSITIONS[1])}
                onMouseEnter={() => !isUserCurrentlySpeaking && setHoveredPosition(POSITIONS[1])}
                onMouseLeave={() => setHoveredPosition(null)}
              />
              
              {/* A입장 영역 - 클릭 가능 */}
              <div 
                className={`absolute left-0 top-0 h-full transition-all duration-300 rounded-l-full ${
                  isSpeakerMode && isUserCurrentlySpeaking 
                    ? 'cursor-not-allowed bg-green-400 dark:bg-green-500' 
                    : `cursor-pointer ${hoveredPosition === POSITIONS[0] 
                        ? 'bg-green-500 dark:bg-green-600' 
                        : 'bg-green-400 dark:bg-green-500'
                      }`
                }`}
                style={{ width: `${animatedRatio}%` }}
                onClick={() => handleChartClick(POSITIONS[0])}
                onMouseEnter={() => !isUserCurrentlySpeaking && setHoveredPosition(POSITIONS[0])}
                onMouseLeave={() => setHoveredPosition(null)}
              />
              
              {/* 라벨들 */}
              <div className="absolute inset-0 flex items-center justify-between px-3 text-xs pointer-events-none">
                {/* A입장 라벨 (왼쪽) */}
                <span className={`transition-colors duration-300 flex items-center gap-1 ${
                  animatedRatio > 50 
                    ? 'text-white font-medium' 
                    : 'text-green-700 dark:text-green-200 font-medium'
                } ${
                  hoveredPosition === POSITIONS[0] || currentPosition === POSITIONS[0]
                    ? 'drop-shadow-sm'
                    : ''
                }`}>
                  {sideA || POSITIONS[0]} {Math.round(animatedRatio)}%
                  {currentPosition === POSITIONS[0] && <span className="text-yellow-400">😊</span>}
                </span>
                
                {/* B입장 라벨 (오른쪽) */}
                <span className={`transition-colors duration-300 flex items-center gap-1 ${
                  animatedRatio < 50 
                    ? 'text-red-700 dark:text-red-200 font-medium' 
                    : 'text-red-600/70 dark:text-red-400/70'
                } ${
                  hoveredPosition === POSITIONS[1] || currentPosition === POSITIONS[1]
                    ? 'text-red-800 dark:text-red-100 font-medium drop-shadow-sm'
                    : ''
                }`}>
                  {sideB || POSITIONS[1]} {Math.round(100 - animatedRatio)}%
                  {currentPosition === POSITIONS[1] && <span className="text-yellow-400">😊</span>}
                </span>
              </div>

              {/* 호버 시 툴팁 효과 */}
              {hoveredPosition && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                  {hoveredPosition === POSITIONS[0] ? `${POSITIONS[0]} 선택하기` : `${POSITIONS[1]} 선택하기`}
                </div>
              )}
            </div>

            {/* 입장을 선택하지 않은 경우 안내 */}
            {!currentPosition && (
              <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                차트를 클릭하여 입장을 선택해주세요
                {hoveredPosition && (
                  <div className="text-xs mt-1">
                    <strong className={hoveredPosition === POSITIONS[0] ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {hoveredPosition}
                    </strong>을 선택하시겠습니까?
                  </div>
                )}
              </div>
            )}
            
            {/* 현재 발언 중일 때 안내 메시지 */}
            {isSpeakerMode && isUserCurrentlySpeaking && currentPosition && (
              <div className="text-center text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                🎤 발언 중에는 입장을 변경할 수 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {currentPosition && (
        <PositionChangeModal
          isOpen={isChangeModalOpen}
          onClose={handleModalClose}
          onConfirm={handlePositionChangeConfirm}
          currentPosition={currentPosition}
          title={debateTitle}
          category={category}
          debateType={debateType}
          aDescription={aDescription}
          bDescription={bDescription}
        />
      )}
    </>
  );
}