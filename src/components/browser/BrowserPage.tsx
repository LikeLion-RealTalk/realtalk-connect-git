import { useState, useEffect, useRef } from 'react';
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
import { debateApi } from '../../lib/api/apiClient';
import { toast } from "sonner";



interface BrowserPageProps {
  onNavigate?: (page: 'landing' | 'browser' | 'debate', debateRoomInfoOrId?: any) => void;
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
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const discussionsPerPage = 6;

  // 카테고리 매핑 함수 (공통 함수로 추출)
  const getCategoryName = (categoryId: number) => {
    const categoryMap: { [key: number]: string } = {
      1: '💕연애',
      2: '👥친구 & 인간관계',
      3: '🏠일상 & 라이프스타일',
      4: '💼취업 & 진로',
      5: '🔥밈 & 유행',
      6: '📱SNS & 온라인 문화',
      7: '🤖AI & 미래사회',
      8: '🎮게임 & e스포츠',
      9: '🎭K-콘텐츠',
      10: '⚖️논란 & 사회 이슈',
      11: '💰돈 & 소비문화',
      12: '💬자유 주제'
    };
    return categoryMap[categoryId] || '💬자유 주제';
  };

  // API 응답을 Discussion 인터페이스에 맞게 변환하는 함수
  const convertApiDataToDiscussions = (apiData: any[]): Discussion[] => {
    const convertedDiscussions: Discussion[] = apiData.map((room: any) => ({
      id: room.roomId,
      type: room.debateType === 'FAST' ? '3분토론' : '일반토론',
      status: room.status === 'waiting' ? '대기중' : room.status === 'started' ? '진행중' : '종료됨',
      title: room.title,
      category: room.category?.id ? getCategoryName(room.category.id) : '💬자유 주제',
      timeStatus: room.elapsedSeconds ? `${Math.floor(room.elapsedSeconds / 60)}분 째 진행중` : '곧 시작',
      speakers: { 
        current: room.currentSpeaker || 0, 
        max: room.maxSpeaker || 0 
      },
      audience: { 
        current: room.currentAudience || 0, 
        max: room.maxAudience || 0 
      },
      sideA: room.sideA,
      sideB: room.sideB
    }));
    
    // 현재 청중 수로 내림차순 정렬
    return convertedDiscussions.sort((a, b) => 
      b.audience.current - a.audience.current
    );
  };

  // 효율적 토론방 데이터 업데이트 함수
  const updateDiscussionsEfficiently = (newApiData: any[]) => {
    const newDiscussions = convertApiDataToDiscussions(newApiData);
    
    setDiscussions(prevDiscussions => {
      // 기존 토론방 ID 목록
      const prevIds = new Set(prevDiscussions.map(d => d.id));
      const newIds = new Set(newDiscussions.map(d => d.id));
      
      // 삭제된 토론방들
      const removedIds = [...prevIds].filter(id => !newIds.has(id));
      
      // 새로 추가된 토론방들
      const addedDiscussions = newDiscussions.filter(d => !prevIds.has(d.id));
      
      // 기존 토론방 업데이트
      const updatedDiscussions = prevDiscussions
        .filter(d => !removedIds.includes(d.id)) // 삭제된 토론방 제거
        .map(prevDiscussion => {
          const newDiscussion = newDiscussions.find(d => d.id === prevDiscussion.id);
          if (newDiscussion) {
            // 실시간 업데이트가 필요한 필드들만 업데이트
            return {
              ...prevDiscussion,
              currentSpeaker: newDiscussion.speakers.current,
              currentAudience: newDiscussion.audience.current,
              status: newDiscussion.status,
              timeStatus: newDiscussion.timeStatus,
              speakers: newDiscussion.speakers,
              audience: newDiscussion.audience
            };
          }
          return prevDiscussion;
        });
      
      // 새로운 토론방 추가 및 정렬
      const finalDiscussions = [...updatedDiscussions, ...addedDiscussions];
      
      // 청중 수로 다시 정렬 (순위 변경 반영)
      return finalDiscussions.sort((a, b) => 
        b.audience.current - a.audience.current
      );
    });
  };

  // 3초 폴링 시작 함수
  const startPolling = () => {
    console.log('[둘러보기] 3초 폴링 시작');
    
    const pollData = async () => {
      try {
        const apiData = await debateApi.getAllDebateRooms();
        updateDiscussionsEfficiently(apiData);
      } catch (error) {
        console.error('[둘러보기] 폴링 중 오류:', error);
        toast.error('토론방 조회에 실패했습니다');
      }
    };
    
    // 3초마다 폴링
    pollingRef.current = setInterval(pollData, 3000);
  };

  // 폴링 중단 함수
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      console.log('[둘러보기] 폴링 중단');
    }
  };

  // 초기 데이터 로드 및 폴링 시작
  useEffect(() => {
    const loadDebateRooms = async () => {
      try {
        const apiData = await debateApi.getAllDebateRooms();
        const convertedDiscussions = convertApiDataToDiscussions(apiData);
        
        setDiscussions(convertedDiscussions);
        
        // 초기 로드 완료 후 폴링 시작
        startPolling();
      } catch (error) {
        console.error('[둘러보기] 초기 데이터 로드 실패:', error);
        toast.error('토론방 조회에 실패했습니다');
        setDiscussions([]);
      }
    };

    loadDebateRooms();

    // 컴포넌트 언마운트 시 폴링 중단
    return () => {
      stopPolling();
    };
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
    
    // 토론방 입장 시 폴링 중단
    stopPolling();
    
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
        onNavigate={onNavigate}
      />

      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateConfirm}
        onNavigate={onNavigate}
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