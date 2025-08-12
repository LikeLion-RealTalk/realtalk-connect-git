import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function DebateScrollButtons() {
  const [showButtons, setShowButtons] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      // 토론방의 발언 내용 영역을 찾습니다
      const speechContent = document.querySelector('[data-scroll-area="speech-content"]') as HTMLElement;
      
      if (speechContent) {
        const scrollTop = speechContent.scrollTop;
        const scrollHeight = speechContent.scrollHeight;
        const clientHeight = speechContent.clientHeight;

        setCanScrollUp(scrollTop > 50);
        setCanScrollDown(scrollTop < scrollHeight - clientHeight - 50);
        setShowButtons(scrollHeight > clientHeight + 100);
      }
    };

    checkScroll();
    
    // 발언 내용 영역의 스크롤 이벤트 리스너 추가
    const speechContent = document.querySelector('[data-scroll-area="speech-content"]');
    if (speechContent) {
      speechContent.addEventListener('scroll', checkScroll);
    }

    // MutationObserver로 새로운 발언이 추가될 때도 체크
    const observer = new MutationObserver(checkScroll);
    if (speechContent) {
      observer.observe(speechContent, { childList: true, subtree: true });
    }

    return () => {
      if (speechContent) {
        speechContent.removeEventListener('scroll', checkScroll);
      }
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    const speechContent = document.querySelector('[data-scroll-area="speech-content"]') as HTMLElement;
    if (speechContent) {
      speechContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const scrollToBottom = () => {
    const speechContent = document.querySelector('[data-scroll-area="speech-content"]') as HTMLElement;
    if (speechContent) {
      speechContent.scrollTo({
        top: speechContent.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!showButtons) return null;

  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-2">
      {canScrollUp && (
        <Button
          size="icon"
          variant="secondary"
          onClick={scrollToTop}
          className="h-8 w-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 bg-background/90 backdrop-blur-sm border border-border/50"
          aria-label="최상단으로 이동"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
      )}
      
      {canScrollDown && (
        <Button
          size="icon"
          variant="secondary"
          onClick={scrollToBottom}
          className="h-8 w-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 bg-background/90 backdrop-blur-sm border border-border/50"
          aria-label="최하단으로 이동"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}