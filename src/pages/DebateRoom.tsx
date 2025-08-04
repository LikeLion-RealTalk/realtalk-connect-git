import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Menu, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock debate data
const mockDebateData = {
  id: "1",
  title: "AI 시대, 인간의 창의성은 여전히 중요할까?",
  category: "AI & 미래사회",
  type: "quick" as const,
  status: "active" as const,
  duration: 3,
  timeRemaining: "2:15",
  currentSpeaker: {
    id: "1",
    name: "김민수",
    avatar: "김",
    position: "찬성",
    phase: "발언",
    timeLeft: "18초"
  },
  participants: [
    { id: "1", name: "김민수", avatar: "김", position: "찬성", status: "발언중", current: true },
    { id: "2", name: "이지현", avatar: "이", position: "반대", status: "대기중", current: false },
    { id: "3", name: "박준영", avatar: "박", position: "찬성", status: "대기중", current: false },
    { id: "4", name: "최수빈", avatar: "최", position: "반대", status: "대기중", current: false }
  ],
  audienceCount: 127,
  poll: {
    pros: 58,
    cons: 42,
    totalVotes: 89
  },
  aiSummaries: [
    {
      id: "1",
      author: "이지현님 발언 요약",
      content: "AI의 학습 능력과 데이터 처리 속도가 인간의 창의성을 뛰어넘을 수 있다고 주장. GPT-4의 창의성 테스트 결과를 근거로 제시."
    },
    {
      id: "2", 
      author: "박준영님 발언 요약",
      content: "인간 고유의 감정적 공감 능력과 맥락적 이해가 AI로는 대체 불가능하다고 반박. 직관적 사고의 중요성 강조."
    }
  ],
  speeches: [
    {
      id: "1",
      author: "이지현님",
      content: "GPT-4가 창의성 테스트에서 상위 1% 점수를 받았다는 OpenAI의 2023년 연구 결과가 있습니다. 이는 AI가 이미 인간 수준의 창의성을 보여주고 있다는 증거입니다.",
      factCheck: "사실" as const
    },
    {
      id: "2",
      author: "박준영님", 
      content: "하지만 AI는 감정을 진정으로 이해할 수 없습니다. 창의성의 핵심은 인간만이 가진 감정적 경험과 직관에서 나온다고 생각합니다.",
      factCheck: "불분명" as const
    },
    {
      id: "3",
      author: "김민수님",
      content: "AI는 단순히 기존 데이터를 조합하는 것뿐이고, 진정한 창의는 무에서 유를 창조하는 인간만의 능력입니다.",
      factCheck: "부분적 오류" as const
    }
  ],
  chatMessages: [
    { id: "1", author: "정하늘", content: "김민수님 의견에 공감해요! 인간의 직관이 중요하죠", time: "1분 전" },
    { id: "2", author: "한소영", content: "하지만 AI도 계속 발전하고 있잖아요. 미래에는 어떨까요?", time: "30초 전" },
    { id: "3", author: "강민호", content: "두 의견 다 일리가 있네요. 흥미로운 토론입니다!", time: "방금" }
  ]
};

type TabType = "ai-summary" | "speech" | "chat";

export const DebateRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState<TabType>("ai-summary");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [speechInput, setSpeechInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [speechMode, setSpeechMode] = useState<"text" | "voice">("text");

  const debate = mockDebateData; // In real app, fetch by id

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = () => {
    console.log("Share debate");
  };

  const handleSendSpeech = () => {
    if (speechInput.trim()) {
      console.log("Send speech:", speechInput);
      setSpeechInput("");
    }
  };

  const handleSendChat = () => {
    if (chatInput.trim()) {
      console.log("Send chat:", chatInput);
      setChatInput("");
    }
  };

  const getFactCheckStyle = (factCheck: string) => {
    switch (factCheck) {
      case "사실":
        return "border-green-500 border-l-4";
      case "부분적 오류":
        return "border-red-500 border-l-4";
      case "불분명":
        return "border-orange-500 border-l-4";
      default:
        return "border-border border-l-4";
    }
  };

  const getFactCheckLabelStyle = (factCheck: string) => {
    switch (factCheck) {
      case "사실":
        return "bg-green-500 text-white";
      case "부분적 오류":
        return "bg-red-500 text-white";
      case "불분명":
        return "bg-orange-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex justify-center p-4">
        <div className="w-full max-w-sm bg-background border-4 border-primary rounded-2xl overflow-hidden relative">
          {/* Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <div className={`fixed top-0 left-0 w-72 h-full bg-background z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r-2 border-border`}>
            <div className="p-4 border-b-2 border-border bg-muted flex justify-between items-center">
              <h2 className="text-sm font-semibold">발언자 목록 ({debate.participants.length}명)</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="w-6 h-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-3">
              {debate.participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-3 p-3 mb-2 rounded-lg border transition-all ${
                    participant.current 
                      ? 'bg-muted border-border' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    {participant.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{participant.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {participant.position} · {participant.status}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Slide Handle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-15 bg-primary text-primary-foreground rounded-r-xl flex items-center justify-center z-30 shadow-lg"
          >
            <ChevronDown className="w-3 h-3 rotate-90" />
          </button>

          {/* Header */}
          <div className="p-3 border-b-2 border-border flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleBack}
                className="w-8 h-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 text-center px-2">
              <div className="text-sm font-semibold leading-tight">{debate.title}</div>
              <div className="text-xs text-muted-foreground">{debate.category} · 3분토론</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="w-8 h-8"
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Status Info */}
          <div className="px-4 py-2 bg-muted border-b border-border flex justify-between items-center text-xs">
            <Badge className="bg-green-500 text-white">진행중</Badge>
            <span className="text-muted-foreground">청중 {debate.audienceCount}명</span>
            <span className="text-red-600 font-semibold">{debate.timeRemaining} 남음</span>
          </div>

          {/* Current Speaker */}
          <div className="bg-primary text-primary-foreground p-4 text-center">
            <div className="w-15 h-15 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
              {debate.currentSpeaker.avatar}
            </div>
            <div className="text-base font-bold mb-2">{debate.currentSpeaker.name}님</div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">1. 발언</Badge>
              <span className="text-xs opacity-70">→</span>
              <Badge variant="outline" className="text-xs border-primary-foreground/30">2. 논의</Badge>
            </div>
            <div className="w-36 h-4 bg-primary-foreground/20 rounded-full mx-auto mb-2 overflow-hidden">
              <div className="h-full bg-primary-foreground rounded-full w-3/5"></div>
            </div>
            <div className="text-xs opacity-80">{debate.currentSpeaker.timeLeft} 남음</div>
          </div>

          {/* Opinion Poll */}
          <div className="p-4 border-b-2 border-border">
            <div className="flex h-5 rounded overflow-hidden border">
              <div 
                className="bg-green-500 text-white flex items-center justify-center text-xs font-semibold"
                style={{ width: `${debate.poll.pros}%` }}
              >
                찬성 {debate.poll.pros}%
              </div>
              <div 
                className="bg-red-500 text-white flex items-center justify-center text-xs font-semibold"
                style={{ width: `${debate.poll.cons}%` }}
              >
                반대 {debate.poll.cons}%
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>인간 창의성 중요</span>
              <span>AI가 더 창의적</span>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="flex bg-muted border-b-2 border-border">
            {[
              { id: "ai-summary", label: "AI 요약" },
              { id: "speech", label: "발언 내용" },
              { id: "chat", label: "채팅" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-primary bg-background'
                    : 'text-muted-foreground border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* AI Summary Tab */}
            {activeTab === "ai-summary" && (
              <ScrollArea className="h-64 p-3">
                {debate.aiSummaries.map((summary) => (
                  <div key={summary.id} className="bg-muted border border-border border-l-4 border-l-primary rounded-lg p-3 mb-3">
                    <div className="text-xs font-semibold text-primary mb-2">{summary.author}</div>
                    <div className="text-xs leading-relaxed text-muted-foreground">{summary.content}</div>
                  </div>
                ))}
              </ScrollArea>
            )}

            {/* Speech Content Tab */}
            {activeTab === "speech" && (
              <div className="flex flex-col h-64">
                <ScrollArea className="flex-1 p-3">
                  {debate.speeches.map((speech) => (
                    <div key={speech.id} className={`bg-muted border rounded-lg p-3 mb-3 ${getFactCheckStyle(speech.factCheck)}`}>
                      <div className="text-xs font-semibold mb-2">{speech.author}</div>
                      <div className="text-xs leading-relaxed mb-2">{speech.content}</div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getFactCheckLabelStyle(speech.factCheck)}`}>
                          팩트체킹: {speech.factCheck}
                        </span>
                        <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-auto">
                          출처 보기
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                
                {/* Speech Input */}
                <div className="p-3 border-t-2 border-border bg-muted">
                  <div className="flex justify-center mb-3">
                    <div className="flex bg-border rounded-full p-1">
                      <button
                        onClick={() => setSpeechMode("text")}
                        className={`px-4 py-1 rounded-full text-xs font-semibold transition-colors ${
                          speechMode === "text" 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        채팅 발언
                      </button>
                      <button
                        onClick={() => setSpeechMode("voice")}
                        className={`px-4 py-1 rounded-full text-xs font-semibold transition-colors ${
                          speechMode === "voice" 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        음성 발언
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      value={speechInput}
                      onChange={(e) => setSpeechInput(e.target.value)}
                      placeholder="발언자로 지정되면 여기에 발언 내용을 입력할 수 있습니다..."
                      className="flex-1 p-2 border border-border rounded text-xs resize-none h-12 bg-background disabled:bg-muted disabled:text-muted-foreground"
                      disabled={!isLoggedIn}
                    />
                    <Button
                      onClick={handleSendSpeech}
                      disabled={!speechInput.trim() || !isLoggedIn}
                      className="px-3 py-2 text-xs"
                    >
                      발언
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="flex flex-col h-64">
                <ScrollArea className="flex-1 p-3">
                  {debate.chatMessages.map((message) => (
                    <div key={message.id} className="bg-muted border border-border rounded-lg p-2 mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold">{message.author}</span>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                      <div className="text-xs leading-relaxed">{message.content}</div>
                    </div>
                  ))}
                </ScrollArea>
                
                {/* Chat Input */}
                <div className="p-3 border-t-2 border-border bg-muted">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="채팅 입력..."
                      className="flex-1 px-3 py-2 border border-border rounded-full text-xs bg-background"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    />
                    <Button
                      onClick={handleSendChat}
                      disabled={!chatInput.trim()}
                      className="px-3 py-2 text-xs rounded-full"
                    >
                      전송
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Floating Login Button */}
          {!isLoggedIn && (
            <div className="absolute bottom-20 left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer">
              <span className="text-primary-foreground text-xs font-semibold">로그인</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Version
  return (
    <div className="min-h-screen bg-background flex justify-center p-5">
      <div className="w-full max-w-6xl bg-background border-4 border-primary rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b-2 border-border flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-10 h-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-25 h-8 border-2 border-border bg-background flex items-center justify-center text-xs text-muted-foreground rounded">
              로고
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-semibold mb-1">{debate.title}</div>
            <div className="text-sm text-muted-foreground">{debate.category} · 3분토론</div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500 text-white">진행중</Badge>
            <span className="text-sm font-semibold text-red-600">{debate.timeRemaining} 남음</span>
            <Button variant="outline" onClick={handleShare}>
              공유
            </Button>
            {!isLoggedIn && (
              <Button variant="outline">
                로그인
              </Button>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 grid-rows-4 h-96">
          {/* Participants Section */}
          <div className="col-span-3 row-span-4 border-r-2 border-border bg-background">
            <div className="p-4 border-b-2 border-border bg-muted">
              <h3 className="font-semibold">발언자 목록 ({debate.participants.length}명)</h3>
            </div>
            <ScrollArea className="h-full p-4">
              {debate.participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-3 p-3 mb-2 rounded-lg border-2 transition-all ${
                    participant.current 
                      ? 'bg-muted border-border' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {participant.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{participant.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {participant.position} · {participant.status}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Current Speaker Section */}
          <div className="col-span-6 row-span-2 bg-primary text-primary-foreground flex flex-col justify-center items-center p-6 border-b-2 border-border">
            <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-4 text-2xl font-bold">
              {debate.currentSpeaker.avatar}
            </div>
            <div className="text-xl font-bold mb-2">{debate.currentSpeaker.name}님</div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">1. 발언</Badge>
              <span className="opacity-70">→</span>
              <Badge variant="outline" className="border-primary-foreground/30">2. 논의</Badge>
            </div>
            <div className="w-48 h-5 bg-primary-foreground/20 rounded-full mb-2 overflow-hidden">
              <div className="h-full bg-primary-foreground rounded-full w-3/5"></div>
            </div>
            <div className="opacity-80">{debate.currentSpeaker.timeLeft} 남음</div>
          </div>

          {/* AI Summary Section */}
          <div className="col-span-3 row-span-4 border-l-2 border-border bg-background">
            <div className="p-4 border-b-2 border-border bg-muted">
              <h3 className="font-semibold">AI 발언 요약</h3>
            </div>
            <ScrollArea className="h-full p-4">
              {debate.aiSummaries.map((summary) => (
                <div key={summary.id} className="bg-muted border border-border border-l-4 border-l-primary rounded-lg p-3 mb-3">
                  <div className="text-sm font-semibold text-primary mb-2">{summary.author}</div>
                  <div className="text-sm leading-relaxed text-muted-foreground">{summary.content}</div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Opinion Poll Section */}
          <div className="col-span-6 row-span-1 border-r-2 border-t-2 border-border bg-background flex flex-col justify-center p-4">
            <div className="flex h-6 rounded overflow-hidden border mb-1">
              <div 
                className="bg-green-500 text-white flex items-center justify-center text-sm font-semibold"
                style={{ width: `${debate.poll.pros}%` }}
              >
                찬성 {debate.poll.pros}%
              </div>
              <div 
                className="bg-red-500 text-white flex items-center justify-center text-sm font-semibold"
                style={{ width: `${debate.poll.cons}%` }}
              >
                반대 {debate.poll.cons}%
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>인간 창의성 중요</span>
              <span>AI가 더 창의적</span>
            </div>
          </div>

          {/* Speech Content Section */}
          <div className="col-span-6 row-span-1 border-r-2 border-t-2 border-border bg-background flex flex-col">
            <div className="p-4 border-b-2 border-border bg-muted">
              <h3 className="font-semibold">발언 내용</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              {debate.speeches.map((speech) => (
                <div key={speech.id} className={`bg-muted border rounded-lg p-4 mb-4 ${getFactCheckStyle(speech.factCheck)}`}>
                  <div className="font-semibold mb-2">{speech.author}</div>
                  <div className="leading-relaxed mb-2">{speech.content}</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold px-3 py-1 rounded ${getFactCheckLabelStyle(speech.factCheck)}`}>
                      팩트체킹: {speech.factCheck}
                    </span>
                    <Button variant="outline" size="sm">
                      출처 보기
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
            
            {/* Speech Input */}
            <div className="p-4 border-t-2 border-border bg-muted">
              <div className="flex justify-center mb-4">
                <div className="flex bg-border rounded-full p-1">
                  <button
                    onClick={() => setSpeechMode("text")}
                    className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                      speechMode === "text" 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    채팅 발언
                  </button>
                  <button
                    onClick={() => setSpeechMode("voice")}
                    className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                      speechMode === "voice" 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    음성 발언
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <textarea
                  value={speechInput}
                  onChange={(e) => setSpeechInput(e.target.value)}
                  placeholder="발언자로 지정되면 여기에 발언 내용을 입력할 수 있습니다..."
                  className="flex-1 p-3 border border-border rounded resize-none h-15 bg-background disabled:bg-muted disabled:text-muted-foreground"
                  disabled={!isLoggedIn}
                />
                <Button
                  onClick={handleSendSpeech}
                  disabled={!speechInput.trim() || !isLoggedIn}
                  className="px-6 py-3"
                >
                  발언하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};