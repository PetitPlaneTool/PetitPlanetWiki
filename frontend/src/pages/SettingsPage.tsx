import { useActivePage } from '@/hooks/useActivePage';
import { useState, useRef } from 'react';
import { APP_VERSION } from '@/data/version';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Moon, Bell, Type, Image, Upload, Droplets,
  Settings, RefreshCw, Radio, ShieldCheck, CheckCircle2,
  Clock, Globe, ListChecks, HardDrive, AlertCircle, Download, Loader2, Cloud,
} from 'lucide-react';

/* ─────────────── 通用设置子组件 ─────────────── */
function GeneralSettings() {
  const { bgSettings, setBgSettings } = useActivePage();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const fileRef = useRef<HTMLInputElement>(null);
  const isImageBg = bgSettings.mode === 'image' && bgSettings.imageUrl;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.includes('gif')) {
      alert('请上传图片文件（支持 JPG、PNG、GIF）');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setBgSettings({ ...bgSettings, mode: 'image', imageUrl: url });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* 背景设置 */}
      <div className="p-6 border-b border-[#f0ebe0]">
        <h2 className="text-lg font-bold text-[#3d3428] mb-4 flex items-center gap-2">
          <Image size={18} className="text-[#b8a898]" />
          背景设置
        </h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setBgSettings({ ...bgSettings, mode: 'solid' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              bgSettings.mode === 'solid'
                ? 'bg-[#aed581] text-white shadow-sm'
                : 'bg-[#faf6ef] text-[#6b5d4d] hover:bg-[#f0ebe0]'
            }`}
          >
            <Droplets size={15} />
            纯色模式
          </button>
          <button
            onClick={() => setBgSettings({ ...bgSettings, mode: 'image' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              bgSettings.mode === 'image'
                ? 'bg-[#aed581] text-white shadow-sm'
                : 'bg-[#faf6ef] text-[#6b5d4d] hover:bg-[#f0ebe0]'
            }`}
          >
            <Image size={15} />
            背景图模式
          </button>
        </div>
        {bgSettings.mode === 'image' && (
          <div className="space-y-3">
            <input ref={fileRef} type="file" accept="image/*,.gif" onChange={handleImageUpload} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-[#e8e0d5] rounded-xl text-sm text-[#8a7e6b] hover:border-[#aed581] hover:text-[#66a85c] transition-colors"
            >
              <Upload size={18} />
              点击上传背景图（支持 JPG、PNG、GIF）
            </button>
            {bgSettings.imageUrl && (
              <div className="relative rounded-xl overflow-hidden h-32">
                <img src={bgSettings.imageUrl} alt="背景预览" className="w-full h-full object-cover" />
                <button
                  onClick={() => setBgSettings({ ...bgSettings, imageUrl: '' })}
                  className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-black/50 text-white text-xs hover:bg-black/70 transition-colors"
                >
                  移除
                </button>
              </div>
            )}
            <div>
              <label className="text-xs text-[#b8a898] mb-2 block">
                背景图可见度：{Math.round(bgSettings.opacity * 100)}%
              </label>
              <input
                type="range" min="5" max="80"
                value={Math.round(bgSettings.opacity * 100)}
                onChange={(e) => setBgSettings({ ...bgSettings, opacity: Number(e.target.value) / 100 })}
                className="w-full accent-[#aed581]"
              />
              <p className="text-[11px] text-[#b8a898] mt-1">
                提示：调低可见度可以让文字更清晰易读
              </p>
            </div>
          </div>
        )}
        {isImageBg && (
          <div className="mt-3 bg-[#fff8e1] rounded-xl p-3 flex items-start gap-2">
            <Droplets size={14} className="text-[#e6a93f] shrink-0 mt-0.5" />
            <p className="text-xs text-[#8a6d0b]">
              背景图模式下，侧边栏和卡片会自动变为半透明毛玻璃效果，确保文字可读性。
            </p>
          </div>
        )}
      </div>

      {/* 外观 */}
      <div className="p-6 border-b border-[#f0ebe0]">
        <h2 className="text-lg font-bold text-[#3d3428] mb-4 flex items-center gap-2">
          <Moon size={18} className="text-[#b8a898]" />
          外观
        </h2>
        <div className="space-y-4">
          {[
            { label: '夜间模式', desc: '切换深色主题', state: darkMode, setState: setDarkMode },
            { label: '紧凑视图', desc: '减小卡片间距和边距', state: compactView, setState: setCompactView },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#3d3428]">{item.label}</p>
                <p className="text-xs text-[#b8a898]">{item.desc}</p>
              </div>
              <button
                onClick={() => item.setState(!item.state)}
                className={`w-11 h-6 rounded-full transition-colors ${item.state ? 'bg-[#aed581]' : 'bg-[#e8e0d5]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${item.state ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 通知 */}
      <div className="p-6 border-b border-[#f0ebe0]">
        <h2 className="text-lg font-bold text-[#3d3428] mb-4 flex items-center gap-2">
          <Bell size={18} className="text-[#b8a898]" />
          通知
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#3d3428]">更新通知</p>
            <p className="text-xs text-[#b8a898]">页面更新时推送通知</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-[#aed581]' : 'bg-[#e8e0d5]'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifications ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* 字体 */}
      <div className="p-6 border-b border-[#f0ebe0]">
        <h2 className="text-lg font-bold text-[#3d3428] mb-4 flex items-center gap-2">
          <Type size={18} className="text-[#b8a898]" />
          字体大小
        </h2>
        <div className="flex gap-2">
          {[
            { id: 'small', label: '小' },
            { id: 'medium', label: '中' },
            { id: 'large', label: '大' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFontSize(s.id)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                fontSize === s.id
                  ? 'bg-[#aed581] text-white shadow-sm'
                  : 'bg-[#faf6ef] text-[#6b5d4d] hover:bg-[#f0ebe0]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ─────────────── 更新管理子组件 ─────────────── */
function UpdateManagement() {
  const [checking, setChecking] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(true);

  const currentVersion = APP_VERSION;
  const latestVersion = '0.2.0';

  const changelog = [
    { type: 'feat', text: '新增角色图鉴筛选功能' },
    { type: 'feat', text: '支持作物生长周期计算器' },
    { type: 'fix', text: '修复夜间模式切换闪烁问题' },
    { type: 'fix', text: '优化地图页面加载性能' },
    { type: 'improve', text: '更新钓鱼数据至最新版本' },
  ];

  const handleCheckUpdate = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setHasUpdate(true);
    }, 1500);
  };

  const handleUpdate = () => {
    alert('开始下载更新...（演示功能）');
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* 版本信息 */}
      <div className="p-6 border-b border-[#f0ebe0]">
        <h2 className="text-lg font-bold text-[#3d3428] mb-4 flex items-center gap-2">
          <HardDrive size={18} className="text-[#b8a898]" />
          版本信息
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#faf6ef] rounded-xl p-4">
            <p className="text-xs text-[#b8a898] mb-1">当前版本</p>
            <p className="text-lg font-bold text-[#3d3428]">{currentVersion}</p>
          </div>
          <div className="bg-[#faf6ef] rounded-xl p-4">
            <p className="text-xs text-[#b8a898] mb-1">最新版本</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-[#3d3428]">{latestVersion}</p>
              {hasUpdate && (
                <Badge className="bg-[#aed581] text-white hover:bg-[#aed581]/90 border-0">
                  有更新
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 更新内容 */}
      <div className="p-6 border-b border-[#f0ebe0]">
        <h2 className="text-lg font-bold text-[#3d3428] mb-4 flex items-center gap-2">
          <ListChecks size={18} className="text-[#b8a898]" />
          新版本更新内容
        </h2>
        <ul className="space-y-2">
          {changelog.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-[#3d3428]">
              <CheckCircle2 size={16} className="text-[#aed581] shrink-0 mt-0.5" />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 操作按钮 */}
      <div className="p-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={handleUpdate}
          disabled={!hasUpdate}
          className="bg-[#aed581] hover:bg-[#aed581]/90 text-white border-0"
        >
          <Download size={16} />
          立即更新
        </Button>
        <Button
          variant="outline"
          onClick={handleCheckUpdate}
          disabled={checking}
          className="border-[#e8e0d5] text-[#6b5d4d] hover:bg-[#faf6ef] hover:text-[#3d3428]"
        >
          {checking ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {checking ? '检查中…' : '检查更新'}
        </Button>
        {!hasUpdate && (
          <span className="text-sm text-[#b8a898]">当前已是最新版本</span>
        )}
      </div>
    </div>
  );
}

/* ─────────────── 遥测子组件 ─────────────── */
function TelemetrySettings() {
  const [upstreamUrl, setUpstreamUrl] = useState('https://telemetry.xingbugudi.wiki/v1');
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);

  const telemetryItems = [
    { name: '应用启动次数', desc: '统计应用被打开的频率' },
    { name: '页面访问分布', desc: '各 Wiki 页面的浏览热度' },
    { name: '功能使用频率', desc: '搜索、筛选等功能的点击次数' },
    { name: '崩溃与错误报告', desc: '应用异常退出的基本信息（不含堆栈）' },
    { name: '性能指标', desc: '页面加载耗时、内存占用区间' },
  ];

  const [viewRecord, setViewRecord] = useState<typeof uploadRecords[number] | null>(null);

  const uploadRecords = [
    {
      time: '2026-05-24 08:30:12', status: 'success', size: '12 KB',
      content: {
        session_id: 'sess_a1b2c3d4e5f6',
        timestamp: '2026-05-24T00:30:12.123Z',
        app_version: APP_VERSION,
        os: 'Windows 11 23H2',
        events: [
          { name: 'app_launch', count: 1 },
          { name: 'page_view', page: 'characters', count: 3 },
          { name: 'page_view', page: 'crops', count: 2 },
          { name: 'search', query_hash: 'sha256:abc123...', count: 5 },
        ],
        performance: { avg_page_load_ms: 320, memory_mb: 145 },
      }
    },
    {
      time: '2026-05-23 08:15:44', status: 'success', size: '10 KB',
      content: {
        session_id: 'sess_z9y8x7w6v5u4',
        timestamp: '2026-05-23T00:15:44.456Z',
        app_version: APP_VERSION,
        os: 'Windows 11 23H2',
        events: [
          { name: 'app_launch', count: 1 },
          { name: 'page_view', page: 'home', count: 1 },
          { name: 'page_view', page: 'fishing', count: 4 },
        ],
        performance: { avg_page_load_ms: 290, memory_mb: 132 },
      }
    },
    {
      time: '2026-05-22 08:22:01', status: 'success', size: '11 KB',
      content: {
        session_id: 'sess_m3n4o5p6q7r8',
        timestamp: '2026-05-22T00:22:01.789Z',
        app_version: APP_VERSION,
        os: 'Windows 11 23H2',
        events: [
          { name: 'app_launch', count: 1 },
          { name: 'page_view', page: 'mining', count: 2 },
          { name: 'feature_used', feature: 'calculator', count: 3 },
        ],
        performance: { avg_page_load_ms: 305, memory_mb: 138 },
      }
    },
    {
      time: '2026-05-21 08:18:33', status: 'failed', size: '-',
      content: null,
    },
  ];

  const cloudVersion = 'v2.1.0-stable';

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* 隐私提示 */}
      <div className="p-6 border-b border-[#f0ebe0]">
        <div className="bg-[#f0f9eb] border border-[#aed581]/40 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck size={20} className="text-[#4a6741] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#3d3428] mb-1">隐私保护承诺</p>
            <p className="text-xs text-[#5a6b52] leading-relaxed">
              遥测功能<strong>不会上传任何敏感信息</strong>。我们不会收集你的个人身份信息、账号密码、浏览历史、本地文件内容或任何可追溯到个人的数据。
              上传的数据仅包含匿名的统计指标，用于改善产品体验。你可以随时关闭遥测功能。
            </p>
          </div>
        </div>
      </div>

      {/* 遥测开关与上游地址 */}
      <div className="p-6 border-b border-[#f0ebe0]">
        <h2 className="text-lg font-bold text-[#3d3428] mb-4 flex items-center gap-2">
          <Radio size={18} className="text-[#b8a898]" />
          遥测配置
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#3d3428]">启用遥测</p>
              <p className="text-xs text-[#b8a898]">允许匿名数据上传以帮助改进产品</p>
            </div>
            <button
              onClick={() => setTelemetryEnabled(!telemetryEnabled)}
              className={`w-11 h-6 rounded-full transition-colors ${telemetryEnabled ? 'bg-[#aed581]' : 'bg-[#e8e0d5]'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${telemetryEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-[#3d3428] mb-1.5 block">上游地址</label>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[#b8a898] shrink-0" />
              <input
                type="text"
                value={upstreamUrl}
                onChange={(e) => setUpstreamUrl(e.target.value)}
                className="flex-1 bg-[#faf6ef] border border-[#e8e0d5] rounded-lg px-3 py-2 text-sm text-[#3d3428] focus:outline-none focus:border-[#aed581] transition-colors"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#faf6ef] rounded-xl p-3">
            <Cloud size={16} className="text-[#b8a898] shrink-0" />
            <div>
              <p className="text-xs text-[#b8a898]">云端版本号</p>
              <p className="text-sm font-bold text-[#3d3428]">{cloudVersion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 遥测信息上传清单 */}
      <div className="p-6 border-b border-[#f0ebe0]">
        <h2 className="text-lg font-bold text-[#3d3428] mb-4 flex items-center gap-2">
          <ListChecks size={18} className="text-[#b8a898]" />
          遥测信息上传清单
        </h2>
        <div className="space-y-2">
          {telemetryItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-[#faf6ef] rounded-xl p-3">
              <CheckCircle2 size={16} className="text-[#aed581] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#3d3428]">{item.name}</p>
                <p className="text-xs text-[#b8a898]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 上传记录 */}
      <div className="p-6">
        <h2 className="text-lg font-bold text-[#3d3428] mb-4 flex items-center gap-2">
          <Clock size={18} className="text-[#b8a898]" />
          上传记录
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[#b8a898] border-b border-[#f0ebe0]">
                <th className="pb-2 font-medium">上传时间</th>
                <th className="pb-2 font-medium">状态</th>
                <th className="pb-2 font-medium">数据大小</th>
                <th className="pb-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {uploadRecords.map((rec, idx) => (
                <tr key={idx} className="border-b border-[#f0ebe0]/60 last:border-0">
                  <td className="py-3 text-[#3d3428]">{rec.time}</td>
                  <td className="py-3">
                    {rec.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#4a6741]">
                        <CheckCircle2 size={14} />
                        成功
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-[#c75c5c]">
                        <AlertCircle size={14} />
                        失败
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-[#3d3428]">{rec.size}</td>
                  <td className="py-3">
                    {rec.content ? (
                      <button
                        onClick={() => setViewRecord(rec)}
                        className="text-xs text-[#66a85c] hover:text-[#4a6741] font-medium transition-colors"
                      >
                        查看
                      </button>
                    ) : (
                      <span className="text-xs text-[#b8a898]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 查看上传包内容弹窗 */}
      <Dialog open={!!viewRecord} onOpenChange={(open) => !open && setViewRecord(null)}>
        <DialogContent className="bg-white border-[#e8e0d5] sm:max-w-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#3d3428]">上传包内容</DialogTitle>
            <DialogDescription className="text-[#8a7e6b]">
              {viewRecord?.time} · {viewRecord?.size}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 overflow-auto">
            <pre className="bg-[#faf6ef] rounded-xl p-4 text-xs text-[#3d3428] overflow-auto leading-relaxed">
              {JSON.stringify(viewRecord?.content, null, 2)}
            </pre>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setViewRecord(null)}
              className="bg-[#aed581] hover:bg-[#aed581]/90 text-white border-0"
            >
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────────── 主页面 ─────────────── */
export function SettingsPage() {
  const { setActivePage } = useActivePage();

  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">设置</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">设置</h1>
      <p className="text-[#8a7e6b] mb-6">自定义你的 Wiki 浏览体验</p>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 bg-[#faf6ef] p-1 rounded-xl h-auto">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-[#aed581] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium text-[#6b5d4d] transition-all"
          >
            <Settings size={15} className="mr-1.5" />
            通用
          </TabsTrigger>
          <TabsTrigger
            value="update"
            className="data-[state=active]:bg-[#aed581] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium text-[#6b5d4d] transition-all"
          >
            <RefreshCw size={15} className="mr-1.5" />
            更新管理
          </TabsTrigger>
          <TabsTrigger
            value="telemetry"
            className="data-[state=active]:bg-[#aed581] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium text-[#6b5d4d] transition-all"
          >
            <Radio size={15} className="mr-1.5" />
            遥测
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="update">
          <UpdateManagement />
        </TabsContent>
        <TabsContent value="telemetry">
          <TelemetrySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}


