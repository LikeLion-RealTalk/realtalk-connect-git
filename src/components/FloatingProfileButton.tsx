import { useState } from "react";
import { User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { useIsMobile } from "@/hooks/use-mobile";

export const FloatingProfileButton = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isMobile = useIsMobile();

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

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <>
      {isLoggedIn ? (
        <div className="fixed bottom-4 left-4 z-50">
          <UserProfileDropdown user={mockUser} onLogout={handleLogout} />
        </div>
      ) : (
        <Button
          className="fixed bottom-4 left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 p-0 z-50"
          size="icon"
          onClick={() => setIsLoginModalOpen(true)}
        >
          <LogIn className="w-6 h-6" />
        </Button>
      )}

      <LoginModal 
        open={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};