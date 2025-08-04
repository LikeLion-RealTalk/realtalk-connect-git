import { useState } from "react";
import { Search, Filter, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JoinDebateModal } from "@/components/JoinDebateModal";
import { CreateDebateModal } from "@/components/CreateDebateModal";
import { extendedMockDebates } from "@/data/extendedMockDebates";
import { Debate } from "@/types/debate";

const BrowseDebates = () => {
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">진행중</Badge>;
      case 'waiting':
        return <Badge className="bg-orange-500 text-white">대기중</Badge>;
      case 'ended':
        return <Badge className="bg-gray-500 text-white">종료됨</Badge>;
      default:
        return null;
    }
  };

  const getStatusText = (debate: Debate) => {
    if (debate.status === 'active') return `${debate.duration}분 진행중`;
    if (debate.status === 'waiting') return '대기중';
    if (debate.status === 'ended') return `${debate.duration}분 진행됨`;
    return '';
  };

  const handleJoinDebate = (debate: Debate) => {
    if (debate.status === 'ended') return;
    setSelectedDebate(debate);
    setIsJoinModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background p-4 sm:p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border-2 border-muted-foreground bg-background text-xs text-muted-foreground">
                로고
              </div>
              <span className="text-xl sm:text-2xl font-bold text-foreground">RealTalk</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 ml-11 hidden sm:block">
              실시간 토론에 참여하세요
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-muted-foreground text-white hover:bg-muted-foreground/90 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            토론방 만들기
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-hero-bg p-4 sm:p-6">
        <div className="container mx-auto">
          {/* Search and Filter */}
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div className="text-muted-foreground text-sm sm:text-base">
              토론방이나 주제를 검색하세요...
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <span>🔽</span>
              <span>필터</span>
            </Button>
          </div>

          {/* Debates Grid/List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {extendedMockDebates.map((debate) => (
              <Card key={debate.id} className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3 flex-1">
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
                      <h3 className="text-base sm:text-lg font-bold text-card-foreground leading-tight flex-1">
                        {debate.title}
                      </h3>
                    </div>
                    {getStatusBadge(debate.status)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground font-medium mb-3">
                    {debate.icon} {debate.category} · {getStatusText(debate)}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {debate.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex gap-2 sm:gap-3 mb-4 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      발언자 {debate.participants.current}/{debate.participants.max}명
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      청중 {debate.audience.current}/{debate.audience.max}명
                    </Badge>
                  </div>
                  
                  <Button 
                    className={`w-full transition-all duration-300 mb-3 ${
                      debate.status === 'ended' 
                        ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                    onClick={() => handleJoinDebate(debate)}
                    disabled={debate.status === 'ended'}
                  >
                    토론 참여하기
                  </Button>

                  <div className="text-xs text-muted-foreground text-right">
                    {debate.date}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Profile Button */}
      <Button
        className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-quick-debate text-white shadow-lg hover:bg-quick-debate/90 p-0"
        size="icon"
      >
        <User className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>

      {/* Modals */}
      <JoinDebateModal
        open={isJoinModalOpen}
        onOpenChange={setIsJoinModalOpen}
        debate={selectedDebate}
      />

      <CreateDebateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
};

export default BrowseDebates;