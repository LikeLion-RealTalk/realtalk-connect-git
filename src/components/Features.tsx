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
    <section className="py-16 md:py-20 bg-hero-bg">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          RealTalk만의 특별함
        </h2>
        <p className="text-muted-foreground text-lg mb-12 md:mb-16">
          AI 기술로 더 나은 토론 경험을 제공합니다
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-xl flex items-center justify-center text-2xl md:text-3xl mx-auto mb-4 md:mb-6 transition-transform duration-300 hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};