
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Share2, 
  Mic, 
  MicOff, 
  Send, 
  MessageSquare, 
  Users,
  ChevronRight,
  ChevronLeft,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockDebates } from "@/data/mockDebates";

// 모의 데이터
const mockCurrentDebate = {
  id: "b7b2e571-7939-47cf-a599-cb2f3bdd508cb",
  title: "인공지능(AI)이 인간보다 더 창의적일 수 있는가?",
  category: "기술/과학",
  type: "실시간",
  status: "진행중",
  participants: {
    pros: { count: 12, percentage: 45 },
    cons: { count: 15, percentage: 55 }
  },
  currentSpeaker: {
    id: "speaker1",
    name: "토론자A",
    position: "pros" as const,
    timeLeft: 180,
    totalTime: 300
  },
  messages: [
    { id: "1", user: "청중1", content: "좋은 논점이네요!", timestamp: "14:23", type: "audience" },
    { id: "2", user: "청중2", content: "반대 의견도 듣고 싶어요", timestamp: "14:24", type: "audience" },
  ],
  aiSummary: [
    {
      id: "1",
      speaker: "토론자A",
      position: "pros",
      content: "AI는 패턴 인식과 데이터 분석에 뛰어나지만, 진정한 창의성은 인간의 감정과 경험에서 나온다고 주장했습니다.",
      factCheck: "부분적 오류"
    },
    {
      id: "2", 
      speaker: "토론자B",
      position: "cons",
      content: "AI가 이미 예술, 음악, 문학 분야에서 창의적 작품을 생성하고 있으며, 인간의 편견 없이 새로운 관점을 제시할 수 있다고 반박했습니다.",
      factCheck: "사실"
    }
  ]
};

export const DebateRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentMode, setCurrentMode] = useState<"audience" | "speaker">("audience");
  const [selectedPosition, setSelectedPosition] = useState<"pros" | "cons">("pros");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [audienceMessage, setAudienceMessage] = useState("");
  const [speakerInput, setSpeakerInput] = useState("");
  const [inputMethod, setInputMethod] = useState<"chat" | "voice">("chat");
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(mockCurrentDebate.currentSpeaker.timeLeft);

  // 타이머 로직
  useEffect(() => {
    if (currentMode === "speaker" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentMode, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    const shareUrl = `https://api.realtalks.co.kr/debate/${mockCurrentDebate.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      description: "토론 링크가 복사되었습니다.",
    });
  };

  const handleSendAudienceMessage = () => {
    if (audienceMessage.trim()) {
      console.log("Sending audience message:", audienceMessage);
      setAudienceMessage("");
      toast({
        description: "메시지가 전송되었습니다.",
      });
    }
  };

  const handleSpeakerSubmit = () => {
    if (speakerInput.trim()) {
      console.log("Submitting speaker input:", speakerInput);
      setSpeakerInput("");
      toast({
        description: "발언이 전송되었습니다.",
      });
    }
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Sidebar Toggle */}
      <div 
        className="fixed left-0 top-1/6 bottom-1/3 w-6 bg-primary/20 hover:bg-primary/30 cursor-pointer flex items-center justify-center z-40 transition-colors"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-primary" />
        ) : (
          <ChevronRight className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-background border-r transform transition-transform duration-300 z-30 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">AI 발언 요약</h2>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] p-4">
          <div className="space-y-4">
            {mockCurrentDebate.aiSummary.map((summary) => (
              <div key={summary.id} className="bg-muted/50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={summary.position === "pros" ? "default" : "secondary"} className="text-xs">
                    {summary.speaker}
                  </Badge>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    summary.factCheck === "사실" ? "bg-green-100 text-green-800" :
                    summary.factCheck === "부분적 오류" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {summary.factCheck}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{summary.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        {/* Header */}
        <div className="bg-background border-b px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/browse")}
                className="text-muted-foreground"
              >
                ← 토론 목록
              </Button>
              <div>
                <Badge className="bg-primary text-primary-foreground text-xs mr-2">
                  {mockCurrentDebate.type}토론
                </Badge>
                <span className="text-sm text-muted-foreground">{mockCurrentDebate.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Debate Title & Stats */}
        <div className="bg-muted/50 px-4 py-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {mockCurrentDebate.title}
            </h1>
            
            {/* Position Selection */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex bg-background rounded-lg border-2 border-border overflow-hidden">
                <button
                  onClick={() => setSelectedPosition("pros")}
                  className={`px-6 py-3 font-medium transition-all ${
                    selectedPosition === "pros"
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  인간 창의성 중요 ({mockCurrentDebate.participants.pros.count})
                </button>
                <button
                  onClick={() => setSelectedPosition("cons")}
                  className={`px-6 py-3 font-medium transition-all ${
                    selectedPosition === "cons"
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  AI가 더 창의적 ({mockCurrentDebate.participants.cons.count})
                </button>
              </div>
            </div>

            {/* Participation Stats */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>인간 창의성 중요 {mockCurrentDebate.participants.pros.percentage}%</span>
                <span>AI가 더 창의적 {mockCurrentDebate.participants.cons.percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${mockCurrentDebate.participants.pros.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="px-4 py-3 bg-background border-b">
          <div className="max-w-7xl mx-auto flex justify-center">
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setCurrentMode("audience")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  currentMode === "audience"
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="w-4 h-4" />
                청중 모드
              </button>
              <button
                onClick={() => setCurrentMode("speaker")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  currentMode === "speaker"
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mic className="w-4 h-4" />
                발언자 모드
              </button>
            </div>
          </div>
        </div>

        {/* Main Debate Area */}
        <div className="flex-1 px-4 py-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Current Speaker & Speech Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Current Speaker Timer */}
              <div className="bg-background border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {mockCurrentDebate.currentSpeaker.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{mockCurrentDebate.currentSpeaker.name}</div>
                      <Badge variant={mockCurrentDebate.currentSpeaker.position === "pros" ? "default" : "secondary"} className="text-xs">
                        {mockCurrentDebate.currentSpeaker.position === "pros" ? "인간 창의성 중요" : "AI가 더 창의적"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      남은 시간
                    </div>
                  </div>
                </div>
                <Progress 
                  value={(timeLeft / mockCurrentDebate.currentSpeaker.totalTime) * 100} 
                  className="h-2"
                />
              </div>

              {/* Speech Content Area */}
              <div 
                className="bg-background border rounded-lg p-6"
                style={{ minHeight: "calc(120px * 1.8)" }}
              >
                <h3 className="font-semibold mb-4">현재 발언 내용</h3>
                <div className="text-muted-foreground">
                  <p className="leading-relaxed">
                    현재 토론자가 발언 중입니다. 실시간으로 발언 내용이 여기에 표시됩니다.
                    AI 기술의 발전과 함께 창의성의 개념도 변화하고 있습니다...
                  </p>
                </div>
              </div>

              {/* Speaker Input Area - Only visible in speaker mode */}
              {currentMode === "speaker" && (
                <div className="bg-background border rounded-lg p-4 min-h-[180px]">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => setInputMethod("chat")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        inputMethod === "chat"
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      채팅 발언
                    </button>
                    <button
                      onClick={() => setInputMethod("voice")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        inputMethod === "voice"
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      음성 발언
                    </button>
                  </div>

                  {inputMethod === "chat" ? (
                    <div className="space-y-3">
                      <Textarea
                        value={speakerInput}
                        onChange={(e) => setSpeakerInput(e.target.value)}
                        placeholder="발언 내용을 입력하세요..."
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleSpeakerSubmit} disabled={!speakerInput.trim()}>
                          <Send className="w-4 h-4 mr-2" />
                          발언하기
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Button
                        onClick={handleVoiceToggle}
                        size="lg"
                        variant={isRecording ? "destructive" : "default"}
                        className="rounded-full w-20 h-20"
                      >
                        {isRecording ? (
                          <MicOff className="w-8 h-8" />
                        ) : (
                          <Mic className="w-8 h-8" />
                        )}
                      </Button>
                      <p className="mt-4 text-sm text-muted-foreground">
                        {isRecording ? "녹음 중... 클릭하여 완료" : "클릭하여 음성 녹음 시작"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="bg-background border rounded-lg flex flex-col h-[600px]">
              <div className="p-4 border-b">
                <h3 className="font-semibold">실시간 채팅</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {mockCurrentDebate.messages.map((message) => (
                    <div key={message.id} className="flex gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.user}</span>
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input - Only visible in audience mode */}
              {currentMode === "audience" && (
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={audienceMessage}
                      onChange={(e) => setAudienceMessage(e.target.value)}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 h-10 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendAudienceMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendAudienceMessage}
                      disabled={!audienceMessage.trim()}
                      size="sm"
                      className="h-10 px-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
