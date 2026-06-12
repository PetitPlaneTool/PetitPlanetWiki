# 星布谷地 Wiki - 技术规格

## 组件清单

### shadcn/ui 内置组件
| 组件 | 用途 | 安装命令 |
|------|------|----------|
| Button | 各种按钮 | `npx shadcn add button` |
| Input | 搜索输入框 | `npx shadcn add input` |
| Card | 内容卡片容器 | `npx shadcn add card` |
| Badge | 标签（季节、分类等） | `npx shadcn add badge` |
| Avatar | 人物头像 | `npx shadcn add avatar` |
| Separator | 分割线 | `npx shadcn add separator` |
| Tooltip | 图标栏 tooltip | `npx shadcn add tooltip` |
| Sheet | 移动端侧边栏抽屉 | `npx shadcn add sheet` |
| Collapsible | 游戏简介展开/收起 | `npx shadcn add collapsible` |
| ScrollArea | 内容区滚动 | `npx shadcn add scroll-area` |
| Table | 作物列表等 | `npx shadcn add table` |

### 自定义组件
| 组件 | 描述 | 位置 |
|------|------|------|
| Sidebar | 侧边导航主容器 | `src/components/Sidebar.tsx` |
| SidebarLogo | Logo 区 | `src/components/SidebarLogo.tsx` |
| SidebarNavItem | 导航链接项（含激活态、hover 动画） | `src/components/SidebarNavItem.tsx` |
| SidebarSearch | 胶囊搜索框 | `src/components/SidebarSearch.tsx` |
| SidebarSection | 区域分隔容器 | `src/components/SidebarSection.tsx` |
| MobileSidebar | 移动端 Sheet 抽屉包装 | `src/components/MobileSidebar.tsx` |
| ContentArea | 主内容区容器（含页面切换动画） | `src/components/ContentArea.tsx` |
| WelcomeBanner | 首页欢迎横幅 | `src/sections/WelcomeBanner.tsx` |
| QuickEntryCards | 首页快速入口卡片 | `src/sections/QuickEntryCards.tsx` |
| HotContent | 首页热门内容网格 | `src/sections/HotContent.tsx` |
| RecentUpdates | 首页近期更新列表 | `src/sections/RecentUpdates.tsx` |
| CategoryHeader | 分类页标题+面包屑 | `src/sections/CategoryHeader.tsx` |
| CategoryTabs | 分类筛选标签 | `src/sections/CategoryTabs.tsx` |
| CharacterGrid | 人物卡片网格 | `src/sections/CharacterGrid.tsx` |
| CharacterDetail | 人物详情页 | `src/sections/CharacterDetail.tsx` |
| CropTable | 种植作物表格 | `src/sections/CropTable.tsx` |
| MapView | 地图交互视图 | `src/sections/MapView.tsx` |
| BeginnerGuide | 新手入门引导 | `src/sections/BeginnerGuide.tsx` |
| RecentChanges | 最近更改列表 | `src/sections/RecentChanges.tsx` |

## 动画实现方案

| 动画 | 库 | 实现方式 | 复杂度 |
|------|------|----------|--------|
| 侧边栏折叠/展开 | Framer Motion | `AnimatePresence` + `motion.div` 控制 height auto | Medium |
| 导航链接 hover（背景色+金色竖线） | CSS Tailwind | `transition` + `::before` 伪元素 height 动画 | Low |
| 页面切换淡入淡出+位移 | Framer Motion | `motion.div` 配合 `initial/animate/exit` + opacity/translateY | Medium |
| 卡片 hover 上浮+阴影 | CSS Tailwind | `transition-all duration-250 hover:translate-y-[-4px] hover:shadow-lg` | Low |
| 图片 hover 放大 | CSS Tailwind | `transition-transform duration-300 hover:scale-105` | Low |
| 搜索框聚焦光晕 | CSS Tailwind | `transition-shadow focus:ring-2 focus:ring-[#a8d58a]` | Low |
| 移动端侧边栏滑入 | shadcn Sheet | 内置动画 | Low |

## 项目文件结构

```
/mnt/agents/output/app/
├── public/
│   ├── images/
│   │   ├── logo.png              # 用户上传的 Logo
│   │   ├── banner.jpg            # 欢迎横幅
│   │   ├── map.jpg               # 游戏地图
│   │   └── characters/           # 角色头像
│   │       ├── char1.png
│   │       ├── char2.png
│   │       └── ...
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 组件
│   │   ├── Sidebar.tsx           # 侧边导航主容器
│   │   ├── SidebarLogo.tsx       # Logo 区
│   │   ├── SidebarNavItem.tsx    # 导航链接项
│   │   ├── SidebarSearch.tsx     # 胶囊搜索框
│   │   ├── SidebarSection.tsx    # 区域分隔
│   │   ├── MobileSidebar.tsx     # 移动端抽屉
│   │   └── ContentArea.tsx       # 主内容区容器
│   ├── sections/                 # 页面内容区块
│   │   ├── WelcomeBanner.tsx
│   │   ├── QuickEntryCards.tsx
│   │   ├── HotContent.tsx
│   │   ├── RecentUpdates.tsx
│   │   ├── CategoryHeader.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── CharacterGrid.tsx
│   │   ├── CharacterDetail.tsx
│   │   ├── CropTable.tsx
│   │   ├── MapView.tsx
│   │   ├── BeginnerGuide.tsx
│   │   └── RecentChanges.tsx
│   ├── pages/                    # 页面级组件
│   │   ├── HomePage.tsx
│   │   ├── CharacterPage.tsx
│   │   ├── CropPage.tsx
│   │   ├── MapPage.tsx
│   │   ├── BeginnerPage.tsx
│   │   ├── ChangesPage.tsx
│   │   ├── CookingPage.tsx
│   │   ├── FishingPage.tsx
│   │   ├── WeatherPage.tsx
│   │   ├── SeasonPage.tsx
│   │   ├── MiningPage.tsx
│   │   ├── BeachPage.tsx
│   │   ├── GameIntroPage.tsx
│   │   ├── GameOverviewPage.tsx
│   │   ├── GameplayPage.tsx
│   │   ├── FeedbackPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── ProfilePage.tsx
│   ├── data/                     # 静态数据
│   │   ├── characters.ts         # 角色数据
│   │   ├── crops.ts              # 作物数据
│   │   ├── hotContent.ts         # 热门内容
│   │   └── updates.ts            # 近期更新
│   ├── hooks/
│   │   └── useActivePage.ts      # 当前页面状态管理
│   ├── types/
│   │   └── index.ts              # TypeScript 类型定义
│   ├── App.tsx                   # 根组件（布局+路由）
│   └── main.tsx                  # 入口
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## 依赖安装

### 核心依赖（init 已包含）
- React 19 + TypeScript + Vite + Tailwind CSS
- shadcn/ui 基础组件

### 需额外安装的依赖
```bash
# 动画库
npm install framer-motion

# 图标库
npm install lucide-react

# 字体（Nunito + Noto Sans SC）通过 Google Fonts CDN 在 index.html 引入
```

### shadcn 组件安装
```bash
npx shadcn add button input card badge avatar separator tooltip sheet collapsible scroll-area table
```

## 状态管理方案

使用 React Context + useState 实现简单的全局状态管理：

```typescript
// types/index.ts
type PageId = 
  | 'home' | 'beginner' | 'changes' | 'contribute'
  | 'game-intro' | 'game-overview' | 'gameplay'
  | 'map' | 'characters' | 'crops' | 'cooking'
  | 'beach' | 'weather' | 'seasons' | 'fishing'
  | 'mining' | 'feedback' | 'settings' | 'profile';

interface AppState {
  activePage: PageId;
  activeCharacterId: string | null;
  sidebarExpanded: boolean;
  gameIntroExpanded: boolean;
}
```

通过 `AppContext` 在 `App.tsx` 中提供，`useActivePage()` hook 在各组件中消费。

## 响应式断点

| 断点 | 宽度 | 布局 |
|------|------|------|
| `lg` | ≥1024px | 侧边栏 280px 完全展开 |
| `md` | 768-1023px | 侧边栏 64px 图标栏 |
| `<md` | <768px | 侧边栏隐藏，汉堡菜单 |

使用 Tailwind 的 `lg:`、`md:` 前缀实现。

## 关键实现要点

1. **侧边导航不滚动**：使用 `h-screen overflow-hidden` 固定，内容在内部垂直分布
2. **页面切换无刷新**：通过 `activePage` 状态控制主内容区渲染，配合 Framer Motion 动画
3. **折叠状态持久化**：`gameIntroExpanded` 保存到 localStorage
4. **移动端 Sheet**：使用 shadcn Sheet 组件从左侧滑出，占屏幕 80% 宽度
5. **字体加载**：在 `index.html` 通过 `<link>` 引入 Google Fonts（Nunito + Noto Sans SC）
