import { useState, useCallback, useEffect } from 'react';
import { AppContext } from '@/hooks/useActivePage';
import { Sidebar } from '@/components/Sidebar';
import { MobileSidebar } from '@/components/MobileSidebar';
import { ContentArea } from '@/components/ContentArea';
import type { PageId, BackgroundSettings } from '@/types';
import type { UserProfile } from '@/api/client';
import { getProfile, clearToken } from '@/api/client';
import './App.css';

function loadBgSettings(): BackgroundSettings {
  try {
    const saved = localStorage.getItem('bgSettings');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { mode: 'solid', imageUrl: '', opacity: 0.15 };
}

function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [user, setUser] = useState<UserProfile | null>(null);

  const [wikiExpanded, setWikiExpandedState] = useState(() => {
    const saved = localStorage.getItem('wikiExpanded');
    return saved ? JSON.parse(saved) : true;
  });
  const [gameIntroExpanded, setGameIntroExpandedState] = useState(() => {
    const saved = localStorage.getItem('gameIntroExpanded');
    return saved ? JSON.parse(saved) : false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [bgSettings, setBgSettingsState] = useState<BackgroundSettings>(loadBgSettings);

  const setGameIntroExpanded = useCallback((expanded: boolean) => {
    setGameIntroExpandedState(expanded);
    localStorage.setItem('gameIntroExpanded', JSON.stringify(expanded));
  }, []);

  const setWikiExpanded = useCallback((expanded: boolean) => {
    setWikiExpandedState(expanded);
    localStorage.setItem('wikiExpanded', JSON.stringify(expanded));
  }, []);

  const setSidebarCollapsed = useCallback((v: boolean) => {
    setSidebarCollapsedState(v);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(v));
  }, []);

  const setBgSettings = useCallback((s: BackgroundSettings) => {
    setBgSettingsState(s);
    localStorage.setItem('bgSettings', JSON.stringify(s));
  }, []);

  const isImageBg = bgSettings.mode === 'image' && bgSettings.imageUrl;
  const isLoginPage = activePage === 'login';
  const showSidebar = !isLoginPage;

  // 应用启动时自动验证登录状态
  useEffect(() => {
    if (isLoggedIn) {
      getProfile()
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          clearToken();
          setIsLoggedIn(false);
          setUser(null);
        });
    }
  }, [isLoggedIn]);



  return (
    <AppContext.Provider
      value={{
        activePage, setActivePage,
        activeCharacterId, setActiveCharacterId,
        wikiExpanded, setWikiExpanded,
        gameIntroExpanded, setGameIntroExpanded,
        sidebarOpen, setSidebarOpen,
        isLoggedIn, setIsLoggedIn,
        user, setUser,
        bgSettings, setBgSettings,
        sidebarCollapsed, setSidebarCollapsed,
      }}
    >
      <div className="min-h-screen font-['Nunito','Noto_Sans_SC',system-ui,sans-serif] relative">
        {/* 背景层 */}
        {isImageBg ? (
          <>
            <div
              className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${bgSettings.imageUrl})` }}
            />
            <div
              className="fixed inset-0 z-0"
              style={{ backgroundColor: `rgba(245, 240, 232, ${1 - bgSettings.opacity})` }}
            />
          </>
        ) : (
          <div className="fixed inset-0 z-0 bg-[#f5f0e8]" />
        )}

        {/* 桌面端侧边栏 */}
        {showSidebar && (
          <div className="hidden lg:block relative z-10">
            <Sidebar />
          </div>
        )}

        {/* 移动端侧边栏 */}
        {showSidebar && (
          <div className="lg:hidden relative z-10">
            <MobileSidebar />
          </div>
        )}

        {/* 主内容区 */}
        <div className={`
          min-h-screen relative z-10
          ${showSidebar
            ? sidebarCollapsed ? 'lg:ml-[64px]' : 'lg:ml-[280px]'
            : ''
          }
        `}>
          {/* 移动端顶部填充（非登录页） */}
          {showSidebar && <div className="lg:hidden h-14" />}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ContentArea />
          </div>
          {/* 页脚 */}
          <footer className="border-t border-[#e8e0d5]/60 mt-12 py-6 px-8 text-center text-xs text-[#b8a898] relative">
            <p>星布谷地 Wiki - 由玩家共同编写和维护的游戏百科全书</p>
            <p className="mt-1">本站为爱好者建立的非官方站点</p>
          </footer>
        </div>


      </div>
    </AppContext.Provider>
  );
}

export default App;
