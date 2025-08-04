import { useState } from "react";
import { X } from "lucide-react";

interface MobileMenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileMenuModal = ({ open, onOpenChange }: MobileMenuModalProps) => {
  if (!open) return null;

  const menuItems = [
    { label: "토론방 만들기", onClick: () => console.log("토론방 만들기") },
    { label: "랭킹", onClick: () => console.log("랭킹") },
    { label: "고객센터", onClick: () => console.log("고객센터") }
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/30" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Menu Modal */}
      <div className="absolute top-[60px] right-4 w-[150px] bg-background border-2 border-border rounded-lg shadow-lg">
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
  );
};