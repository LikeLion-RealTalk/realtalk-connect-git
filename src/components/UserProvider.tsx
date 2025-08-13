import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getCookie, deleteCookie } from '../lib/cookies';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'kakao' | 'google';
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  nickname: string;
  setNickname: (nickname: string) => void;
  login: (provider: 'kakao' | 'google') => void;
  logout: () => void;
  openProfile: () => void;
  openSettings: () => void;
  checkAuthStatus: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');

  // 로그인 상태 체크 (refresh_token 쿠키 확인)
  const checkAuthStatus = () => {
    const refreshToken = getCookie('refresh_token');
    if (refreshToken) {
      // refresh_token이 있으면 로그인 상태로 간주
      // TODO: 실제로는 여기서 access_token 발급 API를 호출해야 함
      console.log('refresh_token 발견:', refreshToken);
      
      // 임시로 Mock 사용자 설정 (나중에 실제 사용자 정보로 교체)
      const mockUser: User = {
        id: 'authenticated_user',
        name: '로그인된 사용자',
        email: 'user@example.com',
        provider: 'kakao'
      };
      setUser(mockUser);
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (provider: 'kakao' | 'google') => {
    // Mock 사용자 데이터 생성
    const mockUser: User = {
      id: `${provider}_${Date.now()}`,
      name: provider === 'kakao' ? '김토론' : 'John Doe',
      email: provider === 'kakao' ? 'user@kakao.com' : 'user@gmail.com',
      avatar: provider === 'kakao' 
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      provider
    };
    setUser(mockUser);
  };

  const logout = () => {
    // 로그아웃 시 refresh_token 쿠키 삭제
    deleteCookie('refresh_token');
    // 로컬스토리지의 access_token도 삭제
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const openProfile = () => {
    // TODO: 프로필 페이지 구현
    console.log('프로필 페이지 열기');
  };

  const openSettings = () => {
    // TODO: 설정 페이지 구현
    console.log('설정 페이지 열기');
  };

  const value: UserContextType = {
    user,
    isLoggedIn: !!user,
    nickname,
    setNickname,
    login,
    logout,
    openProfile,
    openSettings,
    checkAuthStatus
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}