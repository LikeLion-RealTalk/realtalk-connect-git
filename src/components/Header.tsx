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
      <header className="border-b border-border/20 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 shadow-lg sticky top-0 z-50">
        <div className="container flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[image:var(--gradient-button)] text-white text-lg font-black shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              RT
            </div>
            <span className="text-3xl font-black bg-[image:var(--gradient-button)] bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">RealTalk</span>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-10">
            <span className="text-foreground hover:text-primary cursor-pointer transition-all duration-300 font-semibold text-lg hover:scale-110 relative group">
              토론방 만들기
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[image:var(--gradient-button)] group-hover:w-full transition-all duration-300"></div>
            </span>
            <span className="text-foreground hover:text-primary cursor-pointer transition-all duration-300 font-semibold text-lg hover:scale-110 relative group">
              랭킹
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[image:var(--gradient-button)] group-hover:w-full transition-all duration-300"></div>
            </span>
            <span className="text-foreground hover:text-primary cursor-pointer transition-all duration-300 font-semibold text-lg hover:scale-110 relative group">
              고객센터
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[image:var(--gradient-button)] group-hover:w-full transition-all duration-300"></div>
            </span>
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