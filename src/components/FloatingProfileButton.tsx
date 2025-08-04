import { useState } from "react";
import { User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-12 w-12 rounded-full p-0 shadow-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: 'hsl(var(--join-button))', color: 'white' }}
              >
                <User className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-56 p-0 ml-2 mb-2" 
              side="top" 
              align="start"
              sideOffset={8}
            >
              <div className="p-0">
                <UserProfileDropdown 
                  user={mockUser} 
                  onLogout={handleLogout}
                  isMobilePopover={true}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <Button
          className="fixed bottom-4 left-4 w-12 h-12 rounded-full shadow-lg hover:opacity-90 p-0 z-50"
          style={{ backgroundColor: 'hsl(var(--floating-login))', color: 'white' }}
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