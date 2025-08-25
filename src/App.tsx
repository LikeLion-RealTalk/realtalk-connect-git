import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TopNav } from './components/TopNav';
import { HeroSection } from './components/HeroSection';
import { PopularDiscussions } from './components/PopularDiscussions';
import { FeaturesSection } from './components/FeaturesSection';
import { Footer } from './components/Footer';
import { BrowserLayout } from './components/browser/BrowserLayout';
import { BrowserPage } from './components/browser/BrowserPage';
import { DebateLayout } from './components/debate/DebateLayout';
import { DebatePage } from './components/debate/DebatePage';
import { UserProvider } from './components/UserProvider';
import { PermissionProvider } from './components/PermissionProvider';
import { PermissionRequestModal } from './components/modal/PermissionRequestModal';
import { usePermissionRequest } from './components/usePermissionRequest';
import { DebateRoomInfo, getDebateRoomConfig } from './mock/debateRooms';
import { DiscussionData, ParticipationRole, Position } from './types/discussion';
import { Toaster } from './components/ui/sonner';

// 권한 모달을 포함한 앱 래퍼 컴포넌트
function AppWithPermissions() {
  const {
    microphonePermission,
    clipboardPermission,
    activeModal,
    closePermissionModal,
    handleRequestMicrophonePermission,
    handleRequestClipboardPermission,
    handleRetryPermission
  } = usePermissionRequest();

  const [currentPage, setCurrentPage] = useState<'landing' | 'browser' | 'debate'>('landing');
  const [pageHistory, setPageHistory] = useState<('landing' | 'browser' | 'debate')[]>(['landing']);
  const [currentDebateRoom, setCurrentDebateRoom] = useState<DebateRoomInfo | null>(null);
  
  // 디버깅용 로그
  console.log('App.tsx State Debug:', {
    currentPage,
    currentDebateRoom: currentDebateRoom ? {
      id: currentDebateRoom.id,
      title: currentDebateRoom.title,
      category: currentDebateRoom.category
    } : null,
    windowLocation: {
      pathname: window.location.pathname,
      search: window.location.search
    }
  });
  const [directLinkRoomId, setDirectLinkRoomId] = useState<string | null>(null);

  // URL에서 roomUUID 감지 및 처리
  useEffect(() => {
    const checkURLForRoomId = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      
      // /debate/{uuid} 패턴 체크 - 모든 토론방은 일단 browser로 보내서 실제 정보 확인
      const debateRoomPattern = /^\/debate\/([a-f0-9-]{36})$/;
      const debateMatch = path.match(debateRoomPattern);
      
      if (debateMatch) {
        const roomUUID = debateMatch[1];
        const urlParams = new URLSearchParams(search);
        
        console.log('[직접 링크] debate room 감지:', { roomUUID, search });
        
        // 모든 /debate/{uuid} 링크는 browser 페이지로 보내서 실제 토론방 정보를 확인
        setDirectLinkRoomId(roomUUID);
        setCurrentPage('browser');
        return;
      }
      
      // 기존 /{uuid} 패턴도 유지
      const roomUUIDPattern = /^\/([a-f0-9-]{36})$/;
      const match = path.match(roomUUIDPattern);
      
      if (match) {
        const roomUUID = match[1];
        console.log('[직접 링크] roomUUID 감지:', roomUUID);
        setDirectLinkRoomId(roomUUID);
        setCurrentPage('browser');
      }
    };

    checkURLForRoomId();
  }, []);

  const handleNavigate = (page: 'landing' | 'browser' | 'debate', debateRoomInfoOrId?: DebateRoomInfo | string, userInfo?: { userRole: 'SPEAKER' | 'AUDIENCE', userPosition: string, userSelectedSide?: 'A' | 'B' }) => {
    console.log('handleNavigate called:', { page, debateRoomInfoOrId, userInfo });
    
    if (page !== currentPage) {
      setPageHistory(prev => [...prev, currentPage]);
    }
    setCurrentPage(page);

    if (page === 'debate') {
      if (typeof debateRoomInfoOrId === 'string') {
        // discussionId가 문자열로 전달된 경우 DebateRoomInfo 객체 생성
        const debateRoom: DebateRoomInfo = {
          id: debateRoomInfoOrId,
          title: '토론방 참여',
          category: '분류 미정',
          debateType: '토론 유형 확인 중',
          isCreatedByUser: false,
          userPosition: userInfo ? userInfo.userPosition : null,
          userSelectedSide: userInfo ? userInfo.userSelectedSide : undefined,
          userRole: userInfo ? userInfo.userRole : undefined,
          aDescription: 'A입장입니다.',
          bDescription: 'B입장입니다.',
          creator: { name: '참여자' },
          duration: 300, // 5분 기본
          maxSpeakers: 4,
          maxAudience: 20,
          currentSpeakers: 0,
          currentAudience: 0,
          startTime: new Date(),
          remainingTime: 300
        };
        setCurrentDebateRoom(debateRoom);
      } else if (debateRoomInfoOrId) {
        // userInfo가 있으면 userPosition, userRole, userSelectedSide 설정
        if (userInfo) {
          debateRoomInfoOrId.userPosition = userInfo.userPosition;
          debateRoomInfoOrId.userRole = userInfo.userRole;
          debateRoomInfoOrId.userSelectedSide = userInfo.userSelectedSide;
        }
        setCurrentDebateRoom(debateRoomInfoOrId);
      }
    } else {
      setCurrentDebateRoom(null);
    }
  };

  const handleGoBack = () => {
    if (pageHistory.length > 0) {
      const previousPage = pageHistory[pageHistory.length - 1];
      setPageHistory(prev => prev.slice(0, -1));
      setCurrentPage(previousPage);
      if (currentPage === 'debate') {
        setCurrentDebateRoom(null);
      }
    } else {
      setCurrentPage('landing');
      setCurrentDebateRoom(null);
    }
  };

  const handleJoinExistingDebate = (participationMode?: ParticipationRole) => {
    const debateRoom = getDebateRoomConfig('ai-creativity');
    debateRoom.id = 'f26e9cb8-b82f-490a-83e5-4675f095bd38';
    debateRoom.isCreatedByUser = false;
    debateRoom.currentSpeakers = Math.min(debateRoom.currentSpeakers + 1, debateRoom.maxSpeakers);
    debateRoom.userPosition = null;
    handleNavigate('debate', debateRoom);
  };

  const handleCreateNewDebate = (discussionData?: DiscussionData) => {
    if (discussionData) {
      const debateRoom: DebateRoomInfo = {
        id: `new-room-${Date.now()}`,
        title: discussionData.title,
        category: discussionData.category,
        debateType: discussionData.debateType,
        isCreatedByUser: true,
        userPosition: null,
        aDescription: discussionData.aPositionDescription || 'A입장입니다.',
        bDescription: discussionData.bPositionDescription || 'B입장입니다.',
        creator: { name: '김민수' },
        duration: discussionData.duration,
        maxSpeakers: discussionData.maxSpeakers,
        maxAudience: discussionData.maxAudience,
        currentSpeakers: 1,
        currentAudience: 0,
        startTime: new Date(),
        remainingTime: discussionData.duration
      };
      handleNavigate('debate', debateRoom);
    } else {
      const debateRoom = getDebateRoomConfig('ai-creativity');
      debateRoom.id = 'new-room-id';
      debateRoom.isCreatedByUser = true;
      debateRoom.userPosition = null;
      debateRoom.startTime = new Date();
      debateRoom.remainingTime = debateRoom.duration;
      handleNavigate('debate', debateRoom);
    }
  };

  const handleJoinSpecificDebate = (roomKey: string) => {
    const debateRoom = getDebateRoomConfig(roomKey);
    debateRoom.isCreatedByUser = false;
    debateRoom.currentSpeakers = Math.min(debateRoom.currentSpeakers + 1, debateRoom.maxSpeakers);
    debateRoom.userPosition = null;
    handleNavigate('debate', debateRoom);
  };

  const handleCreateSpecificDebate = (roomKey: string, userPosition?: Position) => {
    const debateRoom = getDebateRoomConfig(roomKey);
    debateRoom.isCreatedByUser = true;
    debateRoom.userPosition = null;
    debateRoom.currentSpeakers = 1;
    debateRoom.currentAudience = 0;
    debateRoom.startTime = new Date();
    debateRoom.remainingTime = debateRoom.duration;
    handleNavigate('debate', debateRoom);
  };

  return (
      <>
        {currentPage === 'debate' && currentDebateRoom && (
            <DebateLayout>
              <DebatePage
                  onNavigate={handleNavigate}
                  onGoBack={handleGoBack}
                  debateRoomInfo={currentDebateRoom}
              />
            </DebateLayout>
        )}
        
        {/* 디버깅: 조건 체크 */}
        {currentPage === 'debate' && !currentDebateRoom && (
          <div style={{position: 'fixed', top: 0, left: 0, background: 'red', color: 'white', padding: '10px', zIndex: 9999}}>
            DEBUG: currentPage is 'debate' but currentDebateRoom is null
          </div>
        )}

        {currentPage === 'browser' && (
            <BrowserLayout onNavigate={handleNavigate}>
              <BrowserPage
                  onNavigate={handleNavigate}
                  onJoinDebate={handleJoinExistingDebate}
                  directLinkRoomId={directLinkRoomId}
                  onDirectLinkProcessed={() => setDirectLinkRoomId(null)}
              />
            </BrowserLayout>
        )}

        {currentPage === 'landing' && (
            <Layout>
              <TopNav
                  onNavigate={handleNavigate}
                  onJoinDebate={() => handleJoinExistingDebate()}
                  onCreateDebate={handleCreateNewDebate}
              />
              <main>
                <HeroSection
                    onNavigate={handleNavigate}
                    onJoinDebate={() => handleJoinExistingDebate()}
                    onCreateDebate={handleCreateNewDebate}
                />
                <PopularDiscussions
                    onNavigate={handleNavigate}
                    onJoinDebate={() => handleJoinExistingDebate()}
                />
                <FeaturesSection />
              </main>
              <Footer />
            </Layout>
        )}

        <PermissionRequestModal
            isOpen={activeModal.isOpen}
            onClose={closePermissionModal}
            permissionType={activeModal.type}
            permissionState={activeModal.type === 'microphone' ? microphonePermission : clipboardPermission}
            onRequestPermission={activeModal.type === 'microphone' ? handleRequestMicrophonePermission : handleRequestClipboardPermission}
            onRetry={handleRetryPermission}
        />

        <Toaster />
      </>
  );
}

export default function App() {
  return (
      <UserProvider>
        <PermissionProvider>
          <AppWithPermissions />
        </PermissionProvider>
      </UserProvider>
  );
}
