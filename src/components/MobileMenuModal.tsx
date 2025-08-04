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
          className="absolute inset-0 bg-black/50" 
          onClick={() => onOpenChange(false)}
        />
        
        {/* Menu Modal - Material Design style */}
        <div className="absolute top-0 right-0 h-full w-64 bg-background shadow-2xl border-l border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">메뉴</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="p-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center px-4 py-3 text-left text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
                onClick={() => {
                  item.onClick();
                  onOpenChange(false);
                }}
              >
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <CreateDebateModal
        open={isCreateDebateOpen}
        onOpenChange={setIsCreateDebateOpen}
      />
    </>
  );
};