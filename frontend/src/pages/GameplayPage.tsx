import { useActivePage } from '@/hooks/useActivePage';
import { skills, dailySchedule } from '@/data/wikiData';

export function GameplayPage() {
  const { setActivePage } = useActivePage();
  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <button onClick={() => setActivePage('game-intro')} className="hover:text-[#66a85c] transition-colors">游戏简介</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">玩法</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">玩法</h1>
      <p className="text-[#8a7e6b] mb-6">核心玩法系统介绍</p>

      <div className="space-y-5">
        <section className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-xl font-bold text-[#3d3428] mb-4">技能系统</h2>
          {skills.length === 0 ? (
            <div className="bg-[#faf6ef] rounded-xl p-8 text-center">
              <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <div key={skill.name} className="bg-[#faf6ef] rounded-xl p-4">
                  <h3 className="font-bold text-[#3d3428] mb-1">{skill.name} <span className="text-xs font-normal text-[#b8a898]">（{skill.level}级）</span></h3>
                  <p className="text-xs text-[#8a7e6b] mb-2">{skill.desc}</p>
                  <p className="text-xs text-[#b8a898]">相关行为：{skill.actions}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-xl font-bold text-[#3d3428] mb-4">每日活动建议</h2>
          {dailySchedule.length === 0 ? (
            <div className="bg-[#faf6ef] rounded-xl p-8 text-center">
              <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailySchedule.map((slot) => (
                <div key={slot.time} className="flex gap-4 items-start">
                  <span className="shrink-0 w-16 text-sm font-bold text-[#66a85c]">{slot.time}</span>
                  <p className="text-sm text-[#6b5d4d]">{slot.tasks}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-xl font-bold text-[#3d3428] mb-4">工具升级路线</h2>
          <p className="text-sm text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
        </section>
      </div>
    </div>
  );
}
