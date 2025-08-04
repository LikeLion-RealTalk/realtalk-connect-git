import { DebateCard } from "./DebateCard";
import { mockDebates } from "@/data/mockDebates";

export const TrendingDebates = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-2xl md:text-3xl mr-3">🔥</span>
            지금 인기 토론
          </h2>
          <p className="text-muted-foreground text-lg">
            실시간으로 진행되고 있는 토론에 바로 참여해보세요
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {mockDebates.map((debate) => (
            <DebateCard key={debate.id} debate={debate} />
          ))}
        </div>
      </div>
    </section>
  );
};