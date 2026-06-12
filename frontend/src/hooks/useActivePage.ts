import { createContext, useContext } from 'react';
import type { PageId, BackgroundSettings } from '@/types';
import type { UserProfile } from '@/api/client';

interface AppContextType {
  // 页面导航
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  activeCharacterId: string | null;
  setActiveCharacterId: (id: string | null) => void;

  // 侧边栏折叠
  wikiExpanded: boolean;
  setWikiExpanded: (expanded: boolean) => void;
  gameIntroExpanded: boolean;
  setGameIntroExpanded: (expanded: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // 登录与用户
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;

  // 背景设置
  bgSettings: BackgroundSettings;
  setBgSettings: (s: BackgroundSettings) => void;

  // 导航栏收缩
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useActivePage() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useActivePage must be used within AppContext.Provider');
  return ctx;
}
