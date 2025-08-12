import { useState } from 'react';
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

  const handleNavigate = (page: 'landing' | 'browser' | 'debate', debateRoomInfo?: DebateRoomInfo) => {
    if (page !== currentPage) {
      setPageHistory(prev => [...prev, currentPage]);
    }
    setCurrentPage(page);

    if (page === 'debate' && debateRoomInfo) {
      setCurrentDebateRoom(debateRoomInfo);
    } else if (page !== 'debate') {
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

        {currentPage === 'browser' && (
            <BrowserLayout onNavigate={handleNavigate}>
              <BrowserPage
                  onNavigate={handleNavigate}
                  onJoinDebate={handleJoinExistingDebate}
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
