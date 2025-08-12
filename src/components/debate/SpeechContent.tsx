import { useEffect, useRef } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { DebateScrollButtons } from './DebateScrollButtons';
import { Position, FactCheckResult, POSITIONS, FACT_CHECK_RESULTS } from '../../types/discussion';

interface SpeechMessage {
  id: string;
  speakerName: string;
  position: Position;
  content: string;
  factCheck?: {
    result: FactCheckResult;
    explanation: string;
    source?: string;
  };
  timestamp: Date;
}

interface SpeechContentProps {
  messages: SpeechMessage[];
}

// 헤더 컴포넌트 분리
export function SpeechContentHeader() {
  return (
    <div className="p-4 border-b border-divider flex items-center justify-between bg-surface elevation-1">
      <h4 className="flex items-center gap-2 text-on-surface font-medium">
        <MessageSquare className="h-5 w-5 text-primary" />
        발언 내용
      </h4>
    </div>
  );
}

// 콘텐츠 컴포넌트 분리
export function SpeechContentBody({ messages }: SpeechContentProps) {
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

  // 새로운 메시지가 추가될 때마다 자동으로 하단으로 스크롤 (사용자가 수동 스크롤 중이 아닐 때만)
  useEffect(() => {
    if (scrollRef.current && !isUserScrollingRef.current) {
      const element = scrollRef.current;
      // 부드러운 스크롤 애니메이션
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

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

  const getFactCheckColor = (result: string) => {
    switch (result) {
      case FACT_CHECK_RESULTS[0]: // '사실'
        return 'bg-green-200 text-green-950 border-green-300';
      case FACT_CHECK_RESULTS[1]: // '거짓'
        return 'bg-red-200 text-red-950 border-red-300';
      case FACT_CHECK_RESULTS[2]: // '불분명'
        return 'bg-gray-200 text-gray-950 border-gray-300';
      default:
        return 'bg-gray-200 text-gray-950 border-gray-300';
    }
  };

  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full space-y-3 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent smooth-scroll"
      data-scroll-area="speech-content"
    >
        {messages.map((message) => (
          <div key={message.id} className="space-y-2 p-3 border rounded-lg">
            {/* 발언자 정보 */}
            <div className="flex items-center gap-2">
              <Badge className={getPositionColor(message.position)}>
                {message.speakerName}님
              </Badge>
              <span className="text-xs text-muted-foreground">
                {(() => {
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const messageDate = new Date(message.timestamp.getFullYear(), message.timestamp.getMonth(), message.timestamp.getDate());
                  
                  const timeString = message.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  });
                  
                  if (messageDate.getTime() !== today.getTime()) {
                    const dateString = message.timestamp.toLocaleDateString('ko-KR', {
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
            
            {/* 발언 내용 */}
            <p className="text-sm leading-relaxed">{message.content}</p>
            
            {/* AI 팩트체크 결과 */}
            {message.factCheck && (
              <div className={`p-2 rounded-lg border ${getFactCheckColor(message.factCheck.result)}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">🤖 AI 팩트체크</span>
                    <Badge variant="outline" size="sm">
                      {message.factCheck.result}
                    </Badge>
                  </div>
                  {message.factCheck.source && (
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      출처 보기
                    </Button>
                  )}
                </div>
                <p className="text-xs">{message.factCheck.explanation}</p>
              </div>
            )}
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            아직 발언이 없습니다.
          </div>
        )}
    </div>
  );
}

// 기존 전체 컴포넌트 (데스크톱용)
export function SpeechContent({ messages }: SpeechContentProps) {
  return (
    <div className="h-full flex flex-col relative">
      <SpeechContentHeader />
      <SpeechContentBody messages={messages} />
      <DebateScrollButtons />
    </div>
  );
}