import { useState } from 'react';
import { quickCards } from '@/data/wikiData';
import { useActivePage } from '@/hooks/useActivePage';
import { FileText, UsersRound, Pencil, Calendar, Construction, Users, Sprout, ChefHat, Fish } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const quickIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Users,
  Sprout,
  ChefHat,
  Fish,
};

function DevNotice() {
  const [show, setShow] = useState(false);

  const dismiss = () => {
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dismiss} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-md w-full rounded-2xl p-6 shadow-2xl bg-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#fff8e1] flex items-center justify-center">
                <Construction size={22} className="text-[#e6a93f]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#3d3428]">积极开发中</h2>
                <p className="text-xs text-[#b8a898]">星布谷地 Wiki 预览版</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-[#6b5d4d] leading-relaxed">
              <p>欢迎来到星布谷地 Wiki！目前项目处于<strong className="text-[#3d3428]">积极开发阶段</strong>。</p>
              <p>功能持续完善中。如果你发现任何问题或有建议，欢迎通过反馈页面告诉我们。</p>
            </div>
            <button
              onClick={dismiss}
              className="w-full mt-5 py-2.5 rounded-xl bg-[#aed581] text-white font-medium hover:bg-[#9bc76d] transition-colors"
            >
              我知道了
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function HomePage() {
  const { setActivePage } = useActivePage();

  const statItems = [
    { icon: FileText, label: '— 个条目' },
    { icon: UsersRound, label: '— 名编辑者' },
    { icon: Pencil, label: '— 次编辑' },
    { icon: Calendar, label: '持续更新中' },
  ];

  return (
    <div className="space-y-8">
      <DevNotice />

      {/* 欢迎横幅 */}
      <div className="relative rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <img
          src="/images/hero.png"
          alt="星布谷地"
          className="w-full aspect-video object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
            欢迎来到星布谷地 Wiki
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            由玩家共同编写和维护的百科全书
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            {statItems.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-1.5 text-white/90 text-xs md:text-sm bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full"
              >
                <stat.icon size={13} />
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickCards.map((card) => (
          <button
            key={card.title}
            onClick={() => setActivePage(card.page)}
            className="
              bg-white rounded-2xl p-5 text-left
              shadow-[0_2px_12px_rgba(0,0,0,0.04)]
              transition-all duration-300
              hover:translate-y-[-6px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)]
              active:scale-[0.98]
            "
          >
            <div className={`${card.color} w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
              {(() => {
                const IconComp = quickIconMap[card.icon];
                return IconComp ? <IconComp size={20} className="text-white" /> : null;
              })()}
            </div>
            <h3 className="font-bold text-[#3d3428] mb-1 text-[15px]">{card.title}</h3>
            <p className="text-xs text-[#8a7e6b]">{card.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 热门内容 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#4a6741]">热门内容</h2>
            <button className="text-sm text-[#66a85c] hover:text-[#4a8c40] hover:underline transition-colors">查看全部 →</button>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
            <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
          </div>
        </div>

        {/* 近期更新 */}
        <div>
          <h2 className="text-lg font-bold text-[#4a6741] mb-4">近期更新</h2>
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-8 text-center">
              <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
