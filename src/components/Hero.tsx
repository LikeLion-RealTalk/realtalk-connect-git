import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { DebateMatchingModal } from "./DebateMatchingModal";

export const Hero = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDebateMatchingOpen, setIsDebateMatchingOpen] = useState(false);

  return (
    <>
      <section className="bg-[image:var(--gradient-hero)] py-20 md:py-28 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 md:mb-8 leading-tight tracking-tight">
              진짜 토론이 시작되는 곳<br />
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent drop-shadow-lg">
                RealTalk
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              AI 진행자가 이끄는 실시간 토론에 참여하세요.<br className="hidden md:block" />
              관심있는 주제에 바로 참여하거나, 새로운 토론을 시작해보세요.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="premium"
                size="lg" 
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold h-14 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                onClick={() => setIsDebateMatchingOpen(true)}
              >
                🚀 토론 시작하기
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold h-14 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => navigate('/browse')}
              >
                둘러보기
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LoginModal 
        open={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen}
        onLoginSuccess={onLoginSuccess}
      />
      
      <DebateMatchingModal
        open={isDebateMatchingOpen}
        onOpenChange={setIsDebateMatchingOpen}
      />
    </>
  );
};