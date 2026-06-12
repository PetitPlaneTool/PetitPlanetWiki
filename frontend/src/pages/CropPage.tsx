import { useState } from 'react';
import { useActivePage } from '@/hooks/useActivePage';

import { crops, cropSeasons } from '@/data/wikiData';

export function CropPage() {
  const [activeSeason, setActiveSeason] = useState('全部');
  const { setActivePage } = useActivePage();

  const filtered = activeSeason === '全部'
    ? crops
    : crops.filter((c) => c.season === activeSeason);

  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">种植</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">种植</h1>
      <p className="text-[#8a7e6b] mb-6">星布谷地的农作物种植指南</p>

      {crops.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
          <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {cropSeasons.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSeason(s)}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  ${activeSeason === s
                    ? 'bg-[#81c784] text-white shadow-sm'
                    : 'bg-white text-[#6b5d4d] border border-[#e8e0d5] hover:bg-[#f5f0e8]'
                  }
                `}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f1f8e9] text-[#4a6741]">
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">作物名</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">季节</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">生长周期</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">售价</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">描述</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((crop, idx) => (
                  <tr
                    key={crop.id}
                    className={`transition-colors duration-150 hover:bg-[#f8f6f1] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fdfbf7]'}`}
                  >
                    <td className="px-5 py-3.5 font-semibold text-[#3d3428]">{crop.name}</td>
                    <td className="px-5 py-3.5 text-[#8a7e6b]">{crop.season}</td>
                    <td className="px-5 py-3.5 text-[#8a7e6b]">{crop.growTime} 天</td>
                    <td className="px-5 py-3.5 text-[#e6a93f] font-bold">{crop.sellPrice} G</td>
                    <td className="px-5 py-3.5 text-[#8a7e6b]">{crop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
