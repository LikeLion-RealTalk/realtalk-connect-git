import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Mic, Clipboard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { PermissionState } from '../PermissionProvider';

interface PermissionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissionType: 'microphone' | 'clipboard';
  permissionState: PermissionState;
  onRequestPermission: () => Promise<boolean>;
  onRetry?: () => void;
}

export const PermissionRequestModal: React.FC<PermissionRequestModalProps> = ({
  isOpen,
  onClose,
  permissionType,
  permissionState,
  onRequestPermission,
  onRetry
}) => {
  const [isRequesting, setIsRequesting] = React.useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const success = await onRequestPermission();
      if (success) {
        setTimeout(onClose, 1500); // 성공 메시지를 보여준 후 닫기
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const getPermissionInfo = () => {
    if (permissionType === 'microphone') {
      return {
        icon: <Mic className="w-12 h-12 text-primary" />,
        title: '마이크 권한 필요',
        description: '음성 발언 기능을 사용하려면 마이크 접근 권한이 필요합니다.',
        usage: '실시간 토론에서 음성으로 발언할 수 있습니다.',
        browserSettings: '브라우저 주소창 옆의 마이크 아이콘을 클릭하여 권한을 허용해주세요.'
      };
    } else {
      return {
        icon: <Clipboard className="w-12 h-12 text-primary" />,
        title: '클립보드 권한 필요',
        description: '토론방 링크 복사 기능을 사용하려면 클립보드 접근 권한이 필요합니다.',
        usage: '토론방 링크를 쉽게 복사하여 다른 사람들과 공유할 수 있습니다.',
        browserSettings: '브라우저 주소창 옆의 클립보드 아이콘을 클릭하여 권한을 허용해주세요.'
      };
    }
  };

  const getStatusIcon = () => {
    switch (permissionState) {
      case 'granted':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'denied':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'prompt':
      case 'unknown':
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (permissionState) {
      case 'granted':
        return '권한이 허용되었습니다!';
      case 'denied':
        return '권한이 거부되었습니다.';
      case 'prompt':
        return '권한 요청 대기 중입니다.';
      case 'unknown':
      default:
        return '권한 상태를 확인 중입니다.';
    }
  };

  const info = getPermissionInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-2xl border-2 shadow-xl sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {info.icon}
          </div>
          <DialogTitle className="text-xl">{info.title}</DialogTitle>
          <DialogDescription className="text-center space-y-3">
            <p>{info.description}</p>
            <div className="bg-surface-variant rounded-lg p-4 text-left">
              <h4 className="font-medium text-primary mb-2">사용 용도:</h4>
              <p className="text-sm">{info.usage}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* 권한 상태 표시 */}
          <div className="flex items-center justify-center space-x-2 p-3 bg-surface-variant rounded-lg">
            {getStatusIcon()}
            <span className="font-medium">{getStatusMessage()}</span>
          </div>

          {/* 권한 상태에 따른 액션 버튼들 */}
          <div className="flex flex-col space-y-2">
            {permissionState === 'prompt' || permissionState === 'unknown' ? (
              <Button 
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="w-full"
              >
                {isRequesting ? '권한 요청 중...' : '권한 허용하기'}
              </Button>
            ) : permissionState === 'denied' ? (
              <>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    수동으로 권한을 허용해주세요
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {info.browserSettings}
                  </p>
                </div>
                {onRetry && (
                  <Button onClick={onRetry} variant="outline" className="w-full">
                    권한 상태 다시 확인
                  </Button>
                )}
              </>
            ) : permissionState === 'granted' ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  권한이 성공적으로 허용되었습니다!
                </p>
              </div>
            ) : null}

            <Button onClick={onClose} variant="outline" className="w-full">
              {permissionState === 'granted' ? '확인' : '나중에 하기'}
            </Button>
          </div>

          {/* 안내 메시지 */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>• 권한은 언제든지 브라우저 설정에서 변경할 수 있습니다.</p>
            <p>• 권한을 허용하지 않아도 다른 기능은 정상적으로 사용 가능합니다.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};