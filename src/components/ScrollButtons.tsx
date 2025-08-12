import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function ScrollButtons() {
  const [showButtons, setShowButtons] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      setCanScrollUp(scrollTop > 200);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 200);
      setShowButtons(scrollTop > 200 || scrollTop < scrollHeight - clientHeight - 200);
    };

    checkScroll();
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  if (!showButtons) return null;

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-2">
      {canScrollUp && (
        <Button
          size="icon"
          variant="secondary"
          onClick={scrollToTop}
          className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 bg-background/80 backdrop-blur-sm border border-border/50"
          aria-label="최상단으로 이동"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}
      
      {canScrollDown && (
        <Button
          size="icon"
          variant="secondary"
          onClick={scrollToBottom}
          className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 bg-background/80 backdrop-blur-sm border border-border/50"
          aria-label="최하단으로 이동"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}