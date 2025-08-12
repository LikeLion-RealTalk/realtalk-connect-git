import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');

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
    openSettings
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