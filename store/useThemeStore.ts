import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/types';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        
        // Update DOM
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('light', newTheme === 'light');
        }
      },
      setTheme: (theme: Theme) => {
        set({ theme });
        
        // Update DOM
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('light', theme === 'light');
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

