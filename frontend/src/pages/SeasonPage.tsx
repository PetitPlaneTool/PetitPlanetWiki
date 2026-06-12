import { useActivePage } from '@/hooks/useActivePage';

import { seasons } from '@/data/wikiData';

export function SeasonPage() {
  const { setActivePage } = useActivePage();
  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">季节</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">季节</h1>
      <p className="text-[#8a7e6b] mb-6">星布谷地的四季变化与农事安排</p>
      {seasons.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
          <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {seasons.map((s) => (
            <div key={s.name} className={`bg-gradient-to-br ${s.color} rounded-2xl p-6`}>
              <h2 className="text-2xl font-bold text-[#3d3428] mb-1">{s.name}</h2>
              <p className="text-sm text-[#6b5d4d] mb-4">{s.months}</p>
              <ul className="space-y-1.5 mb-4">
                {s.features.map((f) => (
                  <li key={f} className="text-sm text-[#3d3428] flex items-start gap-2">
                    <span className="text-[#66a85c] mt-0.5">&#9679;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-xs text-[#8a7e6b] mb-1">推荐作物</p>
                <p className="text-sm text-[#3d3428]">{s.crops}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
