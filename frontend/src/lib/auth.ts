import Cookies from "js-cookie";
import { create } from "zustand";

interface User {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
  is_email_verified: boolean;
  language: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    set({ user: null });
  },
}));

export function saveTokens(accessToken: string, refreshToken: string) {
  Cookies.set("access_token", accessToken, { expires: 1 });
  Cookies.set("refresh_token", refreshToken, { expires: 30 });
}

export function getAccessToken() {
  return Cookies.get("access_token");
}
