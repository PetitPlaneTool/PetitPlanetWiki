import { useActivePage } from '@/hooks/useActivePage';
import { gameBasics } from '@/data/wikiData';

export function GameOverviewPage() {
  const { setActivePage } = useActivePage();
  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <button onClick={() => setActivePage('game-intro')} className="hover:text-[#66a85c] transition-colors">游戏简介</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">游戏概述</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">游戏概述</h1>
      <p className="text-[#8a7e6b] mb-6">星布谷地的世界背景与基础设定</p>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[#3d3428] mb-3">故事背景</h2>
          <p className="text-sm text-[#6b5d4d] leading-relaxed">
            内容正在建设中，敬请期待...
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3d3428] mb-3">基础设定</h2>
          {gameBasics.length === 0 ? (
            <div className="bg-[#faf6ef] rounded-xl p-8 text-center">
              <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gameBasics.map((item) => (
                <div key={item.label} className="bg-[#faf6ef] rounded-xl p-3">
                  <p className="text-xs text-[#b8a898] mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-[#3d3428]">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3d3428] mb-3">世界地图</h2>
          <div className="relative rounded-xl overflow-hidden">
            <img src="/images/map.jpg" alt="星布谷地地图" className="w-full h-auto rounded-xl" />
          </div>
        </section>
      </div>
    </div>
  );
}
