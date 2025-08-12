import { useState } from 'react';
import { Button } from './ui/button';
import { User, LogOut, UserCircle, Settings, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { TopNavMenu } from './TopNavMenu';
import { LoginModal } from './modal/LoginModal';
import { useUser } from './UserProvider';
import { MaterialAppBar } from './MaterialDesign';

interface TopNavProps {
  onNavigate?: (page: 'landing' | 'browser' | 'debate') => void;
  onJoinDebate?: () => void;
  onCreateDebate?: () => void;
}

export function TopNav({ onNavigate, onJoinDebate, onCreateDebate }: TopNavProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, isLoggedIn, logout, openProfile, openSettings } = useUser();

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <MaterialAppBar color="surface" className="sticky top-0 z-50 w-full px-4 py-2">
        {/* 좌측 로고 */}
        <div className="flex items-center">
          <button 
            onClick={() => onNavigate?.('landing')}
            className="flex items-center gap-3 hover:opacity-80 transition-material"
          >
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-medium text-sm">R</span>
            </div>
            <span className="text-xl font-medium text-on-surface">RealTalk</span>
          </button>
        </div>

        {/* 중앙 메뉴 - 데스크톱에서만 표시 */}
        <div className="flex-1 hidden md:flex justify-center">
          <TopNavMenu 
            onNavigate={onNavigate}
            onJoinDebate={onJoinDebate}
            onCreateDebate={onCreateDebate}
          />
        </div>
        
        {/* 모바일에서는 flex-1 여백만 추가 */}
        <div className="flex-1 md:hidden"></div>

        {/* 우측 사용자 영역 */}
        <div className="flex items-center gap-2">
          {/* 모바일 햄버거 메뉴 버튼 */}
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden hover:bg-primary/10 transition-material"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 bg-surface">
              {/* 접근성을 위한 제목과 설명 */}
              <SheetTitle className="sr-only">RealTalk 메뉴</SheetTitle>
              <SheetDescription className="sr-only">
                RealTalk 플랫폼의 주요 메뉴와 사용자 설정에 접근할 수 있습니다.
              </SheetDescription>
              
              <div className="flex flex-col h-full">
                {/* 사이드바 헤더 */}
                <div className="p-6 border-b border-divider bg-surface">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-medium text-sm">R</span>
                    </div>
                    <h2 className="text-lg font-medium text-on-surface">RealTalk</h2>
                  </div>
                </div>
                
                {/* 사이드바 메뉴 콘텐츠 */}
                <div className="flex-1 p-6 bg-surface">
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">메뉴</h3>
                    <TopNavMenu 
                      onNavigate={(page) => {
                        setIsMobileSidebarOpen(false);
                        onNavigate?.(page);
                      }}
                      onJoinDebate={() => {
                        setIsMobileSidebarOpen(false);
                        onJoinDebate?.();
                      }}
                      onCreateDebate={() => {
                        setIsMobileSidebarOpen(false);
                        onCreateDebate?.();
                      }}
                      isMobile={true}
                    />
                  </div>
                </div>

                {/* 사이드바 하단 사용자 정보 */}
                <div className="p-6 border-t border-divider bg-surface">
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          {user?.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-on-surface truncate">{user?.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-3 hover:bg-primary/10 transition-material text-sm h-10"
                          onClick={() => {
                            setIsMobileSidebarOpen(false);
                            openProfile();
                          }}
                        >
                          <UserCircle className="h-4 w-4" />
                          프로필
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-3 hover:bg-primary/10 transition-material text-sm h-10"
                          onClick={() => {
                            setIsMobileSidebarOpen(false);
                            openSettings();
                          }}
                        >
                          <Settings className="h-4 w-4" />
                          설정
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-3 hover:bg-error/10 text-error transition-material text-sm h-10"
                          onClick={() => {
                            setIsMobileSidebarOpen(false);
                            handleLogout();
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          로그아웃
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full justify-center gap-2 hover:bg-primary/10 transition-material"
                      onClick={() => {
                        setIsMobileSidebarOpen(false);
                        handleLoginClick();
                      }}
                    >
                      <User className="h-4 w-4" />
                      로그인
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* 데스크톱 로그인/사용자 영역 */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={openProfile}
                  className="flex items-center gap-2 hover:bg-primary/10 transition-material"
                >
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                    {user?.name[0]}
                  </div>
                  <span className="text-sm">{user?.name}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={openSettings}
                  className="hover:bg-primary/10 transition-material"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hover:bg-error/10 text-error transition-material"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLoginClick}
                className="flex items-center gap-2 hover:bg-primary/10 transition-material"
              >
                <User className="h-4 w-4" />
                로그인
              </Button>
            )}
          </div>
        </div>
      </MaterialAppBar>
      
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}