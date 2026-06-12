import { useActivePage } from '@/hooks/useActivePage';
import { contributeRanks } from '@/data/wikiData';
import { Edit, FileText, MessageCircle, Award } from 'lucide-react';

export function ContributePage() {
  const { setActivePage } = useActivePage();
  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">共建</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">共建</h1>
      <p className="text-[#8a7e6b] mb-6">一起打造最完善的星布谷地百科全书</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          { icon: Edit, title: '编辑页面', desc: '发现错误或遗漏？直接编辑页面内容进行修正', color: 'bg-[#f1f8e9] text-[#66a85c]' },
          { icon: FileText, title: '创建新页面', desc: '缺少某个词条？创建新页面补充内容', color: 'bg-[#e3f2fd] text-[#4a90d9]' },
          { icon: MessageCircle, title: '参与讨论', desc: '在讨论区与其他编辑者交流想法', color: 'bg-[#fff3e0] text-[#e6a93f]' },
          { icon: Award, title: '贡献排名', desc: '累计你的编辑贡献，登上贡献排行榜', color: 'bg-[#fce4ec] text-[#d4769f]' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:translate-y-[-6px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)]">
            <div className={`${item.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <item.icon size={20} />
            </div>
            <h3 className="font-bold text-[#3d3428] mb-1">{item.title}</h3>
            <p className="text-xs text-[#8a7e6b]">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
        <h2 className="text-lg font-bold text-[#3d3428] mb-4">贡献排行榜</h2>
        {contributeRanks.length === 0 ? (
          <div className="bg-[#faf6ef] rounded-xl p-8 text-center">
            <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contributeRanks.map((user) => (
              <div key={user.name} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#faf6ef]">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  user.rank === 1 ? 'bg-[#ffd700] text-[#8a6d0b]' :
                  user.rank === 2 ? 'bg-[#c0c0c0] text-[#555]' :
                  user.rank === 3 ? 'bg-[#cd7f32] text-white' :
                  'bg-[#e8e0d5] text-[#8a7e6b]'
                }`}>
                  {user.rank}
                </span>
                <span className="flex-1 text-sm font-medium text-[#3d3428]">{user.name}</span>
                <span className="text-xs text-[#b8a898]">{user.edits} 次编辑</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
