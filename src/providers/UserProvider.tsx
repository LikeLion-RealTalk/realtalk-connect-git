import { createContext, useContext, useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  guestNickname: string;
  setGuestNickname: (nickname: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [guestNickname, setGuestNickname] = useState<string>("");

  const login = (user: User) => {
    sessionStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    setGuestNickname(""); // 로그아웃 시 guestNickname도 초기화
  };

  return (
    <UserContext.Provider
        value={{ user, login, logout, guestNickname, setGuestNickname }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

