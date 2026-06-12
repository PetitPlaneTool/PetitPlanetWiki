import { useActivePage } from '@/hooks/useActivePage';
import { Home, Search, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

export function NotFoundPage() {
  const { setActivePage } = useActivePage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        {/* 像素风格 404 数字 */}
        <div className="relative mb-6">
          <h1 className="text-8xl font-black text-[#aed581] tracking-tight leading-none select-none">
            404
          </h1>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            <span className="w-2 h-2 bg-[#d4c8b8] rounded-sm" />
            <span className="w-2 h-2 bg-[#e8e0d5] rounded-sm" />
            <span className="w-2 h-2 bg-[#d4c8b8] rounded-sm" />
          </div>
        </div>

        {/* 描述 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#3d3428] mb-2">这片田地还没有开垦</h2>
          <p className="text-sm text-[#8a7e6b] leading-relaxed">
            你仿佛在星布谷地的边缘迷路了。<br />
            这里什么都没有种，也许你应该回到农场。
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#aed581] text-white font-medium text-sm hover:bg-[#9bc76d] transition-all hover:shadow-lg active:scale-[0.98]"
          >
            <Home size={16} />
            回到 Wiki 首页
          </button>
          <button
            onClick={() => setActivePage('map')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#faf6ef] text-[#6b5d4d] font-medium text-sm border border-[#e8e0d5] hover:bg-[#f0ebe0] transition-all active:scale-[0.98]"
          >
            <Sprout size={16} />
            查看地图
          </button>
        </div>

        {/* 趣味小贴士 */}
        <div className="mt-10 bg-[#faf6ef] rounded-2xl p-4 border border-[#f0ebe0]">
          <div className="flex items-center gap-2 text-[#8a7e6b] text-xs mb-2">
            <Search size={14} />
            <span className="font-medium">小贴士</span>
          </div>
          <p className="text-xs text-[#8a7e6b] leading-relaxed">
            在星布谷地，迷路了不要紧。按住 <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono border border-[#e8e0d5]">ESC</kbd> 然后深呼吸，一切都会好起来的。
          </p>
        </div>
      </motion.div>
    </div>
  );
}
