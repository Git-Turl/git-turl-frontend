import { create } from 'zustand';

type User = {
  id: number;
  nickname: string | null;
  profileImage: string | null;
  githubUsername: string;
  email: string | null;
};

type AuthStore = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  // 토큰만 저장 (OAuth 콜백에서 사용)
  setToken: (token) => {
    localStorage.setItem('accessToken', token);
    set({ token, isAuthenticated: true });
  },

  // 유저 정보 저장
  setUser: (user) => set({ user }),

  // 로그아웃
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
