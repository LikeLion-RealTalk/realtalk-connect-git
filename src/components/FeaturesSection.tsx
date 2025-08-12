import { FeatureCard } from './FeatureCard';
import { Bot, Zap, CheckCircle } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: 'AI 토론 진행자',
      description: '공정하고 체계적인 토론 진행을 위한 AI 모더레이터가 실시간으로 토론을 이끌어갑니다.'
    },
    {
      icon: Zap,
      title: '즉석 참여',
      description: '카테고리별로 관심있는 주제에 바로 참여할 수 있습니다.'
    },
    {
      icon: CheckCircle,
      title: '실시간 팩트체킹',
      description: '토론 중 제시되는 정보의 신뢰성을 실시간으로 검증하여 질 높은 토론이 이루어집니다.'
    }
  ];

  return (
    <section className="py-10 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3">RealTalk만의 특별함</h2>
          <p className="text-muted-foreground">AI 기술로 더 나은 토론 경험을 제공합니다</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}