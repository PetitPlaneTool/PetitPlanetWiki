import { useActivePage } from '@/hooks/useActivePage';
import { SidebarLogo } from './SidebarLogo';
import { SidebarSearch } from './SidebarSearch';
import { SidebarNavItem } from './SidebarNavItem';
import {
  Home, BookOpen, Clock, Users, Map, Sprout, ChefHat, Shell,
  MessageSquare, Settings, User, ChevronDown, Gamepad2, Compass,
  LogIn, LogOut, PanelLeft, Heart, Sparkles, Sofa, Shirt, Bug, Fish,
  Leaf, Package, Palette, Hammer, Music, Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearToken } from '@/api/client';

export function Sidebar() {
  const {
    wikiExpanded, setWikiExpanded,
    gameIntroExpanded, setGameIntroExpanded,
    isLoggedIn, setIsLoggedIn, setUser, bgSettings,
    sidebarCollapsed, setSidebarCollapsed,
  } = useActivePage();

  const isImageBg = bgSettings.mode === 'image' && bgSettings.imageUrl;
  const collapsed = sidebarCollapsed;

  return (
    <aside
      className={`
        h-screen flex flex-col fixed left-0 top-0 z-50 overflow-hidden
        border-r border-[#ede5d8] transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[64px]' : 'w-[280px]'}
        ${isImageBg ? 'bg-[#faf6ef]/80 backdrop-blur-xl' : 'bg-[#faf6ef]'}
      `}
    >
      {/* Logo + 收缩按钮 */}
      <div className={`shrink-0 flex items-center ${collapsed ? 'justify-center h-16' : 'h-24 px-6 pt-2'}`}>
        {!collapsed && <SidebarLogo />}
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className={`
            flex items-center justify-center rounded-lg transition-all duration-200
            text-[#b8a898] hover:text-[#6b5d4d] hover:bg-[#f0ebe0]
            ${collapsed ? 'w-9 h-9 mx-auto' : 'w-8 h-8 ml-auto shrink-0'}
          `}
          title={collapsed ? '展开导航' : '收起导航'}
        >
          <PanelLeft size={collapsed ? 18 : 16} />
        </button>
      </div>

      {/* 上区域：通用导航 */}
      <div className={`shrink-0 ${collapsed ? 'px-1.5 pb-2' : 'px-3 pb-2'} space-y-0.5`}>
        {!collapsed && (
          <div className="px-2 pb-2">
            <SidebarSearch />
          </div>
        )}
        <div className="space-y-0.5">
          <SidebarNavItem pageId="home" label="Wiki 首页" icon={<Home size={17} />} collapsed={collapsed} />
          <SidebarNavItem pageId="changes" label="最近更改" icon={<Clock size={17} />} collapsed={collapsed} />
          <SidebarNavItem pageId="contribute" label="共建" icon={<Users size={17} />} collapsed={collapsed} />
          <SidebarNavItem pageId="screenshot" label="截图识别" icon={<Camera size={17} />} collapsed={collapsed} />
        </div>
      </div>

      {!collapsed && <div className="mx-4 my-2 h-px bg-[#e8e0d5] shrink-0" />}

      {/* 中区域：百科模块 */}
      <div className={`flex-1 overflow-y-auto scrollbar-thin min-h-0 ${collapsed ? 'px-1.5 py-1' : 'px-3 py-1'} space-y-0.5`}>
        {!collapsed && (
          <button
            onClick={() => setWikiExpanded(!wikiExpanded)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#b8a898] hover:text-[#8a7e6b] transition-colors"
          >
            <motion.span
              animate={{ rotate: wikiExpanded ? 0 : -90 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown size={12} />
            </motion.span>
            百科模块
          </button>
        )}

        {/* 收缩时直接显示导航项，不折叠 */}
        {collapsed ? (
          <div className="space-y-0.5">
            <SidebarNavItem pageId="map" label="地图" icon={<Map size={17} />} collapsed />
            <SidebarNavItem pageId="neighbors" label="友邻" icon={<Users size={17} />} collapsed />
            <SidebarNavItem pageId="constellations" label="星系" icon={<Sparkles size={17} />} collapsed />
            <SidebarNavItem pageId="dishes" label="菜肴" icon={<ChefHat size={17} />} collapsed />
            <SidebarNavItem pageId="furniture" label="家具" icon={<Sofa size={17} />} collapsed />
            <SidebarNavItem pageId="dressup" label="打扮" icon={<Shirt size={17} />} collapsed />
            <SidebarNavItem pageId="insects" label="昆虫" icon={<Bug size={17} />} collapsed />
            <SidebarNavItem pageId="fishes" label="鱼类" icon={<Fish size={17} />} collapsed />
            <SidebarNavItem pageId="shore-residents" label="岸边居民" icon={<Shell size={17} />} collapsed />
            <SidebarNavItem pageId="plants" label="植物" icon={<Leaf size={17} />} collapsed />
            <SidebarNavItem pageId="items" label="物品" icon={<Package size={17} />} collapsed />
            <SidebarNavItem pageId="decorations" label="装饰" icon={<Palette size={17} />} collapsed />
            <SidebarNavItem pageId="farming" label="种植" icon={<Sprout size={17} />} collapsed />
            <SidebarNavItem pageId="crafting" label="制作" icon={<Hammer size={17} />} collapsed />
            <SidebarNavItem pageId="music" label="音乐" icon={<Music size={17} />} collapsed />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {wikiExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5">
                  {/* 游戏简介 - 可展开 */}
                  <div>
                    <button
                      onClick={() => setGameIntroExpanded(!gameIntroExpanded)}
                      className="
                        w-full flex items-center gap-3 px-3 py-2 rounded-xl
                        text-sm font-medium text-[#6b5d4d] hover:bg-[#f0ebe0] hover:text-[#4a3f32]
                        transition-all duration-200
                      "
                    >
                      <Gamepad2 size={17} className="text-[#a89b8c] shrink-0" />
                      <span className="flex-1 text-left truncate">游戏简介</span>
                      <motion.span
                        animate={{ rotate: gameIntroExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[#b8a898]"
                      >
                        <ChevronDown size={15} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {gameIntroExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-0.5 space-y-0.5">
                            <SidebarNavItem pageId="game-overview" label="游戏概述" icon={<BookOpen size={15} />} indent />
                            <SidebarNavItem pageId="gameplay" label="玩法" icon={<Compass size={15} />} indent />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <SidebarNavItem pageId="map" label="地图" icon={<Map size={17} />} />
                  <SidebarNavItem pageId="neighbors" label="友邻" icon={<Users size={17} />} />
                  <SidebarNavItem pageId="constellations" label="星系" icon={<Sparkles size={17} />} />
                  <SidebarNavItem pageId="dishes" label="菜肴" icon={<ChefHat size={17} />} />
                  <SidebarNavItem pageId="furniture" label="家具" icon={<Sofa size={17} />} />
                  <SidebarNavItem pageId="dressup" label="打扮" icon={<Shirt size={17} />} />
                  <SidebarNavItem pageId="insects" label="昆虫" icon={<Bug size={17} />} />
                  <SidebarNavItem pageId="fishes" label="鱼类" icon={<Fish size={17} />} />
                  <SidebarNavItem pageId="shore-residents" label="岸边居民" icon={<Shell size={17} />} />
                  <SidebarNavItem pageId="plants" label="植物" icon={<Leaf size={17} />} />
                  <SidebarNavItem pageId="items" label="物品" icon={<Package size={17} />} />
                  <SidebarNavItem pageId="decorations" label="装饰" icon={<Palette size={17} />} />
                  <SidebarNavItem pageId="farming" label="种植" icon={<Sprout size={17} />} />
                  <SidebarNavItem pageId="crafting" label="制作" icon={<Hammer size={17} />} />
                  <SidebarNavItem pageId="music" label="音乐" icon={<Music size={17} />} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {!collapsed && <div className="mx-4 my-2 h-px bg-[#e8e0d5] shrink-0" />}

      {/* 下区域：系统 */}
      <div className={`shrink-0 pb-3 ${collapsed ? 'px-1.5 pt-1' : 'px-3 pt-1'} space-y-0.5`}>
        {!collapsed && (
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#b8a898]">
            系统
          </div>
        )}
        <SidebarNavItem pageId="feedback" label="反馈" icon={<MessageSquare size={17} />} collapsed={collapsed} />
        <SidebarNavItem pageId="settings" label="设置" icon={<Settings size={17} />} collapsed={collapsed} />
        {isLoggedIn && (
          <SidebarNavItem pageId="profile" label="个人中心" icon={<User size={17} />} collapsed={collapsed} />
        )}
        <SidebarNavItem pageId="credits" label="开源感谢" icon={<Heart size={17} />} collapsed={collapsed} />

        {/* 登录/退出按钮 */}
        {isLoggedIn ? (
          <button
            onClick={() => {
              clearToken();
              setIsLoggedIn(false);
              setUser(null);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-xl
              text-sm font-medium text-[#6b5d4d] hover:bg-[#f0ebe0] hover:text-[#4a3f32]
              transition-all duration-200
              ${collapsed ? 'justify-center' : ''}
            `}
            title="退出登录"
          >
            <LogOut size={17} className="text-[#a89b8c] shrink-0" />
            {!collapsed && <span className="flex-1 text-left truncate">退出登录</span>}
          </button>
        ) : (
          <SidebarNavItem pageId="login" label="登录" icon={<LogIn size={17} />} collapsed={collapsed} />
        )}
      </div>
    </aside>
  );
}
