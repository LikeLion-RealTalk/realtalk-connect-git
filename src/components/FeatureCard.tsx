import { Card, CardContent } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-center hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-center mb-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}