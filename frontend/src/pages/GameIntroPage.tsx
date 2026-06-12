import { useActivePage } from '@/hooks/useActivePage';
import { gameFeatures } from '@/data/wikiData';

export function GameIntroPage() {
  const { setActivePage } = useActivePage();
  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">游戏简介</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">游戏简介</h1>
      <p className="text-[#8a7e6b] mb-6">欢迎来到星布谷地的世界</p>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[#3d3428] mb-3">关于星布谷地</h2>
          <p className="text-sm text-[#6b5d4d] leading-relaxed">
            内容正在建设中，敬请期待...
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3d3428] mb-3">游戏特色</h2>
          {gameFeatures.length === 0 ? (
            <div className="bg-[#faf6ef] rounded-xl p-8 text-center">
              <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameFeatures.map((f) => (
                <div key={f.title} className="bg-[#faf6ef] rounded-xl p-4">
                  <h3 className="font-bold text-[#3d3428] mb-1">{f.title}</h3>
                  <p className="text-xs text-[#8a7e6b]">{f.desc}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3d3428] mb-3">快速导航</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '游戏概述', page: 'game-overview' as const },
              { label: '玩法介绍', page: 'gameplay' as const },
              { label: '友邻', page: 'neighbors' as const },
              { label: '种植', page: 'farming' as const },
              { label: '菜肴', page: 'dishes' as const },
              { label: '鱼类', page: 'fishes' as const },
            ].map((link) => (
              <button
                key={link.page}
                onClick={() => setActivePage(link.page)}
                className="px-4 py-2 rounded-xl bg-[#f1f8e9] text-[#66a85c] text-sm font-medium hover:bg-[#66a85c] hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
