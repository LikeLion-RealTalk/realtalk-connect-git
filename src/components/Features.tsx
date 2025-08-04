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
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-hero-bg relative">
      <div className="container text-center">
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            RealTalk만의 <span className="bg-[image:var(--gradient-button)] bg-clip-text text-transparent">특별함</span>
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            AI 기술로 더 나은 토론 경험을 제공합니다
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="group text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border/50">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-[image:var(--gradient-card)] rounded-2xl flex items-center justify-center text-3xl md:text-4xl mx-auto mb-6 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};