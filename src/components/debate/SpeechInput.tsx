import { useState, useEffect, useRef } from 'react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Mic, MicOff, Send, Volume2, Shield, Settings, X } from 'lucide-react';
import { SpeechInputType, SPEECH_INPUT_TYPES } from '../../types/discussion';

interface SpeechInputProps {
  onSendSpeech: (content: string, type: SpeechInputType) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  isActive?: boolean; // 발언 차례인지 여부
}

export function SpeechInput({
  onSendSpeech,
  isRecording,
  onToggleRecording,
  isActive = true
}: SpeechInputProps) {
  const [inputMode, setInputMode] = useState<SpeechInputType>(SPEECH_INPUT_TYPES[0]); // 'voice'
  const [textInput, setTextInput] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [speechText, setSpeechText] = useState('');
  const [interimSpeechText, setInterimSpeechText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showConfirmSend, setShowConfirmSend] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [micPermission, setMicPermission] = useState<'unknown' | 'requested' | 'granted' | 'denied'>('unknown');
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Web Speech API 지원 여부 확인 및 초기화
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onstart = () => {
        setIsListening(true);
        setMicPermission('granted');
        console.log('음성 인식 시작');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // 최종 결과와 임시 결과 분리하여 업데이트
        if (finalTranscript) {
          setSpeechText(prev => prev + finalTranscript);
        }
        setInterimSpeechText(interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('음성 인식 오류:', event.error);
        setIsListening(false);
        
        // 권한 관련 오류 처리
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setMicPermission('denied');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('음성 인식 종료');
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
      console.warn('브라우저에서 음성 인식을 지원하지 않습니다.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // 마이크 권한 체크
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (permissionStatus.state === 'granted') {
            setMicPermission('granted');
          } else if (permissionStatus.state === 'denied') {
            setMicPermission('denied');
          }
          
          // 권한 상태 변경 감지
          permissionStatus.onchange = () => {
            setMicPermission(permissionStatus.state === 'granted' ? 'granted' : 
                           permissionStatus.state === 'denied' ? 'denied' : 'unknown');
          };
        } catch (error) {
          console.log('마이크 권한 확인 불가:', error);
        }
      }
    };

    checkMicrophonePermission();
  }, []);

  // 녹음 시간 카운터
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // 녹음 상태 변경 시 음성 인식 시작/종료
  useEffect(() => {
    if (isRecording && speechSupported && recognitionRef.current && !isListening) {
      setSpeechText('');
      setInterimSpeechText('');
      setShowConfirmSend(false);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('음성 인식 시작 오류:', error);
      }
    } else if (!isRecording && isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('음성 인식 종료 오류:', error);
      }
    }
  }, [isRecording, speechSupported, isListening]);

  // 음성 인식 완료 후 발언 확인 표시 및 카운트다운
  useEffect(() => {
    if (!isRecording && !isListening && speechText.trim()) {
      setShowConfirmSend(true);
      setCountdown(3);
      
      // 카운트다운 시작
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleSendVoice();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };
    }
  }, [isRecording, isListening, speechText]);

  const handleSendVoice = () => {
    if (speechText.trim()) {
      onSendSpeech(speechText.trim(), SPEECH_INPUT_TYPES[0]); // 'voice'
      setSpeechText('');
      setInterimSpeechText('');
      setShowConfirmSend(false);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    }
  };

  const handleCancelVoice = () => {
    setSpeechText('');
    setInterimSpeechText('');
    setShowConfirmSend(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };

  const handleSendText = () => {
    if (textInput.trim()) {
      onSendSpeech(textInput, SPEECH_INPUT_TYPES[1]); // 'text'
      setTextInput('');
    }
  };

  const handleToggleRecording = () => {
    if (!speechSupported && inputMode === SPEECH_INPUT_TYPES[0]) {
      alert('브라우저에서 음성 인식을 지원하지 않습니다. 텍스트 모드를 사용해주세요.');
      return;
    }

    // 마이크 권한이 거부된 경우
    if (micPermission === 'denied') {
      setShowPermissionGuide(true);
      return;
    }

    // 마이크 권한이 아직 요청되지 않은 경우 안내 표시
    if (micPermission === 'unknown') {
      setShowPermissionGuide(true);
      return;
    }

    setMicPermission('requested');
    onToggleRecording();
  };

  const handleRequestPermission = async () => {
    setShowPermissionGuide(false);
    setMicPermission('requested');
    
    // 음성 인식 시작을 통해 마이크 권한 요청
    onToggleRecording();
  };

  const handleClosePermissionGuide = () => {
    setShowPermissionGuide(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-surface-variant/30 border-t border-divider">
      <div className="p-4 border-b border-divider flex items-center justify-between bg-surface elevation-1">
        <h4 className="flex items-center gap-2 text-on-surface font-medium">
          <Mic className="h-5 w-5 text-primary" />
          발언하기
        </h4>
        <div className="flex items-center space-x-2">
          <Label htmlFor="speech-mode" className="text-sm text-on-surface-variant">
            {inputMode === SPEECH_INPUT_TYPES[0] ? '음성' : '채팅'}
          </Label>
          <Switch
            id="speech-mode"
            checked={inputMode === SPEECH_INPUT_TYPES[1]}
            onCheckedChange={(checked) => setInputMode(checked ? SPEECH_INPUT_TYPES[1] : SPEECH_INPUT_TYPES[0])}
          />
        </div>
      </div>
      <div className="p-4 space-y-4 bg-background">
        {inputMode === SPEECH_INPUT_TYPES[0] ? ( // 'voice'
          /* 음성 발언 모드 */
          <div className="text-center space-y-4">
            <Button
              size="lg"
              variant={
                isRecording ? 'destructive' : 
                micPermission === 'denied' ? 'outline' : 
                'default'
              }
              className={`w-24 h-24 rounded-full ${
                isRecording ? 'animate-pulse' : ''
              } ${
                micPermission === 'denied' ? 'opacity-50' : ''
              }`}
              onClick={handleToggleRecording}
              disabled={!isActive || !speechSupported}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : micPermission === 'denied' ? (
                <Shield className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {!speechSupported
                  ? '브라우저에서 음성 인식을 지원하지 않습니다'
                  : micPermission === 'denied'
                  ? '마이크 권한이 필요합니다. 설정에서 허용해주세요.'
                  : !isActive 
                  ? '발언 차례를 기다려주세요'
                  : isRecording 
                  ? (isListening ? '음성을 인식하고 있습니다...' : '마이크 준비 중...') 
                  : micPermission === 'granted'
                  ? '버튼을 눌러 발언을 시작하세요'
                  : '마이크 권한을 허용하고 발언을 시작하세요'
                }
              </p>
              {isRecording && (
                <div className="space-y-2">
                  <p className="text-lg font-mono">
                    {formatTime(recordingTime)}
                  </p>
                  {isListening && (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Volume2 className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">음성 인식 중</span>
                    </div>
                  )}
                  {micPermission === 'requested' && !isListening && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                      <span className="text-sm">마이크 권한 요청 중...</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* 마이크 권한 상태 표시 */}
              {!isRecording && micPermission === 'granted' && (
                <div className="mt-2">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    <span>마이크 준비됨</span>
                  </div>
                </div>
              )}
              {(speechText || interimSpeechText) && (
                <div className="mt-4 p-3 bg-muted rounded-lg text-left">
                  <p className="text-sm text-muted-foreground mb-1">인식된 음성:</p>
                  <p className="text-sm mb-3">
                    <span className="text-foreground">{speechText}</span>
                    {interimSpeechText && (
                      <span className="text-muted-foreground italic">{interimSpeechText}</span>
                    )}
                  </p>
                  {showConfirmSend && (
                    <div className="space-y-2">
                      <p className="text-xs text-center text-muted-foreground">
                        {countdown}초 후 자동으로 발언됩니다
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" onClick={handleSendVoice} className="flex items-center gap-1">
                          <Send className="h-3 w-3" />
                          지금 발언하기
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelVoice}>
                          취소
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* 마이크 권한이 거부된 경우 안내 */}
              {micPermission === 'denied' && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">마이크 권한이 차단되었습니다</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    음성 발언을 위해 브라우저 설정에서 마이크 권한을 허용해주세요.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setInputMode(SPEECH_INPUT_TYPES[1])}
                    className="text-xs"
                  >
                    텍스트 모드로 전환
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 채팅 발언 모드 */
          <div className="flex gap-2">
            <Input
              placeholder={!isActive ? "발언 차례를 기다려주세요..." : "발언 내용을 입력하세요..."}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
              className="flex-1"
              disabled={!isActive}
            />
            <Button onClick={handleSendText} disabled={!textInput.trim() || !isActive}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* 마이크 권한 요청 안내 모달 */}
        {showPermissionGuide && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-md w-full p-6 elevation-8 animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">마이크 권한 필요</h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClosePermissionGuide}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  음성 발언을 위해 마이크 접근 권한이 필요합니다. 
                  브라우저에서 마이크 권한을 허용해주세요.
                </p>
                
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2 text-primary">권한 허용 방법:</h4>
                  <ol className="text-xs text-muted-foreground space-y-1">
                    <li>1. "허용하고 시작" 버튼을 클릭하세요</li>
                    <li>2. 브라우저에서 마이크 권한 요청이 나타납니다</li>
                    <li>3. "허용" 또는 "Allow"를 선택하세요</li>
                  </ol>
                </div>

                {micPermission === 'denied' && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">권한이 차단된 경우</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• 주소창 왼쪽의 자물쇠 아이콘을 클릭</p>
                      <p>• 마이크 권한을 "허용"으로 변경</p>
                      <p>• 페이지를 새로고침하세요</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleRequestPermission}
                    className="flex-1 flex items-center gap-1"
                    disabled={micPermission === 'denied'}
                  >
                    <Mic className="h-4 w-4" />
                    {micPermission === 'denied' ? '권한 설정 필요' : '허용하고 시작'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPermissionGuide(false);
                      setInputMode(SPEECH_INPUT_TYPES[1]); // 텍스트 모드로 전환
                    }}
                    className="flex items-center gap-1"
                  >
                    텍스트 모드
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}