import { useActivePage } from '@/hooks/useActivePage';

const changes: { date: string; entries: { title: string; desc: string }[] }[] = [];

export function ChangesPage() {
  const { setActivePage } = useActivePage();
  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">最近更改</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">最近更改</h1>
      <p className="text-[#8a7e6b] mb-6">查看 Wiki 的最新更新内容</p>

      {changes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
          <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {changes.map((group) => (
            <div key={group.date}>
              <h2 className="text-sm font-bold text-[#8a7e6b] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#aed581]" />
                {group.date}
              </h2>
              <div className="space-y-2 ml-4">
                {group.entries.map((entry, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-[0_1px_6px_rgba(0,0,0,0.03)] flex items-start gap-3 transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#f1f8e9] text-[#66a85c] font-medium shrink-0 mt-0.5">
                      {entry.title}
                    </span>
                    <span className="text-sm text-[#3d3428]">{entry.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
