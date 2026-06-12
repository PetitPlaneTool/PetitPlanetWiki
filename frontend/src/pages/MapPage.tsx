import { useActivePage } from '@/hooks/useActivePage';
import { mapAreas } from '@/data/wikiData';

export function MapPage() {
  const { setActivePage } = useActivePage();

  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">地图</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">地图</h1>
      <p className="text-[#8a7e6b] mb-6">星布谷地的完整世界地图，探索每个角落</p>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4">
        <div className="relative rounded-xl overflow-hidden">
          <img
            src="/images/map.jpg"
            alt="星布谷地地图"
            className="w-full h-auto rounded-xl"
          />
        </div>
        {mapAreas.length === 0 ? (
          <div className="mt-4 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
            <p className="text-[#8a7e6b]">区域说明内容正在建设中，敬请期待...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {mapAreas.map((area) => (
              <div key={area.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#faf6ef]">
                <span className={`w-3 h-3 rounded-full ${area.color}`} />
                <span className="text-sm text-[#3d3428]">{area.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
