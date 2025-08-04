export const Features = () => {
  const features = [
    {
      icon: '🤖',
      title: 'AI 토론 진행자',
      description: '공정하고 체계적인 토론 진행을 위한 AI 모더레이터가 실시간으로 토론을 이끌어갑니다.'
    },
    {
      icon: '⚡',
      title: '즉석 참여',
      description: '카테고리별로 관심있는 주제에 바로 참여할 수 있습니다.'
    },
    {
      icon: '🎯',
      title: '실시간 팩트체킹',
      description: '토론 중 제시되는 정보의 신뢰성을 실시간으로 검증하여 질 높은 토론이 이루어집니다.'
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-white via-hero-bg/30 to-white relative overflow-hidden">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-[image:var(--gradient-mesh)] opacity-50"></div>
      
      <div className="container text-center relative z-10">
        <div className="max-w-4xl mx-auto mb-20 animate-fade-in">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-8 leading-tight">
            RealTalk만의 <br className="md:hidden"/>
            <span className="bg-[image:var(--gradient-button)] bg-clip-text text-transparent relative">
              특별함
              <div className="absolute -inset-1 bg-[image:var(--gradient-button)] opacity-20 blur-xl -z-10"></div>
            </span>
          </h2>
          <p className="text-muted-foreground text-2xl leading-relaxed font-medium">
            AI 기술로 <span className="text-primary font-bold">더 나은 토론 경험</span>을 제공합니다
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group text-center p-10 rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border border-white/50 relative overflow-hidden animate-slide-up"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-[image:var(--gradient-card)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 md:w-28 md:h-28 bg-[image:var(--gradient-button)] rounded-3xl flex items-center justify-center text-4xl md:text-5xl mx-auto mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-foreground mb-6 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg md:text-xl font-medium">
                  {feature.description}
                </p>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -top-1/2 aspect-square w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 group-hover:animate-[slide-in-right_0.6s_ease-out] opacity-0 group-hover:opacity-100"></div>
            </div>
          ))}
        </div>
        
        {/* Bottom decorative element */}
        <div className="mt-20 animate-fade-in" style={{animationDelay: '1s'}}>
          <div className="w-24 h-1 bg-[image:var(--gradient-button)] mx-auto rounded-full shadow-lg"></div>
        </div>
      </div>
    </section>
  );
};