import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const DebateRoom = () => {
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState<"left" | "right" | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<"left" | "right" | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "speech" | "chat">("summary");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [speechMode, setSpeechMode] = useState<"text" | "voice">("text");
  const [canSpeak, setCanSpeak] = useState(true);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [remainingTime, setRemainingTime] = useState(18);
  const isMobile = window.innerWidth <= 640;

  const speakerTimerHeight = isMobile ? 140 : 200; // Estimated height of speaker timer area
  const speechContentMinHeight = speakerTimerHeight * 1.8;
  const aiSummaryMaxHeight = speechContentMinHeight * 0.8; // AI summary should be shorter than speech content

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <div className="bg-background px-4 py-3 border-b-2 border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/browse")}
              className="w-8 h-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex-1 text-center px-2">
            <h1 className="text-sm font-bold text-foreground leading-tight">
              AI 시대, 인간의 창의성은 여전히 중요할까?
            </h1>
            <p className="text-xs text-muted-foreground">
              AI & 미래사회 · 3분토론
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1"
          >
            <Share2 className="w-3 h-3" />
            <span className="text-xs">공유</span>
          </Button>
        </div>

        {/* Status Info */}
        <div className="bg-background px-4 py-2 border-b border-border flex justify-between items-center">
          <Badge className="bg-debate-active text-white text-xs">진행중</Badge>
          <span className="text-xs text-muted-foreground">청중 127명</span>
          <div className="text-xs font-semibold text-red-600">
            {formatTime(remainingTime)}
          </div>
        </div>

        {/* Current Speaker Section */}
        <div className="bg-slate-700 text-white py-4 px-4 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
            김
          </div>
          <h3 className="text-lg font-bold mb-2">김민수님</h3>
          <div className="flex justify-center items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">1. 발언</Badge>
            <ArrowRight className="w-3 h-3" />
            <Badge variant="outline" className="text-xs border-white/30 text-white/70">2. 논의</Badge>
          </div>
          <div className="w-32 h-4 bg-white/20 rounded-full mx-auto mb-2 overflow-hidden">
            <div className="h-full bg-white rounded-full w-3/5 transition-all duration-1000"></div>
          </div>
          <p className="text-xs opacity-80">18초 남음</p>
        </div>

        {/* Position Selection */}
        <div className="bg-background px-4 py-3 border-b border-border">
          <div className="flex h-5 rounded border border-border overflow-hidden mb-2">
            <div className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold flex-1">
              58%
            </div>
            <div className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold flex-1">
              42%
            </div>
          </div>
          <div className="flex justify-between items-center text-xs">
            <button
              className={`px-3 py-1 rounded transition-colors ${
                selectedPosition === 'left'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : hoveredPosition === 'left'
                  ? 'bg-green-100 text-green-800'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSelectedPosition(selectedPosition === 'left' ? null : 'left')}
              onMouseEnter={() => setHoveredPosition('left')}
              onMouseLeave={() => setHoveredPosition(null)}
            >
              인간 창의성 중요
            </button>
            <button
              className={`px-3 py-1 rounded transition-colors ${
                selectedPosition === 'right'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : hoveredPosition === 'right'
                  ? 'bg-red-100 text-red-800'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSelectedPosition(selectedPosition === 'right' ? null : 'right')}
              onMouseEnter={() => setHoveredPosition('right')}
              onMouseLeave={() => setHoveredPosition(null)}
            >
              AI가 더 창의적
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex bg-muted border-b border-border">
          <button
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'summary' 
                ? 'text-primary border-b-2 border-primary bg-background' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            AI 요약
          </button>
          <button
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'speech' 
                ? 'text-primary border-b-2 border-primary bg-background' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('speech')}
          >
            발언 내용
          </button>
          <button
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'chat' 
                ? 'text-primary border-b-2 border-primary bg-background' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            채팅
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'summary' && (
            <div className="flex-1 overflow-hidden">
              <div className="p-3 h-full overflow-y-auto" style={{ maxHeight: `${aiSummaryMaxHeight}px` }}>
                <div className="bg-muted border border-border border-l-4 border-l-primary rounded p-3 mb-3">
                  <h4 className="text-xs font-semibold text-primary mb-1">이지현님 발언 요약</h4>
                  <p className="text-xs text-muted-foreground">
                    AI의 학습 능력과 데이터 처리 속도가 인간의 창의성을 뛰어넘을 수 있다고 주장. GPT-4의 창의성 테스트 결과를 근거로 제시.
                  </p>
                </div>
                <div className="bg-muted border border-border border-l-4 border-l-primary rounded p-3">
                  <h4 className="text-xs font-semibold text-primary mb-1">박준영님 발언 요약</h4>
                  <p className="text-xs text-muted-foreground">
                    인간 고유의 감정적 공감 능력과 맥락적 이해가 AI로는 대체 불가능하다고 반박. 직관적 사고의 중요성 강조.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'speech' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3" style={{ minHeight: `${speechContentMinHeight}px` }}>
                <div className="bg-muted border border-green-500 border-l-4 rounded p-3 mb-3">
                  <h4 className="text-xs font-semibold mb-2">이지현님</h4>
                  <p className="text-xs mb-2">
                    GPT-4가 창의성 테스트에서 상위 1% 점수를 받았다는 OpenAI의 2023년 연구 결과가 있습니다.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white text-xs">사실</Badge>
                    <Button variant="outline" size="sm" className="text-xs">
                      출처 보기
                    </Button>
                  </div>
                </div>
                <div className="bg-muted border border-orange-500 border-l-4 rounded p-3 mb-3">
                  <h4 className="text-xs font-semibold mb-2">박준영님</h4>
                  <p className="text-xs mb-2">
                    AI는 감정을 진정으로 이해할 수 없습니다. 창의성의 핵심은 인간만이 가진 감정적 경험과 직관에서 나온다고 생각합니다.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-500 text-white text-xs">불분명</Badge>
                    <Button variant="outline" size="sm" className="text-xs">
                      출처 보기
                    </Button>
                  </div>
                </div>
                <div className="bg-muted border border-red-500 border-l-4 rounded p-3">
                  <h4 className="text-xs font-semibold mb-2">김민수님</h4>
                  <p className="text-xs mb-2">
                    AI는 단순히 기존 데이터를 조합하는 것뿐이고, 진정한 창의는 무에서 유를 창조하는 인간만의 능력입니다.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500 text-white text-xs">부분적 오류</Badge>
                    <Button variant="outline" size="sm" className="text-xs">
                      출처 보기
                    </Button>
                  </div>
                </div>
              </div>

              {/* Speech Input Area - Only show in speaker mode */}
              {isSpeaker && (
                <div className="bg-muted border-t border-border p-3 flex-shrink-0 min-h-[120px]">
                  <div className="flex justify-center mb-3">
                    <div className="flex bg-border rounded-full p-1">
                      <button
                        className={`px-4 py-1 rounded-full text-xs font-semibold transition-colors ${
                          speechMode === 'text' 
                            ? 'bg-slate-700 text-white' 
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => setSpeechMode('text')}
                      >
                        채팅 발언
                      </button>
                      <button
                        className={`px-4 py-1 rounded-full text-xs font-semibold transition-colors ${
                          speechMode === 'voice' 
                            ? 'bg-slate-700 text-white' 
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => setSpeechMode('voice')}
                      >
                        음성 발언
                      </button>
                    </div>
                  </div>
                  
                  {speechMode === 'text' ? (
                    <div className="flex gap-2 items-end">
                      <textarea
                        className="flex-1 p-2 border border-border rounded text-xs resize-none min-h-[50px]"
                        placeholder="발언 내용을 입력하세요..."
                        disabled={!canSpeak}
                      />
                      <Button 
                        size="sm" 
                        disabled={!canSpeak}
                        className="bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        발언하기
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Button 
                        size="lg" 
                        disabled={!canSpeak}
                        className="bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        발언 완료
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-3">
                  <div className="bg-muted border border-border rounded p-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold">정하늘</span>
                      <span className="text-xs text-muted-foreground">1분 전</span>
                    </div>
                    <p className="text-xs">김민수님 의견에 공감해요! 인간의 직관이 중요하죠</p>
                  </div>
                  <div className="bg-muted border border-border rounded p-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold">한소영</span>
                      <span className="text-xs text-muted-foreground">30초 전</span>
                    </div>
                    <p className="text-xs">하지만 AI도 계속 발전하고 있잖아요. 미래에는 어떨까요?</p>
                  </div>
                  <div className="bg-muted border border-border rounded p-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold">강민호</span>
                      <span className="text-xs text-muted-foreground">방금</span>
                    </div>
                    <p className="text-xs">두 의견 다 일리가 있네요. 흥미로운 토론입니다!</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted border-t border-border p-3 flex-shrink-0">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-border rounded-full text-xs outline-none focus:ring-2 focus:ring-primary"
                    placeholder="채팅 입력..."
                    style={{ height: '32px' }} // Match button height
                  />
                  <Button 
                    size="sm" 
                    className="bg-slate-700 hover:bg-slate-600 text-white rounded-full px-4 h-8"
                  >
                    <span className="text-xs">전송</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Handle */}
        <div
          className="fixed left-0 top-1/2 transform -translate-y-1/2 w-5 bg-slate-700/30 rounded-r-lg cursor-pointer z-10 flex items-center justify-center"
          style={{ height: `${(window.innerHeight || 800) * 0.33}px` }}
          onClick={() => setShowSidebar(true)}
        >
          <ChevronRight className="w-4 h-4 text-white/70" />
        </div>

        {/* Modals */}
        {showShareModal && (
          <ShareModal open={showShareModal} onOpenChange={setShowShareModal} />
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-background px-6 py-4 border-b-2 border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/browse")}
            className="w-10 h-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-foreground mb-1">
            AI 시대, 인간의 창의성은 여전히 중요할까?
          </h1>
          <p className="text-sm text-muted-foreground">
            AI & 미래사회 · 3분토론 · 4명 참여중
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge className="bg-debate-active text-white">진행중</Badge>
          <div className="text-sm font-semibold text-red-600">
            {formatTime(remainingTime)}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            공유
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Participants */}
        <div className="w-80 bg-background border-r-2 border-border flex flex-col">
          <div className="bg-muted px-4 py-3 border-b-2 border-border">
            <h3 className="font-semibold">발언자 목록 (4명)</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border-2 border-border">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-semibold">
                  김
                </div>
                <div>
                  <p className="font-medium">김민수</p>
                  <p className="text-sm text-muted-foreground">찬성 · 발언중</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-semibold">
                  이
                </div>
                <div>
                  <p className="font-medium">이지현</p>
                  <p className="text-sm text-muted-foreground">반대 · 대기중</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-semibold">
                  박
                </div>
                <div>
                  <p className="font-medium">박준영</p>
                  <p className="text-sm text-muted-foreground">찬성 · 대기중</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-semibold">
                  최
                </div>
                <div>
                  <p className="font-medium">최수빈</p>
                  <p className="text-sm text-muted-foreground">반대 · 대기중</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col flex-1">
          {/* Current Speaker */}
          <div className="bg-slate-700 text-white py-6 px-6 text-center border-b-2 border-border">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              김
            </div>
            <h3 className="text-xl font-bold mb-3">김민수님</h3>
            <div className="flex justify-center items-center gap-3 mb-4">
              <Badge variant="secondary">1. 발언</Badge>
              <ArrowRight className="w-4 h-4" />
              <Badge variant="outline" className="border-white/30 text-white/70">2. 논의</Badge>
            </div>
            <div className="w-48 h-5 bg-white/20 rounded-full mx-auto mb-3 overflow-hidden">
              <div className="h-full bg-white rounded-full w-3/5 transition-all duration-1000"></div>
            </div>
            <p className="text-sm opacity-80">18초 남음</p>
          </div>

          {/* Position Selection */}
          <div className="bg-background px-6 py-4 border-b border-border">
            <div className="flex h-6 rounded border border-border overflow-hidden mb-3">
              <div className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold flex-1">
                58%
              </div>
              <div className="bg-red-500 flex items-center justify-center text-white text-sm font-semibold flex-1">
                42%
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                className={`px-4 py-2 rounded transition-colors ${
                  selectedPosition === 'left'
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : hoveredPosition === 'left'
                    ? 'bg-green-100 text-green-800'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setSelectedPosition(selectedPosition === 'left' ? null : 'left')}
                onMouseEnter={() => setHoveredPosition('left')}
                onMouseLeave={() => setHoveredPosition(null)}
              >
                인간 창의성 중요
              </button>
              <button
                className={`px-4 py-2 rounded transition-colors ${
                  selectedPosition === 'right'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : hoveredPosition === 'right'
                    ? 'bg-red-100 text-red-800'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setSelectedPosition(selectedPosition === 'right' ? null : 'right')}
                onMouseEnter={() => setHoveredPosition('right')}
                onMouseLeave={() => setHoveredPosition(null)}
              >
                AI가 더 창의적
              </button>
            </div>
          </div>

          {/* Speech Content Area */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col border-r border-border">
              <div className="bg-muted px-4 py-3 border-b border-border">
                <h3 className="font-semibold">발언 내용</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: `${speechContentMinHeight}px` }}>
                <div className="space-y-4">
                  <div className="bg-muted border border-green-500 border-l-4 rounded p-4">
                    <h4 className="font-semibold mb-2">이지현님</h4>
                    <p className="text-sm mb-3">
                      GPT-4가 창의성 테스트에서 상위 1% 점수를 받았다는 OpenAI의 2023년 연구 결과가 있습니다. 이는 AI가 이미 인간 수준의 창의성을 보여주고 있다는 증거입니다.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500 text-white">사실</Badge>
                      <Button variant="outline" size="sm">
                        출처 보기
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted border border-orange-500 border-l-4 rounded p-4">
                    <h4 className="font-semibold mb-2">박준영님</h4>
                    <p className="text-sm mb-3">
                      하지만 AI는 감정을 진정으로 이해할 수 없습니다. 창의성의 핵심은 인간만이 가진 감정적 경험과 직관에서 나온다고 생각합니다.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-500 text-white">불분명</Badge>
                      <Button variant="outline" size="sm">
                        출처 보기
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted border border-red-500 border-l-4 rounded p-4">
                    <h4 className="font-semibold mb-2">김민수님</h4>
                    <p className="text-sm mb-3">
                      AI는 단순히 기존 데이터를 조합하는 것뿐이고, 진정한 창의는 무에서 유를 창조하는 인간만의 능력입니다.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500 text-white">부분적 오류</Badge>
                      <Button variant="outline" size="sm">
                        출처 보기
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Speech Input Area - Only show in speaker mode */}
              {isSpeaker && (
                <div className="bg-muted border-t border-border p-4 flex-shrink-0 min-h-[160px]">
                  <div className="flex justify-center mb-4">
                    <div className="flex bg-border rounded-full p-1">
                      <button
                        className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                          speechMode === 'text' 
                            ? 'bg-slate-700 text-white' 
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => setSpeechMode('text')}
                      >
                        채팅 발언
                      </button>
                      <button
                        className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                          speechMode === 'voice' 
                            ? 'bg-slate-700 text-white' 
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => setSpeechMode('voice')}
                      >
                        음성 발언
                      </button>
                    </div>
                  </div>
                  
                  {speechMode === 'text' ? (
                    <div className="flex gap-3 items-end">
                      <textarea
                        className="flex-1 p-3 border border-border rounded resize-none"
                        rows={3}
                        placeholder="발언자로 지정되면 여기에 발언 내용을 입력할 수 있습니다..."
                        disabled={!canSpeak}
                      />
                      <Button 
                        disabled={!canSpeak}
                        className="bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        발언하기
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Button 
                        size="lg" 
                        disabled={!canSpeak}
                        className="bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        발언 완료
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex flex-col">
          {/* AI Summary */}
          <div className="flex flex-col border-b border-border" style={{ maxHeight: `${aiSummaryMaxHeight}px` }}>
            <div className="bg-muted px-4 py-3 border-b border-border">
              <h3 className="font-semibold">AI 발언 요약</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                <div className="bg-muted border border-border border-l-4 border-l-primary rounded p-3">
                  <h4 className="text-sm font-semibold text-primary mb-2">이지현님 발언 요약</h4>
                  <p className="text-xs text-muted-foreground">
                    AI의 학습 능력과 데이터 처리 속도가 인간의 창의성을 뛰어넘을 수 있다고 주장. GPT-4의 창의성 테스트 결과를 근거로 제시.
                  </p>
                </div>
                <div className="bg-muted border border-border border-l-4 border-l-primary rounded p-3">
                  <h4 className="text-sm font-semibold text-primary mb-2">박준영님 발언 요약</h4>
                  <p className="text-xs text-muted-foreground">
                    인간 고유의 감정적 공감 능력과 맥락적 이해가 AI로는 대체 불가능하다고 반박. 직관적 사고의 중요성 강조.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* General Chat */}
          <div className="flex-1 flex flex-col">
            <div className="bg-muted px-4 py-3 border-b border-border">
              <h3 className="font-semibold">청중 (12명)</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                <div className="bg-muted border border-border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold">정하늘</span>
                    <span className="text-xs text-muted-foreground">1분 전</span>
                  </div>
                  <p className="text-xs">김민수님 의견에 공감해요! 인간의 직관이 중요하죠</p>
                </div>
                <div className="bg-muted border border-border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold">한소영</span>
                    <span className="text-xs text-muted-foreground">30초 전</span>
                  </div>
                  <p className="text-xs">하지만 AI도 계속 발전하고 있잖아요. 미래에는 어떨까요?</p>
                </div>
                <div className="bg-muted border border-border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold">강민호</span>
                    <span className="text-xs text-muted-foreground">방금</span>
                  </div>
                  <p className="text-xs">두 의견 다 일리가 있네요. 흥미로운 토론입니다!</p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted border-t border-border p-4 flex-shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-border rounded-full text-xs outline-none focus:ring-2 focus:ring-primary"
                  placeholder="채팅 입력..."
                  style={{ height: '32px' }}
                />
                <Button 
                  size="sm" 
                  className="bg-slate-700 hover:bg-slate-600 text-white rounded-full px-4 h-8"
                >
                  <span className="text-xs">전송</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showShareModal && (
        <ShareModal open={showShareModal} onOpenChange={setShowShareModal} />
      )}
    </div>
  );
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ShareModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  // Placeholder for ShareModal component or import if exists
  return null;
}
