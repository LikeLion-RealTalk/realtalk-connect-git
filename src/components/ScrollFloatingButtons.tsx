import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ScrollFloatingButtons = () => {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show buttons when scrolled more than 200px and not at the very bottom
      setShowButtons(scrollY > 200 && scrollY < documentHeight - windowHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-2">
      {/* Scroll to Top Button */}
      <Button
        onClick={scrollToTop}
        size="icon"
        className="w-12 h-12 rounded-full shadow-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border transition-all duration-200"
        aria-label="최상단으로 이동"
      >
        <ChevronUp className="w-5 h-5" />
      </Button>
      
      {/* Scroll to Bottom Button */}
      <Button
        onClick={scrollToBottom}
        size="icon"
        className="w-12 h-12 rounded-full shadow-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border transition-all duration-200"
        aria-label="최하단으로 이동"
      >
        <ChevronDown className="w-5 h-5" />
      </Button>
    </div>
  );
};