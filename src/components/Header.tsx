import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { MobileMenuModal } from "./MobileMenuModal";
import { CreateDebateModal } from "./CreateDebateModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateDebateOpen, setIsCreateDebateOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 상태 관리
  const isMobile = useIsMobile();
  const { toast } = useToast();

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

  const handleCreateDebate = () => {
    if (isLoggedIn) {
      setIsCreateDebateOpen(true);
    } else {
      setIsLoginModalOpen(true);
      toast({
        description: "로그인이 필요합니다.",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo with Image */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/4a693203-7a3a-43f4-983c-b37e65f765bf.png" 
              alt="RealTalk Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-foreground">RealTalk</span>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8">
            <span 
              className="text-foreground hover:text-primary cursor-pointer transition-colors"
              onClick={handleCreateDebate}
            >
              토론방 만들기
            </span>
            <span className="text-foreground hover:text-primary cursor-pointer transition-colors">랭킹</span>
            <span className="text-foreground hover:text-primary cursor-pointer transition-colors">고객센터</span>
          </nav>

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* User Profile - hidden on mobile */}
                {!isMobile && <UserProfileDropdown user={mockUser} onLogout={handleLogout} />}
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
            ) : (
              <>
                {/* Login button - hidden on mobile */}
                {!isMobile && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    로그인
                  </Button>
                )}
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
        isLoggedIn={isLoggedIn}
        onLoginRequired={handleCreateDebate}
      />
      
      <CreateDebateModal
        open={isCreateDebateOpen}
        onOpenChange={setIsCreateDebateOpen}
      />
    </>
  );
};
