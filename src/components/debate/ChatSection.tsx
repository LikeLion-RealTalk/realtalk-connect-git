import { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Send, MessageCircle } from 'lucide-react';
import { Position, POSITIONS } from '../../types/discussion';

interface ChatMessage {
  id: string;
  userName: string;
  message: string;
  timestamp: Date;
  userPosition?: Position;
  isSpeaker?: boolean;
}

interface ChatSectionProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

// 헤더 컴포넌트 분리
export function ChatSectionHeader() {
  return (
    <div className="p-4 border-b border-divider flex items-center justify-between bg-surface elevation-1">
      <h4 className="flex items-center gap-2 text-on-surface font-medium">
        <MessageCircle className="h-5 w-5 text-primary" />
        채팅
      </h4>
    </div>
  );
}

// 콘텐츠 컴포넌트 분리
export function ChatSectionBody({ messages, onSendMessage }: ChatSectionProps) {
  const [inputMessage, setInputMessage] = useState('');
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

  // 새로운 채팅 메시지가 추가될 때마다 자동으로 하단으로 스크롤 (사용자가 수동 스크롤 중이 아닐 때만)
  useEffect(() => {
    if (scrollRef.current && !isUserScrollingRef.current) {
      const element = scrollRef.current;
      
      // DOM 업데이트 완료 후 스크롤 실행
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
          });
        });
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

  const handleSend = () => {
    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setInputMessage('');
    }
  };


  const getPositionBadgeStyle = (position?: Position, isSpeaker?: boolean) => {
    if (!position) return 'bg-gray-200 text-gray-950';
    
    if (isSpeaker) {
      return position === POSITIONS[0] 
        ? 'bg-green-400 text-white'  // A입장 (POSITIONS[0]) - 녹색 진한색
        : 'bg-red-400 text-white';   // B입장 (POSITIONS[1]) - 빨간색 진한색
    }
    
    return position === POSITIONS[0] 
      ? 'bg-green-200 text-green-950'  // A입장 (POSITIONS[0]) - 녹색 연한색
      : 'bg-red-200 text-red-950';     // B입장 (POSITIONS[1]) - 빨간색 연한색
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
        {/* 채팅 메시지 목록 */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent smooth-scroll"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getPositionBadgeStyle(message.userPosition, message.isSpeaker)}`}
                >
                  {message.userName}
                  {message.isSpeaker && <span className="ml-1">🎤</span>}
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
              <p className="text-sm bg-muted p-3 rounded-lg ml-1">
                {message.message}
              </p>
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              아직 채팅이 없습니다.
            </div>
          )}
        </div>
        
        {/* 채팅 입력 */}
        <div className="p-4 border-t border-divider flex-shrink-0 bg-surface elevation-1">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              placeholder="메시지를 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-input-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              autoComplete="off"
            />
            <Button 
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-3 py-2 min-w-[44px] hover:scale-105 transition-transform"
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
  );
}

// 기존 전체 컴포넌트 (데스크톱용)
export function ChatSection({ messages, onSendMessage }: ChatSectionProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ChatSectionHeader />
      <div className="flex-1 min-h-0">
        <ChatSectionBody messages={messages} onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}