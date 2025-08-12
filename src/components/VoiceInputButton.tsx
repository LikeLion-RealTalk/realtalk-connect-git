import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { usePermissionRequest } from './usePermissionRequest';
import { toast } from 'sonner';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  onRecordingStateChange,
  disabled = false,
  className = ''
}) => {
  const { ensureMicrophonePermission, microphonePermission } = usePermissionRequest();
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Web Speech API 지원 확인 및 초기화
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'ko-KR';
      
      recognitionInstance.onstart = () => {
        setIsRecording(true);
        onRecordingStateChange?.(true);
        toast.success('음성 인식을 시작합니다');
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
        onRecordingStateChange?.(false);
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('음성 인식 오류:', event.error);
        setIsRecording(false);
        onRecordingStateChange?.(false);
        
        switch (event.error) {
          case 'not-allowed':
            toast.error('마이크 접근이 거부되었습니다');
            break;
          case 'no-speech':
            toast.error('음성이 감지되지 않았습니다');
            break;
          case 'network':
            toast.error('네트워크 오류가 발생했습니다');
            break;
          default:
            toast.error('음성 인식 중 오류가 발생했습니다');
        }
      };
      
      setRecognition(recognitionInstance);
    }
  }, [onTranscript, onRecordingStateChange]);

  const handleVoiceInput = async () => {
    if (!recognition) {
      toast.error('이 브라우저는 음성 인식을 지원하지 않습니다');
      return;
    }

    if (isRecording) {
      // 녹음 중지
      recognition.stop();
      return;
    }

    // 마이크 권한 확인
    const hasPermission = await ensureMicrophonePermission();
    if (!hasPermission) {
      return;
    }

    try {
      // 음성 인식 시작
      recognition.start();
    } catch (error) {
      console.error('음성 인식 시작 실패:', error);
      toast.error('음성 인식을 시작할 수 없습니다');
    }
  };

  const getButtonContent = () => {
    if (isRecording) {
      return {
        icon: <Square className="w-4 h-4" />,
        text: '중지',
        variant: 'destructive' as const
      };
    }

    if (microphonePermission === 'denied') {
      return {
        icon: <MicOff className="w-4 h-4" />,
        text: '마이크 권한 필요',
        variant: 'outline' as const
      };
    }

    return {
      icon: <Mic className="w-4 h-4" />,
      text: '음성 입력',
      variant: 'outline' as const
    };
  };

  const buttonContent = getButtonContent();

  return (
    <Button
      onClick={handleVoiceInput}
      disabled={disabled || !recognition}
      variant={buttonContent.variant}
      size="sm"
      className={`transition-all duration-200 ${isRecording ? 'animate-pulse' : ''} ${className}`}
    >
      {buttonContent.icon}
      <span className="ml-2">{buttonContent.text}</span>
    </Button>
  );
};