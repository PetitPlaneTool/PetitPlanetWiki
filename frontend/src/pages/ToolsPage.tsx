import { useState } from 'react';
import { useActivePage } from '@/hooks/useActivePage';
import {
  Calculator, Fish, Sparkles,
} from 'lucide-react';

// 作物利润计算工具
function CropProfitTool() {
  const [cropName, setCropName] = useState('');
  const [seedCost, setSeedCost] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [days, setDays] = useState(0);

  const profit = sellPrice - seedCost;
  const dailyProfit = days > 0 ? (profit / days).toFixed(1) : '0';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#b8a898] mb-1 block">作物名称</label>
          <input
            value={cropName}
            onChange={e => setCropName(e.target.value)}
            placeholder="如：南瓜"
            className="w-full px-3 py-2 rounded-lg bg-[#faf6ef] border border-[#e8e0d5] text-sm outline-none focus:border-[#aed581]"
          />
        </div>
        <div>
          <label className="text-xs text-[#b8a898] mb-1 block">种子成本 (G)</label>
          <input
            type="number"
            value={seedCost || ''}
            onChange={e => setSeedCost(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg bg-[#faf6ef] border border-[#e8e0d5] text-sm outline-none focus:border-[#aed581]"
          />
        </div>
        <div>
          <label className="text-xs text-[#b8a898] mb-1 block">售价 (G)</label>
          <input
            type="number"
            value={sellPrice || ''}
            onChange={e => setSellPrice(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg bg-[#faf6ef] border border-[#e8e0d5] text-sm outline-none focus:border-[#aed581]"
          />
        </div>
        <div>
          <label className="text-xs text-[#b8a898] mb-1 block">生长天数</label>
          <input
            type="number"
            value={days || ''}
            onChange={e => setDays(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg bg-[#faf6ef] border border-[#e8e0d5] text-sm outline-none focus:border-[#aed581]"
          />
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <div className="bg-[#e8f5e9] rounded-lg px-3 py-2">
          <span className="text-[#b8a898] text-xs">单季利润</span>
          <p className={`font-bold ${profit >= 0 ? 'text-[#66a85c]' : 'text-[#c45c4a]'}`}>
            {profit >= 0 ? '+' : ''}{profit} G
          </p>
        </div>
        <div className="bg-[#e3f2fd] rounded-lg px-3 py-2">
          <span className="text-[#b8a898] text-xs">日均利润</span>
          <p className="font-bold text-[#4a90d9]">{dailyProfit} G/天</p>
        </div>
      </div>
    </div>
  );
}

// 钓鱼概率模拟器
function FishingSimulator() {
  const [season, setSeason] = useState('春季');
  const results = [
    { fish: season === '春季' ? '沙丁鱼' : season === '夏季' ? '虹鳟鱼' : season === '秋季' ? '三文鱼' : '冰鱼', chance: 45 },
    { fish: season === '春季' ? '鲶鱼' : season === '夏季' ? '金枪鱼' : season === '秋季' ? '鳗鱼' : '雪蟹', chance: 25 },
    { fish: season === '春季' ? '太阳鱼' : season === '夏季' ? '热带鱼' : season === '秋季' ? '秋刀鱼' : '北极鳕鱼', chance: 20 },
    { fish: '传说之鱼', chance: 5 },
    { fish: '垃圾', chance: 5 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['春季', '夏季', '秋季', '冬季'].map(s => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              season === s ? 'bg-[#aed581] text-white' : 'bg-[#f0ebe0] text-[#8a7e6b] hover:bg-[#e8e0d5]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {results.map(r => (
          <div key={r.fish} className="flex items-center gap-3">
            <span className="text-sm text-[#6b5d4d] w-24 truncate">{r.fish}</span>
            <div className="flex-1 h-3 bg-[#f0ebe0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#81c784] rounded-full transition-all duration-500"
                style={{ width: `${r.chance}%` }}
              />
            </div>
            <span className="text-xs text-[#b8a898] w-8 text-right">{r.chance}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 节日倒计时
function FestivalCountdown() {
  const festivals = [
    { name: '春季花祭', date: '春13日' },
    { name: '夏季海之日', date: '夏11日' },
    { name: '秋季丰收节', date: '秋16日' },
    { name: '冬季星夜祭', date: '冬25日' },
  ];

  return (
    <div className="space-y-2">
      {festivals.map(f => (
        <div key={f.name} className="flex items-center justify-between py-1.5">
          <span className="text-sm text-[#3d3428] font-medium">{f.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#fff8e1] text-[#e6a93f] font-medium">
            {f.date}
          </span>
        </div>
      ))}
    </div>
  );
}

const tools = [
  {
    id: 'crop-profit', title: '作物利润计算器', icon: Calculator, color: 'bg-[#e8f5e9] text-[#66a85c]',
    desc: '计算作物的种植成本和预期收益',
    component: CropProfitTool,
  },
  {
    id: 'fishing-sim', title: '钓鱼概率模拟', icon: Fish, color: 'bg-[#e3f2fd] text-[#4a90d9]',
    desc: '查看不同季节的钓鱼概率分布',
    component: FishingSimulator,
  },
  {
    id: 'festival', title: '节日倒计时', icon: Sparkles, color: 'bg-[#fff8e1] text-[#e6a93f]',
    desc: '全年节日时间表一览',
    component: FestivalCountdown,
  },
];

export function ToolsPage() {
  const { setActivePage, bgSettings } = useActivePage();
  const [activeTool, setActiveTool] = useState('crop-profit');
  const isImageBg = bgSettings.mode === 'image' && bgSettings.imageUrl;

  const activeToolData = tools.find(t => t.id === activeTool);

  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">小工具</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">小工具</h1>
      <p className="text-[#8a7e6b] mb-6">实用的游戏辅助工具合集</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 工具选择 */}
        <div className="space-y-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl text-left
                transition-all duration-200
                ${activeTool === tool.id
                  ? isImageBg
                    ? 'bg-white/80 backdrop-blur shadow-sm ring-1 ring-[#aed581]'
                    : 'bg-white shadow-sm ring-1 ring-[#aed581]'
                  : isImageBg
                    ? 'bg-white/40 backdrop-blur hover:bg-white/60'
                    : 'bg-transparent hover:bg-white/50'
                }
              `}
            >
              <div className={`w-9 h-9 rounded-lg ${tool.color} flex items-center justify-center shrink-0`}>
                <tool.icon size={16} />
              </div>
              <div>
                <p className={`text-sm font-medium ${activeTool === tool.id ? 'text-[#3d3428]' : 'text-[#6b5d4d]'}`}>
                  {tool.title}
                </p>
                <p className="text-[11px] text-[#b8a898]">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* 工具内容区 */}
        <div className={`lg:col-span-2 rounded-2xl p-5 ${isImageBg ? 'bg-white/70 backdrop-blur-md' : 'bg-white'} shadow-[0_2px_12px_rgba(0,0,0,0.04)]`}>
          {activeToolData && (
            <>
              <h2 className="text-lg font-bold text-[#3d3428] mb-4 flex items-center gap-2">
                <activeToolData.icon size={18} className={activeToolData.color.split(' ')[1]} />
                {activeToolData.title}
              </h2>
              <activeToolData.component />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
