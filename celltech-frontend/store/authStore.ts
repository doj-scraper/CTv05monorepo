import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  isAdmin?: boolean;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true });
    try {
      // TODO: Implement actual API call
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        company: 'Demo Company'
      };
      set({ user: mockUser, isLoggedIn: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, isLoggedIn: false });
  },

  register: async (email: string, _password: string, name: string) => {
    set({ isLoading: true });
    try {
      // TODO: Implement actual API call
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name
      };
      set({ user: newUser, isLoggedIn: true });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user: User | null) => {
    set({ user, isLoggedIn: user !== null });
  }
}));
