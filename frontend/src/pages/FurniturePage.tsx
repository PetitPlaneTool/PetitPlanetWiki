import { useActivePage } from '@/hooks/useActivePage';

export function FurniturePage() {
  const { setActivePage } = useActivePage();
  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">家具</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">家具</h1>
      <p className="text-[#8a7e6b] mb-6">布置温馨小屋的家具大全</p>
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
        <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
      </div>
    </div>
  );
}
