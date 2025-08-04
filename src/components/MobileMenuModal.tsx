import { useState } from "react";
import { X } from "lucide-react";
import { CreateDebateModal } from "./CreateDebateModal";
import { LoginModal } from "./LoginModal";
import { useToast } from "@/hooks/use-toast";

interface MobileMenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoggedIn?: boolean;
  onLoginRequired?: () => void;
}

export const MobileMenuModal = ({ open, onOpenChange, isLoggedIn = false, onLoginRequired }: MobileMenuModalProps) => {
  const [isCreateDebateOpen, setIsCreateDebateOpen] = useState(false);
  const { toast } = useToast();
  
  if (!open) return null;

  const handleCreateDebate = () => {
    if (isLoggedIn) {
      setIsCreateDebateOpen(true);
      onOpenChange(false);
    } else {
      onLoginRequired?.();
      onOpenChange(false);
    }
  };

  const menuItems = [
    { 
      label: "토론방 만들기", 
      onClick: handleCreateDebate
    },
    { label: "랭킹", onClick: () => console.log("랭킹") },
    { label: "고객센터", onClick: () => console.log("고객센터") }
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 md:hidden">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/30" 
          onClick={() => onOpenChange(false)}
        />
        
        {/* Menu Modal */}
        <div className="absolute top-[60px] left-1/2 transform -translate-x-1/2 w-[150px] bg-background border-2 border-border rounded-lg shadow-lg">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`
                px-5 py-4 text-sm text-foreground font-medium cursor-pointer
                hover:bg-muted transition-colors
                ${index !== menuItems.length - 1 ? 'border-b border-muted' : ''}
              `}
              onClick={() => {
                item.onClick();
                onOpenChange(false);
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <CreateDebateModal
        open={isCreateDebateOpen}
        onOpenChange={setIsCreateDebateOpen}
      />
    </>
  );
};