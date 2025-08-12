import { useState } from 'react';
import { usePermissions } from './PermissionProvider';

export const usePermissionRequest = () => {
  const {
    microphonePermission,
    clipboardPermission,
    requestMicrophonePermission,
    requestClipboardPermission,
    refreshPermissions
  } = usePermissions();

  const [activeModal, setActiveModal] = useState<{
    type: 'microphone' | 'clipboard';
    isOpen: boolean;
  }>({ type: 'microphone', isOpen: false });

  // 마이크 권한 요청 모달 열기
  const openMicrophonePermissionModal = () => {
    setActiveModal({ type: 'microphone', isOpen: true });
  };

  // 클립보드 권한 요청 모달 열기
  const openClipboardPermissionModal = () => {
    setActiveModal({ type: 'clipboard', isOpen: true });
  };

  // 모달 닫기
  const closePermissionModal = () => {
    setActiveModal(prev => ({ ...prev, isOpen: false }));
  };

  // 마이크 권한 확인 및 요청
  const ensureMicrophonePermission = async (): Promise<boolean> => {
    if (microphonePermission === 'granted') {
      return true;
    }

    if (microphonePermission === 'denied') {
      openMicrophonePermissionModal();
      return false;
    }

    // 권한이 prompt 상태이거나 unknown인 경우 모달 표시
    openMicrophonePermissionModal();
    return false;
  };

  // 클립보드 권한 확인 및 요청
  const ensureClipboardPermission = async (): Promise<boolean> => {
    if (clipboardPermission === 'granted') {
      return true;
    }

    if (clipboardPermission === 'denied') {
      openClipboardPermissionModal();
      return false;
    }

    // 권한이 prompt 상태이거나 unknown인 경우 모달 표시
    openClipboardPermissionModal();
    return false;
  };

  // 마이크 권한 요청 (모달에서 사용)
  const handleRequestMicrophonePermission = async (): Promise<boolean> => {
    const success = await requestMicrophonePermission();
    return success;
  };

  // 클립보드 권한 요청 (모달에서 사용)
  const handleRequestClipboardPermission = async (): Promise<boolean> => {
    const success = await requestClipboardPermission();
    return success;
  };

  // 권한 상태 새로고침 및 모달 닫기
  const handleRetryPermission = async () => {
    await refreshPermissions();
  };

  return {
    // 권한 상태
    microphonePermission,
    clipboardPermission,
    
    // 모달 상태
    activeModal,
    
    // 권한 확인 및 요청
    ensureMicrophonePermission,
    ensureClipboardPermission,
    
    // 모달 제어
    openMicrophonePermissionModal,
    openClipboardPermissionModal,
    closePermissionModal,
    
    // 권한 요청 핸들러
    handleRequestMicrophonePermission,
    handleRequestClipboardPermission,
    handleRetryPermission
  };
};