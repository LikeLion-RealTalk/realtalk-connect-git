import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getCookie, deleteCookie } from '../lib/cookies';
import api from '../lib/api';

interface User {
  id: number;
  username: string;
  role: string;
  provider: string;
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

  // 유저 정보 조회 API
  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/api/auth/me');
      const userData: User = response.data;
      setUser(userData);
      return true;
    } catch (error) {
      console.error('유저 정보 조회 실패:', error);
      return false;
    }
  };

  // refresh_token으로 access_token 발급
  const refreshAccessToken = async () => {
    try {
      const refreshToken = getCookie('refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await api.post('/api/auth/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      const { accessToken } = response.data;
      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      return false;
    }
  };

  // 자동 로그인 로직
  const checkAuthStatus = async () => {
    // 1. 로컬스토리지에 access_token이 있는지 확인
    const accessToken = localStorage.getItem('access_token');
    
    if (accessToken) {
      // access_token이 있으면 유저 정보 조회
      const success = await fetchUserInfo();
      if (success) {
        return; // 로그인 성공
      }
    }

    // 2. access_token이 없거나 유효하지 않으면 refresh_token으로 재발급
    const refreshSuccess = await refreshAccessToken();
    if (refreshSuccess) {
      // 토큰 갱신 성공 후 유저 정보 조회
      await fetchUserInfo();
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
    localStorage.removeItem('access_token');
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