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
      console.log('📡 /api/auth/refresh API 호출... (쿠키 자동 전송)');
      const response = await api.post('/api/auth/refresh');

      console.log('📡 refresh API 응답:', response.data);
      const { accessToken } = response.data;
      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        console.log('💾 새 access_token 저장됨');
        return true;
      }
      console.log('❌ 응답에 accessToken이 없음');
      return false;
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error);
      return false;
    }
  };

  // 자동 로그인 로직
  const checkAuthStatus = async () => {
    console.log('🔍 checkAuthStatus 시작');
    
    // 1. 로컬스토리지에 access_token이 있는지 확인
    const accessToken = localStorage.getItem('access_token');
    console.log('💾 로컬스토리지 access_token:', accessToken ? '있음' : '없음');
    
    if (accessToken) {
      // access_token이 있으면 유저 정보 조회
      console.log('🔄 유저 정보 조회 시도...');
      const success = await fetchUserInfo();
      if (success) {
        console.log('✅ 기존 토큰으로 로그인 성공');
        return; // 로그인 성공
      }
      console.log('❌ 기존 토큰으로 로그인 실패');
    }

    // 2. access_token이 없거나 유효하지 않으면 refresh_token으로 재발급
    console.log('🔄 refresh_token으로 토큰 재발급 시도...');
    const refreshSuccess = await refreshAccessToken();
    if (refreshSuccess) {
      // 토큰 갱신 성공 후 유저 정보 조회
      console.log('✅ 토큰 재발급 성공, 유저 정보 조회...');
      await fetchUserInfo();
    } else {
      console.log('❌ 토큰 재발급 실패');
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    console.log('🚀 UserProvider useEffect 실행됨');
    console.log('🍪 현재 모든 쿠키:', document.cookie);
    checkAuthStatus();

    // 페이지가 다시 포커스될 때도 인증 상태 확인
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📱 페이지가 다시 포커스됨, 인증 상태 재확인');
        checkAuthStatus();
      }
    };

    const handleFocus = () => {
      console.log('🔍 윈도우 포커스됨, 인증 상태 재확인');
      checkAuthStatus();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
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

  const logout = async () => {
    try {
      // 서버에 로그아웃 API 호출
      await api.post('/auth/logout');
      console.log('✅ 로그아웃 API 호출 성공');
    } catch (error) {
      console.error('❌ 로그아웃 API 호출 실패:', error);
      // API 호출 실패해도 로컬 로그아웃은 진행
    }
    
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