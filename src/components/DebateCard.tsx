import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Debate } from "@/types/debate";
import { JoinDebateModal } from "./JoinDebateModal";
import { DebateSummaryModal } from "./DebateSummaryModal";

interface DebateCardProps {
  debate: Debate;
}

export const DebateCard = ({ debate }: DebateCardProps) => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const isActive = debate.status === 'active';
  
  
  return (
    <>
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-3">
              <Badge 
                variant="secondary" 
                className={`text-xs font-semibold ${
                  debate.type === 'quick' 
                    ? 'bg-quick-debate text-white' 
                    : 'bg-normal-debate text-white'
                }`}
              >
                {debate.type === 'quick' ? '3분토론' : '일반토론'}
              </Badge>
              
              {isActive ? (
                <Badge className="bg-debate-active text-white">진행중</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">대기중</span>
              )}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-card-foreground leading-tight mb-3">
            {debate.title}
          </h3>
          
          <div className="text-sm text-muted-foreground font-medium">
            {debate.icon} {debate.category} · {
              isActive ? `${debate.duration}분 진행중` : '대기중'
            }
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex gap-3 mb-6 flex-wrap">
            <Badge variant="outline" className="text-xs">
              발언자 {debate.participants.current}/{debate.participants.max}명
            </Badge>
            <Badge variant="outline" className="text-xs">
              청중 {debate.audience.current}/{debate.audience.max}명
            </Badge>
          </div>
          
          <Button 
            className="w-full transition-all duration-300 mb-2"
            variant="default"
            onClick={() => setIsJoinModalOpen(true)}
          >
            토론 참여하기
          </Button>
          
          {debate.status === 'ended' && (
            <Button 
              variant="outline"
              className="w-full transition-all duration-300"
              onClick={() => setIsSummaryModalOpen(true)}
            >
              토론방 요약
            </Button>
          )}
        </CardContent>
      </Card>

      <JoinDebateModal
        open={isJoinModalOpen}
        onOpenChange={setIsJoinModalOpen}
        debate={debate}
      />

      <DebateSummaryModal
        open={isSummaryModalOpen}
        onOpenChange={setIsSummaryModalOpen}
        debate={debate}
      />
    </>
  );
};