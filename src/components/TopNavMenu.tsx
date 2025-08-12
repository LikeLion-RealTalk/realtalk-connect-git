import { useState } from 'react';
import { CreateDiscussionModal } from './modal/CreateDiscussionModal';
import { DiscussionData } from '../types/discussion';

interface TopNavMenuProps {
  onNavigate?: (page: 'landing' | 'browser' | 'debate') => void;
  onJoinDebate?: () => void;
  onCreateDebate?: (discussionData?: DiscussionData) => void;
  isMobile?: boolean;
}

export function TopNavMenu({ onNavigate, onJoinDebate, onCreateDebate, isMobile = false }: TopNavMenuProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleMenuClick = (item: string) => {
    if (item === '토론방 만들기') {
      setIsCreateModalOpen(true);
    } else if (item === '랭킹') {
      // TODO: 랭킹 페이지 구현 예정
      console.log('랭킹 기능 준비중입니다.');
    } else if (item === '고객센터') {
      // TODO: 고객센터 페이지 구현 예정
      console.log('고객센터 기능 준비중입니다.');
    }
  };

  const handleCreateConfirm = (data: DiscussionData) => {
    console.log('TopNav에서 토론방 생성:', data);
    onCreateDebate?.(data);
  };



  const menuItems: Array<{ name: string; action: () => void; disabled?: boolean }> = [
    { name: '토론방 만들기', action: () => handleMenuClick('토론방 만들기') },
    { name: '랭킹', action: () => handleMenuClick('랭킹'), disabled: true },
    { name: '고객센터', action: () => handleMenuClick('고객센터'), disabled: true }
  ];

  return (
    <>
      {isMobile ? (
        /* 모바일 사이드바 메뉴 */
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.disabled ? undefined : item.action}
              disabled={item.disabled}
              className={`w-full text-left transition-material rounded-lg px-4 py-3 text-sm font-medium ${
                item.disabled 
                  ? 'text-muted-foreground cursor-not-allowed' 
                  : 'text-on-surface hover:text-primary hover:bg-primary/10'
              }`}
            >
              {item.name}
              {item.disabled && <span className="text-xs ml-2">(준비중)</span>}
            </button>
          ))}
        </nav>
      ) : (
        /* 데스크톱 메뉴 */
        <nav className="flex items-center space-x-8">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.disabled ? undefined : item.action}
              disabled={item.disabled}
              className={`transition-all duration-200 rounded-md px-3 py-2 ${
                item.disabled
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'text-foreground hover:text-primary hover:scale-105 hover:bg-accent/50'
              }`}
            >
              {item.name}
              {item.disabled && <span className="text-xs ml-2">(준비중)</span>}
            </button>
          ))}
        </nav>
      )}

      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateConfirm}
      />
    </>
  );
}