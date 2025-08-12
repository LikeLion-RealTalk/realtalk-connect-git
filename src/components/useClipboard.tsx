import { useState } from 'react';
import { usePermissionRequest } from './usePermissionRequest';
import { toast } from 'sonner';

export const useClipboard = () => {
  const { ensureClipboardPermission, clipboardPermission } = usePermissionRequest();
  const [isCopying, setIsCopying] = useState(false);

  const copyToClipboard = async (text: string, successMessage?: string): Promise<boolean> => {
    setIsCopying(true);
    
    try {
      // 1순위: Clipboard API 시도
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          toast.success(successMessage || '클립보드에 복사되었습니다!');
          return true;
        } catch (error) {
          // Clipboard API 실패 시 권한 확인
          const hasPermission = await ensureClipboardPermission();
          if (hasPermission) {
            await navigator.clipboard.writeText(text);
            toast.success(successMessage || '클립보드에 복사되었습니다!');
            return true;
          }
        }
      }

      // 2순위: execCommand fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        toast.success(successMessage || '클립보드에 복사되었습니다!');
        return true;
      } else {
        throw new Error('execCommand 복사 실패');
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      
      // 3순위: 수동 복사 안내
      const copyInstructions = `다음 텍스트를 선택하여 복사해주세요:\n\n${text}`;
      
      // 임시 텍스트 영역 생성하여 텍스트 선택
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '50%';
      textArea.style.top = '50%';
      textArea.style.transform = 'translate(-50%, -50%)';
      textArea.style.width = '300px';
      textArea.style.height = '100px';
      textArea.style.zIndex = '9999';
      textArea.style.backgroundColor = 'white';
      textArea.style.border = '2px solid #1a1760';
      textArea.style.borderRadius = '8px';
      textArea.style.padding = '8px';
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      toast.error('자동 복사에 실패했습니다. 텍스트를 선택하여 수동으로 복사해주세요.', {
        duration: 5000,
        action: {
          label: '닫기',
          onClick: () => {
            document.body.removeChild(textArea);
          }
        }
      });
      
      // 5초 후 자동으로 텍스트 영역 제거
      setTimeout(() => {
        if (document.body.contains(textArea)) {
          document.body.removeChild(textArea);
        }
      }, 5000);
      
      return false;
    } finally {
      setIsCopying(false);
    }
  };

  return {
    copyToClipboard,
    isCopying,
    clipboardPermission
  };
};