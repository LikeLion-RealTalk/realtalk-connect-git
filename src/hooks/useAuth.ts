// Mock user state for development/testing
export interface User {
  name: string;
  email: string;
  avatar?: string;
}

// This would typically come from a global state management solution
let mockIsLoggedIn = false;
let mockUser: User = {
  name: "홍길동", 
  email: "user@example.com"
};

export const useAuth = () => {
  return {
    isLoggedIn: mockIsLoggedIn,
    user: mockUser,
    login: (user: User) => {
      mockIsLoggedIn = true;
      mockUser = user;
    },
    logout: () => {
      mockIsLoggedIn = false;
    }
  };
};