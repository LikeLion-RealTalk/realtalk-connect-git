
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Statement {
  author: string;
  time: string;
  content: string;
  likes: number;
  dislikes: number;
  factCheck: string | null;
}

interface ChatMessage {
  author: string;
  time: string;
  content: string;
}

export default function DebateRoom() {
  const [proStatements, setProStatements] = useState<Statement[]>([
    { author: "User1", time: "10:00", content: "인간 창의성은 감성에서 비롯됩니다.", likes: 10, dislikes: 2, factCheck: "사실" },
    { author: "User2", time: "10:05", content: "AI는 모방만 할 뿐 새로운 것을 만들 수 없습니다.", likes: 5, dislikes: 1, factCheck: "부분적 오류" },
  ]);
  const [conStatements, setConStatements] = useState<Statement[]>([
    { author: "User3", time: "10:10", content: "AI는 데이터를 기반으로 창의적인 결과물을 낼 수 있습니다.", likes: 7, dislikes: 3, factCheck: "사실" },
    { author: "User4", time: "10:15", content: "AI의 창의성은 인간의 편견에서 자유롭습니다.", likes: 3, dislikes: 0, factCheck: "불분명" },
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { author: "Audience1", time: "10:20", content: "흥미로운 토론이네요!" },
    { author: "Audience2", time: "10:25", content: "AI의 미래는 어떻게 될까요?" },
  ]);
  const [proInput, setProInput] = useState("");
  const [conInput, setConInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [audienceCount, setAudienceCount] = useState(50);
  const [debateTitle, setDebateTitle] = useState("인간의 창의성 vs AI의 창의성");
  const [category, setCategory] = useState("기술");
  const [type, setType] = useState("찬반");
  const [userMode, setUserMode] = useState<"debater" | "audience">("debater");
  const [userPosition, setUserPosition] = useState<"pros" | "cons">("pros");
  const [remainingTime, setRemainingTime] = useState({
    minutes: 10,
    seconds: 0,
  });

  const handleProSubmit = () => {
    if (proInput.trim() !== "") {
      const newStatement: Statement = {
        author: "나",
        time: new Date().toLocaleTimeString(),
        content: proInput,
        likes: 0,
        dislikes: 0,
        factCheck: null,
      };
      setProStatements([...proStatements, newStatement]);
      setProInput("");
    }
  };

  const handleConSubmit = () => {
    if (conInput.trim() !== "") {
      const newStatement: Statement = {
        author: "나",
        time: new Date().toLocaleTimeString(),
        content: conInput,
        likes: 0,
        dislikes: 0,
        factCheck: null,
      };
      setConStatements([...conStatements, newStatement]);
      setConInput("");
    }
  };

  const handleChatSubmit = () => {
    if (chatInput.trim() !== "") {
      const newMessage: ChatMessage = {
        author: "나",
        time: new Date().toLocaleTimeString(),
        content: chatInput,
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput("");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-background border-b border-border p-4 flex justify-between items-center">
        <div>
          <Button variant="outline" size="sm">
            나가기
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary text-primary-foreground text-xs">
            {type}토론
          </Badge>
          <span className="text-sm text-muted-foreground">{category}</span>
        </div>
        <div>
          <Button variant="outline" size="sm">
            신고
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-6xl mx-auto">
            {/* Debate Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">{debateTitle}</h2>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              남은 시간: {remainingTime.minutes}분 {remainingTime.seconds}초
            </div>

            {/* Debate Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side - Pro Position */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-4">
                  인간 창의성 중요{" "}
                  <Badge className="ml-2">
                    {userMode === "debater" && userPosition === "pros"
                      ? "Debater"
                      : "Audience"}
                  </Badge>
                </h3>
                
                {/* Pro Statements */}
                <div className="space-y-4 mb-4 h-[400px] overflow-y-auto">
                  {proStatements.map((statement, index) => (
                    <div key={index} className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-foreground">{statement.author}</span>
                        <span className="text-xs text-muted-foreground">{statement.time}</span>
                      </div>
                      <p className="text-foreground mb-2">{statement.content}</p>
                      <div className="text-xs text-muted-foreground">
                        <div>👍 {statement.likes} 👎 {statement.dislikes}</div>
                        {statement.factCheck && (
                          <div className="mt-1">
                            {statement.factCheck}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input for Pro Side */}
                {userMode === "debater" && userPosition === "pros" && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={proInput}
                      onChange={(e) => setProInput(e.target.value)}
                      placeholder="의견을 입력하세요..."
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
                      onKeyPress={(e) => e.key === "Enter" && handleProSubmit()}
                    />
                    <Button onClick={handleProSubmit} size="sm">
                      전송
                    </Button>
                  </div>
                )}
              </div>

              {/* Center - AI Summary */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-center mb-4">AI 발언 요약</h3>
                <div className="h-[250px] overflow-y-auto space-y-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-medium mb-2">찬성 측 주요 논점</h4>
                    <ul className="text-sm space-y-1">
                      <li>• 인간의 감정과 경험이 창의성의 핵심</li>
                      <li>• AI는 기존 데이터를 조합할 뿐</li>
                      <li>• 진정한 혁신은 인간만이 가능</li>
                    </ul>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-medium mb-2">반대 측 주요 논점</h4>
                    <ul className="text-sm space-y-1">
                      <li>• AI는 방대한 데이터로 새로운 조합 생성</li>
                      <li>• 객관적이고 편견 없는 창의성</li>
                      <li>• 속도와 효율성에서 인간을 앞섬</li>
                    </ul>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-medium mb-2">핵심 쟁점</h4>
                    <p className="text-sm">창의성의 정의와 평가 기준에 대한 근본적 차이</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Con Position */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-4">
                  AI가 더 창의적{" "}
                  <Badge className="ml-2">
                    {userMode === "debater" && userPosition === "cons"
                      ? "Debater"
                      : "Audience"}
                  </Badge>
                </h3>
                
                {/* Con Statements */}
                <div className="space-y-4 mb-4 h-[400px] overflow-y-auto">
                  {conStatements.map((statement, index) => (
                    <div key={index} className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-foreground">{statement.author}</span>
                        <span className="text-xs text-muted-foreground">{statement.time}</span>
                      </div>
                      <p className="text-foreground mb-2">{statement.content}</p>
                      <div className="text-xs text-muted-foreground">
                        <div>👍 {statement.likes} 👎 {statement.dislikes}</div>
                        {statement.factCheck && (
                          <div className="mt-1">
                            {statement.factCheck}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input for Con Side */}
                {userMode === "debater" && userPosition === "cons" && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={conInput}
                      onChange={(e) => setConInput(e.target.value)}
                      placeholder="의견을 입력하세요..."
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
                      onKeyPress={(e) => e.key === "Enter" && handleConSubmit()}
                    />
                    <Button onClick={handleConSubmit} size="sm">
                      전송
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Audience Chat */}
        <div className="w-full lg:w-80 bg-card border-l border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">청중 채팅</h3>
            <div className="text-sm text-muted-foreground">
              참여자 {audienceCount}명
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto mb-4 space-y-2">
            {chatMessages.map((message, index) => (
              <div key={index} className="bg-muted p-2 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{message.author}</span>
                  <span className="text-xs text-muted-foreground">{message.time}</span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="채팅을 입력하세요..."
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-sm h-9"
              onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
            />
            <Button onClick={handleChatSubmit} size="sm" className="h-9">
              전송
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
