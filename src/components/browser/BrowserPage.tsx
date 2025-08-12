import { useState, useEffect } from 'react';
import { SearchFilter } from './SearchFilter';
import { DiscussionsList } from './DiscussionsList';
import { DiscussionPagination } from './DiscussionPagination';
import { JoinDiscussionModal } from '../modal/JoinDiscussionModal';
import { CreateDiscussionModal } from '../modal/CreateDiscussionModal';
import { AiDebateSummaryModal } from '../modal/AiDebateSummaryModal';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Discussion, DiscussionData, FilterOptions, DebateSummary } from '../../types/discussion';
import { MOCK_BROWSER_DISCUSSIONS } from '../../mock/browserDiscussions';
import { getDebateSummaryByDiscussionId } from '../../mock/debateSummaries';



interface BrowserPageProps {
  onNavigate?: (page: 'landing' | 'browser' | 'debate') => void;
  onJoinDebate?: () => void;
}

export function BrowserPage({ onNavigate, onJoinDebate }: BrowserPageProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState<Discussion[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    discussionTypes: [],
    statuses: []
  });
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<DebateSummary | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const discussionsPerPage = 6;

  useEffect(() => {
    setDiscussions(MOCK_BROWSER_DISCUSSIONS);
    setFilteredDiscussions(MOCK_BROWSER_DISCUSSIONS);
  }, []);

  useEffect(() => {
    let filtered = discussions;

    // 검색어 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(discussion =>
        discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 카테고리 필터링
    if (filters.categories.length > 0) {
      filtered = filtered.filter(discussion =>
        filters.categories.includes(discussion.category)
      );
    }

    // 토론방식 필터링
    if (filters.discussionTypes.length > 0) {
      filtered = filtered.filter(discussion =>
        filters.discussionTypes.includes(discussion.type)
      );
    }

    // 진행상태 필터링
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(discussion =>
        filters.statuses.includes(discussion.status)
      );
    }

    setFilteredDiscussions(filtered);
    setCurrentPage(1);
  }, [searchQuery, filters, discussions]);

  const totalPages = Math.ceil(filteredDiscussions.length / discussionsPerPage);
  const startIndex = (currentPage - 1) * discussionsPerPage;
  const currentDiscussions = filteredDiscussions.slice(startIndex, startIndex + discussionsPerPage);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateDiscussion = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateConfirm = (data: DiscussionData) => {
    console.log('토론방 생성:', data);
    
    // 새로운 토론방 생성 (실제로는 서버에 전송)
    const newDiscussion: Discussion = {
      id: `discussion-${Date.now()}`,
      type: data.debateType,
      status: '대기중',
      title: data.title,
      category: data.category,
      timeStatus: '곧 시작',
      speakers: { current: 0, max: data.maxSpeakers },
      audience: { current: 0, max: data.maxAudience }
    };

    // 토론방 목록에 추가
    setDiscussions(prev => [newDiscussion, ...prev]);
    
    // 생성된 토론방으로 바로 이동 (실제로는 토론방 페이지로)
    onNavigate?.('debate');
  };

  const handleJoinDiscussion = (discussionId: string) => {
    const discussion = discussions.find(d => d.id === discussionId);
    if (discussion) {
      setSelectedDiscussion(discussion);
      setIsJoinModalOpen(true);
    }
  };

  const handleJoinConfirm = (discussionId: string, nickname: string, role: 'speaker' | 'audience') => {
    console.log('토론방 입장:', { discussionId, nickname, role });
    // 실제로는 사용자 정보를 저장하고 토론방으로 이동
    onJoinDebate?.();
  };

  const handleViewSummary = (discussionId: string) => {
    const summary = getDebateSummaryByDiscussionId(discussionId);
    if (summary) {
      setSelectedSummary(summary);
      setIsSummaryModalOpen(true);
    } else {
      console.log('해당 토론방의 요약을 찾을 수 없습니다:', discussionId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="mb-3">토론방 둘러보기</h1>
          <p className="text-muted-foreground">
            다양한 주제의 토론방을 찾아보고 관심 있는 토론에 참여해보세요.
          </p>
        </div>

        <div className="space-y-4">
          <SearchFilter 
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              총 {filteredDiscussions.length}개의 토론방
            </p>
            <Button 
              onClick={handleCreateDiscussion}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              토론방 만들기
            </Button>
          </div>

          <DiscussionsList 
            discussions={currentDiscussions} 
            onJoinDiscussion={handleJoinDiscussion}
            onViewSummary={handleViewSummary}
          />

          <DiscussionPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <JoinDiscussionModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        discussion={selectedDiscussion}
        onJoin={handleJoinConfirm}
      />

      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateConfirm}
      />

      <AiDebateSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onRequestExit={() => setIsSummaryModalOpen(false)}
        summary={selectedSummary}
      />
    </div>
  );
}