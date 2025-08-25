import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { JoinDiscussionModal } from './JoinDiscussionModal';
import { Loader2 } from 'lucide-react';
import { Discussion, DISCUSSION_CATEGORIES, DebateType, DEBATE_TYPES } from '../../types/discussion';
import { categoryApi, debateApi } from '../../lib/api/apiClient';
import { toast } from "sonner";



interface Category {
  id: number;
  name: string;
}

interface DebateMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatching: (roomData: any) => void;
  onNavigate?: (page: 'landing' | 'browser' | 'debate', discussionId?: string, userInfo?: { userRole: 'SPEAKER' | 'AUDIENCE', userPosition: string }) => void;
}



// 더미 토론방 데이터 생성 함수
const generateMockDiscussion = (category: string): Discussion => {
  const discussionTitles = {
    '💕연애': ['연애에서 가장 중요한 것은 무엇일까?', '첫인상 vs 내면, 무엇이 더 중요할까?'],
    '👥친구 & 인간관계': ['친구 사이에서 돈 문제, 어떻게 해결할까?', 'SNS에서 친구와의 갈등, 어떻게 대처할까?'],
    '🏠일상 & 라이프스타일': ['집에서 vs 카페에서, 어디서 일하는 게 좋을까?', '미니멀 라이프 vs 맥시멀 라이프'],
    '💼취업 & 진로': ['대기업 vs 스타트업, 어디가 더 좋을까?', '돈 vs 워라밸, 무엇이 더 중요할까?'],
    '🔥밈 & 유행': ['요즘 유행하는 밈의 진짜 의미는?', 'Z세대 트렌드, 밀레니얼은 따라갈 수 있을까?'],
    '📱SNS & 온라인 문화': ['인스타 vs 틱톡, 어떤 플랫폼이 더 좋을까?', 'SNS 스토리 기능의 진짜 목적은?'],
    '🤖AI & 미래사회': ['AI가 인간의 일자리를 대체할까?', 'ChatGPT vs 구글 검색, 무엇이 더 유용할까?'],
    '🎮게임 & e스포츠': ['모바일 게임 vs PC 게임', 'e스포츠는 진짜 스포츠일까?'],
    '🎭K-콘텐츠': ['K-POP의 글로벌 성공 비결은?', '한국 드라마 vs 영화, 어떤 게 더 재밌을까?'],
    '⚖️논란 & 사회 이슈': ['청년 세대의 가장 큰 고민은?', '환경보호 vs 경제발전, 무엇이 우선일까?'],
    '💰돈 & 소비문화': ['용돈 관리의 가장 좋은 방법은?', '투자 vs 저축, 20대에게 더 좋은 것은?'],
    '💬자유 주제': ['가장 논란이 될 만한 주제는?', '요즘 세상에서 가장 중요한 가치는?']
  };

  const titles = discussionTitles[category as keyof typeof discussionTitles] || ['자유 주제 토론'];
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];

  return {
    id: `discussion-${Date.now()}`,
    type: Math.random() > 0.5 ? DEBATE_TYPES[0] : DEBATE_TYPES[1], // '일반토론' : '3분토론'
    status: '대기중',
    title: randomTitle,
    category: category as any,
    timeStatus: '곧 시작',
    speakers: { current: Math.floor(Math.random() * 3), max: 6 },
    audience: { current: Math.floor(Math.random() * 15), max: 50 }
  };
};

export function DebateMatchingModal({ 
  isOpen, 
  onClose, 
  onStartMatching,
  onNavigate 
}: DebateMatchingModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [matchingState, setMatchingState] = useState<'idle' | 'searching' | 'found'>('idle');
  const [progress, setProgress] = useState(0);
  const [foundDiscussion, setFoundDiscussion] = useState<Discussion | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // 카테고리 조회
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await categoryApi.getAllCategories();
      setCategories(response);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      toast.error('카테고리를 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleStartMatching = async () => {
    if (selectedCategory) {
      setMatchingState('searching');
      setProgress(0);

      // Progress 애니메이션
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            // 95%에서 멈춤 (API 완료 대기)
            return 95;
          }
          return prev + 15;
        });
      }, 150);

      try {
        // 실제 매칭 API 호출
        const roomData = await debateApi.matchDebateRoom(selectedCategory.id);
        
        // API 완료 후 100% 완료
        clearInterval(progressInterval);
        setProgress(100);
        setMatchingState('found');
        
        // API 응답 데이터를 Discussion 형태로 변환
        const matchedDiscussion: Discussion = {
          id: roomData.roomId,
          type: roomData.debateType === 'NORMAL' ? '일반토론' : '3분토론',
          status: roomData.status === 'waiting' ? '대기중' : '진행중',
          title: roomData.title,
          category: roomData.category.name,
          timeStatus: '곧 시작',
          speakers: { current: roomData.currentSpeaker || 0, max: roomData.maxSpeaker },
          audience: { current: roomData.currentAudience || 0, max: roomData.maxAudience },
          sideA: roomData.sideA, // API 응답의 sideA
          sideB: roomData.sideB  // API 응답의 sideB
        };
        
        setFoundDiscussion(matchedDiscussion);
        setIsJoinModalOpen(true);
        
        console.log('매칭 성공:', roomData);
      } catch (error) {
        console.error('매칭 실패:', error);
        clearInterval(progressInterval);
        setMatchingState('idle');
        setProgress(0);
        toast.error('매칭에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleJoinDiscussion = (discussionId: string, nickname: string, role: 'speaker' | 'audience') => {
    console.log('토론방 입장:', { discussionId, nickname, role });
    
    // 매칭된 방 데이터와 사용자 선택 정보를 함께 전달
    if (foundDiscussion) {
      const roomInfo = {
        roomId: discussionId,
        title: foundDiscussion.title,
        category: foundDiscussion.category,
        debateType: foundDiscussion.type,
        userRole: role.toUpperCase(), // 'SPEAKER' | 'AUDIENCE'
        userNickname: nickname
      };
      onStartMatching(roomInfo);
    }
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setSelectedCategory(null);
    setMatchingState('idle');
    setProgress(0);
    setFoundDiscussion(null);
    setIsJoinModalOpen(false);
  };

  const handleJoinModalClose = () => {
    setIsJoinModalOpen(false);
    setMatchingState('idle');
    setProgress(0);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-[90vw] max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader className="text-center">
            <DialogTitle>토론 매칭 시작</DialogTitle>
            <DialogDescription>
              관심 카테고리를 선택해주세요
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {matchingState === 'idle' && (
              <>
                <div className="text-center">
                  <p className="text-muted-foreground">
                    어떤 주제로 토론하고 싶으신가요?
                  </p>
                </div>

                {/* 카테고리 선택 */}
                {isLoadingCategories ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category)}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-200 text-left
                          hover:border-primary/50 hover:bg-accent/50
                          ${selectedCategory?.id === category.id 
                            ? 'border-primary bg-accent' 
                            : 'border-border bg-background'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate">{category.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 선택된 카테고리 표시 */}
                {selectedCategory && (
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="text-sm">
                      {selectedCategory.name} 선택됨
                    </Badge>
                  </div>
                )}

                {/* 버튼 영역 */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleStartMatching}
                    disabled={!selectedCategory}
                    className="flex-1"
                  >
                    매칭 시작
                  </Button>
                </div>
              </>
            )}

            {matchingState === 'searching' && (
              <div className="space-y-6 py-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">토론방을 찾고 있습니다...</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedCategory?.name} 토론방 매칭 중
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-xs text-muted-foreground">
                      {progress}% 완료
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 토론방 입장 모달 */}
      <JoinDiscussionModal
        isOpen={isJoinModalOpen}
        onClose={handleJoinModalClose}
        discussion={foundDiscussion}
        onJoin={handleJoinDiscussion}
        onNavigate={onNavigate}
      />
    </>
  );
}