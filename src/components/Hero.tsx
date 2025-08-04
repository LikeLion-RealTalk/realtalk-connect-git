import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="bg-hero-bg py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
          진짜 토론이 시작되는 곳<br />
          <span className="bg-gradient-to-r from-quick-debate to-normal-debate bg-clip-text text-transparent">
            RealTalk
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
          AI 진행자가 이끄는 실시간 토론에 참여하세요. 관심있는 주제에 바로 참여하거나, 새로운 토론을 시작해보세요.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="w-full sm:w-auto bg-gradient-to-r from-quick-debate to-normal-debate hover:opacity-90 transition-all duration-300"
          >
            토론 시작하기
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto"
          >
            둘러보기
          </Button>
        </div>
      </div>
    </section>
  );
};