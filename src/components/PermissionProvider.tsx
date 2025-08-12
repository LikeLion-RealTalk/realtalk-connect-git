import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PermissionState = 'denied' | 'granted' | 'prompt' | 'unknown';

interface PermissionContextType {
  // 마이크 권한
  microphonePermission: PermissionState;
  requestMicrophonePermission: () => Promise<boolean>;
  
  // 클립보드 권한
  clipboardPermission: PermissionState;
  requestClipboardPermission: () => Promise<boolean>;
  
  // 권한 상태 새로고침
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [microphonePermission, setMicrophonePermission] = useState<PermissionState>('unknown');
  const [clipboardPermission, setClipboardPermission] = useState<PermissionState>('unknown');

  // 마이크 권한 확인
  const checkMicrophonePermission = async (): Promise<PermissionState> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return 'denied';
      }

      // Permissions API가 지원되는 경우
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          return result.state as PermissionState;
        } catch (error) {
          // Permissions API 실패 시 실제 미디어 접근 시도
        }
      }

      // 실제 미디어 접근을 통한 권한 확인
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return 'granted';
      } catch (error) {
        const err = error as DOMException;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          return 'denied';
        }
        return 'prompt';
      }
    } catch (error) {
      console.error('마이크 권한 확인 실패:', error);
      return 'unknown';
    }
  };

  // 클립보드 권한 확인
  const checkClipboardPermission = async (): Promise<PermissionState> => {
    try {
      if (!navigator.clipboard) {
        // Clipboard API가 지원되지 않는 경우 (HTTPS가 아니거나 구형 브라우저)
        return 'denied';
      }

      // Permissions API가 지원되는 경우
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
          return result.state as PermissionState;
        } catch (error) {
          // clipboard-write 권한이 지원되지 않는 경우
        }
      }

      // 실제 클립보드 접근을 통한 권한 확인
      try {
        await navigator.clipboard.writeText('');
        return 'granted';
      } catch (error) {
        const err = error as DOMException;
        if (err.name === 'NotAllowedError') {
          return 'denied';
        }
        return 'prompt';
      }
    } catch (error) {
      console.error('클립보드 권한 확인 실패:', error);
      return 'unknown';
    }
  };

  // 마이크 권한 요청
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicrophonePermission('granted');
      return true;
    } catch (error) {
      const err = error as DOMException;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicrophonePermission('denied');
      }
      console.error('마이크 권한 요청 실패:', error);
      return false;
    }
  };

  // 클립보드 권한 요청
  const requestClipboardPermission = async (): Promise<boolean> => {
    try {
      if (!navigator.clipboard) {
        setClipboardPermission('denied');
        return false;
      }

      await navigator.clipboard.writeText('');
      setClipboardPermission('granted');
      return true;
    } catch (error) {
      const err = error as DOMException;
      if (err.name === 'NotAllowedError') {
        setClipboardPermission('denied');
      }
      console.error('클립보드 권한 요청 실패:', error);
      return false;
    }
  };

  // 모든 권한 상태 새로고침
  const refreshPermissions = async () => {
    const [micState, clipState] = await Promise.all([
      checkMicrophonePermission(),
      checkClipboardPermission()
    ]);
    
    setMicrophonePermission(micState);
    setClipboardPermission(clipState);
  };

  // 컴포넌트 마운트 시 권한 상태 확인
  useEffect(() => {
    refreshPermissions();
  }, []);

  // Permissions API 변경 감지 (지원되는 경우)
  useEffect(() => {
    if ('permissions' in navigator) {
      const handlePermissionChange = () => {
        refreshPermissions();
      };

      // 마이크 권한 변경 감지
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(result => {
          result.addEventListener('change', handlePermissionChange);
          return result;
        })
        .catch(() => {}); // 지원되지 않는 경우 무시

      // 클립보드 권한 변경 감지
      navigator.permissions.query({ name: 'clipboard-write' as PermissionName })
        .then(result => {
          result.addEventListener('change', handlePermissionChange);
          return result;
        })
        .catch(() => {}); // 지원되지 않는 경우 무시
    }
  }, []);

  const value: PermissionContextType = {
    microphonePermission,
    requestMicrophonePermission,
    clipboardPermission,
    requestClipboardPermission,
    refreshPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};