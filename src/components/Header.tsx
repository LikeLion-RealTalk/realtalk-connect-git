import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { MobileMenuModal } from "./MobileMenuModal";

export const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <header className="border-b border-border/50 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm">
        <div className="container flex h-18 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-button)] text-white text-sm font-bold shadow-lg">
              RT
            </div>
            <span className="text-2xl font-bold bg-[image:var(--gradient-button)] bg-clip-text text-transparent">RealTalk</span>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8">
            <span className="text-foreground hover:text-primary cursor-pointer transition-all duration-200 font-medium hover:scale-105">토론방 만들기</span>
            <span className="text-foreground hover:text-primary cursor-pointer transition-all duration-200 font-medium hover:scale-105">랭킹</span>
            <span className="text-foreground hover:text-primary cursor-pointer transition-all duration-200 font-medium hover:scale-105">고객센터</span>
          </nav>

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* User Profile */}
                <UserProfileDropdown user={mockUser} onLogout={handleLogout} />
                {/* Mobile menu button - shown when logged in */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
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
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
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
      
      <MobileMenuModal
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
};