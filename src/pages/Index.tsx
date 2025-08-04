import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrendingDebates } from "@/components/TrendingDebates";
import { Features } from "@/components/Features";
import { FloatingProfileButton } from "@/components/FloatingProfileButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <TrendingDebates />
      <Features />
      <FloatingProfileButton />
    </div>
  );
};

export default Index;
