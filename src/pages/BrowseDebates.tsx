import { useState } from "react";
import { Search, Filter, Plus, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JoinDebateModal } from "@/components/JoinDebateModal";
import { CreateDebateModal } from "@/components/CreateDebateModal";
import { DebateSummaryModal } from "@/components/DebateSummaryModal";
import { extendedMockDebates } from "@/data/extendedMockDebates";
import { debateCategories } from "@/data/categories";
import { Debate } from "@/types/debate";

const BrowseDebates = () => {
  const navigate = useNavigate();
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDebates, setFilteredDebates] = useState(extendedMockDebates);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    status: ""
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-debate-active text-white hover:bg-debate-active">진행중</Badge>;
      case 'waiting':
        return <Badge className="bg-debate-waiting text-white hover:bg-debate-waiting">대기중</Badge>;
      case 'ended':
        return <Badge className="text-debate-ended-text hover:bg-debate-ended" style={{ backgroundColor: 'hsl(var(--debate-ended))' }}>종료됨</Badge>;
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

  const handleShowSummary = (debate: Debate) => {
    setSelectedDebate(debate);
    setIsSummaryModalOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, filters);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    applyFilters(searchQuery, newFilters);
  };

  const applyFilters = (query: string, currentFilters: typeof filters) => {
    let filtered = extendedMockDebates;

    // 검색어 필터링
    if (query) {
      filtered = filtered.filter(debate => 
        debate.title.toLowerCase().includes(query.toLowerCase()) ||
        (debate.description && debate.description.toLowerCase().includes(query.toLowerCase())) ||
        debate.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    // 카테고리 필터링
    if (currentFilters.category) {
      filtered = filtered.filter(debate => debate.category === currentFilters.category);
    }

    // 토론 방식 필터링
    if (currentFilters.type) {
      filtered = filtered.filter(debate => debate.type === currentFilters.type);
    }

    // 진행 상태 필터링
    if (currentFilters.status) {
      filtered = filtered.filter(debate => debate.status === currentFilters.status);
    }

    setFilteredDebates(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background p-4 sm:p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex flex-col cursor-pointer" onClick={() => navigate("/")}>
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="토론방이나 주제를 검색하세요..."
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline"
              size="sm" 
              className={`flex items-center gap-2 w-fit ${
                showFilters 
                  ? 'text-white border-join-button' 
                  : 'text-foreground border-border bg-background hover:bg-accent'
              }`}
              style={showFilters ? { backgroundColor: 'hsl(var(--join-button))' } : {}}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              <span>필터</span>
            </Button>
          </div>

          {/* Filter Fields */}
          {showFilters && (
            <div className="bg-card border border-filter-border rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-foreground">필터:</span>
                
                {/* 카테고리 필터 */}
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-3 py-1.5 text-sm border border-filter-border rounded-md bg-background text-foreground min-w-[120px] focus:outline-none focus:ring-2 focus:ring-join-button/20 focus:border-join-button"
                >
                  <option value="">카테고리</option>
                  {debateCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* 토론 방식 필터 */}
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-3 py-1.5 text-sm border border-filter-border rounded-md bg-background text-foreground min-w-[120px] focus:outline-none focus:ring-2 focus:ring-join-button/20 focus:border-join-button"
                >
                  <option value="">토론방식</option>
                  <option value="normal">일반토론</option>
                  <option value="quick">3분토론</option>
                </select>

                {/* 진행 상태 필터 */}
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-1.5 text-sm border border-filter-border rounded-md bg-background text-foreground min-w-[120px] focus:outline-none focus:ring-2 focus:ring-join-button/20 focus:border-join-button"
                >
                  <option value="">진행상태</option>
                  <option value="active">진행중</option>
                  <option value="waiting">대기중</option>
                  <option value="ended">종료됨</option>
                </select>

                {/* 필터 초기화 버튼 */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFilters({ category: "", type: "", status: "" });
                    setFilteredDebates(extendedMockDebates);
                  }}
                  className="text-muted-foreground hover:text-foreground ml-auto"
                >
                  초기화
                </Button>
              </div>
            </div>
          )}

          {/* Debates Grid/List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredDebates.map((debate) => (
              <Card key={debate.id} className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs font-semibold hover:bg-current ${
                          debate.type === 'quick' 
                            ? 'bg-quick-debate text-white hover:bg-quick-debate' 
                            : 'bg-normal-debate text-white hover:bg-normal-debate'
                        }`}
                      >
                        {debate.type === 'quick' ? '3분토론' : '일반토론'}
                      </Badge>
                      {getStatusBadge(debate.status)}
                    </div>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-bold text-card-foreground leading-tight mb-3">
                    {debate.title}
                  </h3>
                  
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
                    className="w-full transition-all duration-300 mb-2 text-white"
                    style={{ backgroundColor: debate.status === 'ended' ? 'hsl(var(--summary-button))' : 'hsl(var(--join-button))' }}
                    onClick={() => handleJoinDebate(debate)}
                    disabled={debate.status === 'ended'}
                  >
                    토론 참여하기
                  </Button>
                  
                  {debate.status === 'ended' && (
                    <Button 
                      className="w-full transition-all duration-300 mb-3 text-white"
                      style={{ backgroundColor: 'hsl(var(--summary-button))' }}
                      onClick={() => handleShowSummary(debate)}
                    >
                      토론방 요약
                    </Button>
                  )}

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
        className="fixed bottom-4 left-4 w-12 h-12 rounded-full shadow-lg hover:opacity-90 p-0"
        style={{ backgroundColor: 'hsl(var(--floating-login))', color: 'white' }}
        size="icon"
      >
        <User className="w-6 h-6" />
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

      <DebateSummaryModal
        open={isSummaryModalOpen}
        onOpenChange={setIsSummaryModalOpen}
        debate={selectedDebate}
      />
    </div>
  );
};

export default BrowseDebates;