import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { UserProfileDropdown } from "./UserProfileDropdown";

export const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 상태 관리

  // Mock user data
  const mockUser = {
    name: "홍길동",
    email: "user@example.com",
    avatar: undefined
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border-2 border-muted-foreground bg-background text-xs text-muted-foreground">
              로고
            </div>
            <span className="text-xl font-bold text-foreground">RealTalk</span>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8">
            <span className="text-foreground hover:text-primary cursor-pointer transition-colors">토론방 만들기</span>
            <span className="text-foreground hover:text-primary cursor-pointer transition-colors">랭킹</span>
            <span className="text-foreground hover:text-primary cursor-pointer transition-colors">고객센터</span>
          </nav>

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* User Profile */}
                <UserProfileDropdown user={mockUser} onLogout={handleLogout} />
                {/* Mobile menu button - shown when logged in */}
                <Button variant="outline" size="icon" className="md:hidden">
                  <span className="text-lg">≡</span>
                </Button>
              </>
            ) : (
              <>
                {/* Login button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  로그인
                </Button>
                {/* Mobile menu button */}
                <Button variant="outline" size="icon" className="md:hidden">
                  <span className="text-lg">≡</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <LoginModal 
        open={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};