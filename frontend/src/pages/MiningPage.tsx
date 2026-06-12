import { useActivePage } from '@/hooks/useActivePage';

import { ores } from '@/data/wikiData';

export function MiningPage() {
  const { setActivePage } = useActivePage();
  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">矿产</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">矿产</h1>
      <p className="text-[#8a7e6b] mb-6">矿洞探险与矿石收集指南</p>
      {ores.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
          <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#ede7f6] text-[#5e35b1]">
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">矿石</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">出现层数</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">售价</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">主要用途</th>
              </tr>
            </thead>
            <tbody>
              {ores.map((ore, idx) => (
                <tr key={ore.name} className={`transition-colors hover:bg-[#f5f0e8] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fdfbf7]'}`}>
                  <td className="px-5 py-3.5 font-semibold text-[#3d3428]">{ore.name}</td>
                  <td className="px-5 py-3.5 text-[#8a7e6b]">{ore.depth}</td>
                  <td className="px-5 py-3.5 text-[#e6a93f] font-bold">{ore.sell} G</td>
                  <td className="px-5 py-3.5 text-[#8a7e6b]">{ore.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
