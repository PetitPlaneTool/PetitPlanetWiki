import { Search } from 'lucide-react';

export function SidebarSearch() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8a898]" />
      <input
        type="text"
        placeholder="搜索百科…"
        className="
          w-full h-9 pl-9 pr-4 rounded-xl
          bg-white text-sm text-[#4a3f32]
          placeholder:text-[#b8a898]
          border border-[#e8e0d5]
          outline-none transition-all duration-200
          focus:border-[#a5d6a7] focus:ring-[3px] focus:ring-[#a5d6a7]/20
        "
      />
    </div>
  );
}
