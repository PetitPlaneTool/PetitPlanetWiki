import { useState, useEffect, useCallback } from 'react';
import type { Character } from '@/types';
import { useActivePage } from '@/hooks/useActivePage';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { STAR_DECORATION } from '@/assets/star-decoration';

export function CharacterPage() {
  const { setActivePage } = useActivePage();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/resources/data/友邻.json')
      .then((res) => res.json())
      .then((data: Character[]) => {
        const processed = data.map((item) => ({
          ...item,
          portrait: item.portrait.replace(/^\/xingbugudi/, ''),
          avatar: item.avatar.replace(/^\/xingbugudi/, ''),
        }));
        setCharacters(processed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedChar = characters.find((c) => c.name === selectedName) ?? null;

  const openDetail = useCallback((name: string) => {
    setSelectedName(name);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedName(null);
  }, []);

  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">
          Wiki 首页
        </button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">友邻</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">友邻</h1>
      <p className="text-[#8a7e6b] mb-6">星布谷地中你可以结识的各种角色</p>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
          <p className="text-[#8a7e6b]">加载中...</p>
        </div>
      ) : characters.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
          <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {characters.map((char, index) => {
            const isSelected = selectedName === char.name;
            return (
              <motion.button
                key={char.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.06 }}
                onClick={() => openDetail(char.name)}
                className={`
                  text-left rounded-2xl p-4 cursor-pointer
                  transition-all duration-300
                  ${isSelected
                    ? 'bg-white shadow-[0_4px_20px_rgba(129,199,132,0.18)] ring-2 ring-[#81c784]'
                    : 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1'
                  }
                `}
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={char.avatar}
                    alt={char.name}
                    className="w-16 h-16 rounded-full object-cover bg-[#faf6ef] ring-2 ring-[#f0ebe0] mb-3"
                  />
                  <h3 className="font-bold text-[#3d3428] text-sm">{char.name}</h3>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#f1f8e9] text-[#66a85c] font-medium">
                    {char.occupation}
                  </span>
                  <p className="text-xs text-[#8a7e6b] leading-relaxed line-clamp-2 mt-2">{char.intro1}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* 详情面板 */}
      <AnimatePresence>
        {selectedChar && (
          <>
            {/* 遮罩层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
              onClick={closeDetail}
            />

            {/* 右侧面板 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-[#f5f0e8] shadow-2xl z-50 overflow-y-auto"
            >
              {/* 关闭按钮 */}
              <button
                onClick={closeDetail}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#6b5d4d] hover:text-[#3d3428] hover:bg-white transition-all shadow-sm"
              >
                <X size={18} />
              </button>

              {/* 立绘 */}
              <div className="relative w-full bg-[#e8e0d5]">
                <img
                  src={selectedChar.portrait}
                  alt={selectedChar.name}
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* 信息区 */}
              <div className="p-6 space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-[#4a6741]">{selectedChar.name}</h2>
                  <span className="inline-block mt-1.5 text-xs px-3 py-1 rounded-full bg-[#f1f8e9] text-[#66a85c] font-medium">
                    {selectedChar.occupation}
                  </span>
                </div>

                <div className="h-px bg-[#e8e0d5]" />

                {/* intro1 */}
                <div className="bg-white rounded-xl p-4 shadow-[0_1px_6px_rgba(0,0,0,0.03)]">
                  <p className="text-sm text-[#6b5d4d] italic leading-relaxed">{selectedChar.intro1}</p>
                </div>

                {/* 星星装饰 */}
                <div className="flex justify-center">
                  <img
                    src={STAR_DECORATION}
                    alt="星星装饰"
                    className="w-24 h-auto opacity-80"
                  />
                </div>

                {/* intro2 */}
                <div>
                  <p className="text-xs text-[#b8a898] mb-2 font-medium uppercase tracking-wider">角色故事</p>
                  <p className="text-sm text-[#6b5d4d] leading-relaxed whitespace-pre-line">
                    {selectedChar.intro2}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
