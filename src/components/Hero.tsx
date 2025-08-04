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
      <section className="bg-[image:var(--gradient-hero)] py-20 md:py-32 relative overflow-hidden">
        {/* Dynamic background effects */}
        <div className="absolute inset-0 bg-[image:var(--gradient-mesh)]"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="container text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-8 leading-tight tracking-tight">
                진짜 토론이 시작되는 곳<br />
                <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent drop-shadow-2xl animate-glow">
                  RealTalk
                </span>
              </h1>
            </div>
            
            <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/95 mb-12 md:mb-16 max-w-4xl mx-auto leading-relaxed font-medium backdrop-blur-sm">
                AI 진행자가 이끄는 실시간 토론에 참여하세요.<br className="hidden md:block" />
                <span className="text-white/80">관심있는 주제에 바로 참여하거나, 새로운 토론을 시작해보세요.</span>
              </p>
            </div>
            
            <div className="animate-scale-in" style={{animationDelay: '0.6s'}}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  variant="premium"
                  size="lg" 
                  className="w-full sm:w-auto px-12 py-6 text-xl font-bold h-16 shadow-2xl hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transform hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group"
                  onClick={() => setIsDebateMatchingOpen(true)}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    🚀 토론 시작하기
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto px-12 py-6 text-xl font-bold h-16 bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 backdrop-blur-md shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 hover:border-white/50"
                  onClick={() => navigate('/browse')}
                >
                  ✨ 둘러보기
                </Button>
              </div>
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