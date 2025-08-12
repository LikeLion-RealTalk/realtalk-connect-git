import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Brain } from 'lucide-react';
import { Position, POSITIONS } from '../../types/discussion';

interface SummaryItem {
  id: string;
  speakerName: string;
  position: Position;
  summary: string;
  timestamp: Date;
}

interface AISummaryProps {
  summaries: SummaryItem[];
  isGenerating?: boolean;
}

// 헤더 컴포넌트 분리
export function AISummaryHeader() {
  return (
    <div className="p-4 border-b border-divider flex items-center justify-between bg-surface elevation-1">
      <h4 className="flex items-center gap-2 text-on-surface font-medium">
        <Brain className="h-5 w-5 text-primary" />
        AI 요약
      </h4>
    </div>
  );
}

// 콘텐츠 컴포넌트 분리
export function AISummaryBody({ summaries, isGenerating = false }: AISummaryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // 사용자 스크롤 감지
  const handleScroll = () => {
    if (scrollRef.current) {
      const element = scrollRef.current;
      const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 5;
      
      if (!isAtBottom) {
        isUserScrollingRef.current = true;
        // 3초 후 자동 스크롤 재개
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          isUserScrollingRef.current = false;
        }, 3000);
      } else {
        isUserScrollingRef.current = false;
      }
    }
  };

  // 새로운 요약이 추가될 때마다 자동으로 하단으로 스크롤 (사용자가 수동 스크롤 중이 아닐 때만)
  useEffect(() => {
    if (scrollRef.current && !isUserScrollingRef.current) {
      const element = scrollRef.current;
      // 부드러운 스크롤 애니메이션
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [summaries]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const getPositionColor = (position: Position) => {
    return position === POSITIONS[0] ? 'bg-green-400 text-white' : 'bg-red-400 text-white';
  };

  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full space-y-4 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent smooth-scroll"
    >
        {summaries.map((summary) => (
          <div key={summary.id} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={getPositionColor(summary.position)}>
                {summary.speakerName}님의 발언 요약
              </Badge>
              <span className="text-xs text-muted-foreground">
                {(() => {
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const summaryDate = new Date(summary.timestamp.getFullYear(), summary.timestamp.getMonth(), summary.timestamp.getDate());
                  
                  const timeString = summary.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  });
                  
                  if (summaryDate.getTime() !== today.getTime()) {
                    const dateString = summary.timestamp.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\./g, '-').replace(/ /g, '').slice(0, -1);
                    
                    return `${dateString} ${timeString}`;
                  }
                  
                  return timeString;
                })()}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{summary.summary}</p>
          </div>
        ))}
        
        {/* AI 요약 생성 중 표시 */}
        {isGenerating && (
          <div className="p-3 border rounded-lg space-y-2 bg-muted/50 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
              <span className="text-sm text-muted-foreground">AI가 발언을 요약하고 있습니다...</span>
            </div>
          </div>
        )}
        
        {summaries.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-muted-foreground">
            아직 요약된 발언이 없습니다.
          </div>
        )}
    </div>
  );
}

// 기존 전체 컴포넌트 (데스크톱용)
export function AISummary({ summaries, isGenerating }: AISummaryProps) {
  return (
    <div className="h-full flex flex-col">
      <AISummaryHeader />
      <AISummaryBody summaries={summaries} isGenerating={isGenerating} />
    </div>
  );
}