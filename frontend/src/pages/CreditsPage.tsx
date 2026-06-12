import { useActivePage } from '@/hooks/useActivePage';
import { Heart, Users, Code } from 'lucide-react';

const openSourceProjects = [
  { name: 'React', desc: '用于构建用户界面的 JavaScript 库', license: 'MIT', url: 'https://react.dev' },
  { name: 'TypeScript', desc: 'JavaScript 的超集，添加了类型系统', license: 'Apache-2.0', url: 'https://www.typescriptlang.org' },
  { name: 'Vite', desc: '下一代前端构建工具', license: 'MIT', url: 'https://vitejs.dev' },
  { name: 'Tailwind CSS', desc: '实用优先的 CSS 框架', license: 'MIT', url: 'https://tailwindcss.com' },
  { name: 'shadcn/ui', desc: '高质量的 React 组件集合', license: 'MIT', url: 'https://ui.shadcn.com' },
  { name: 'Framer Motion', desc: 'React 生产级动画库', license: 'MIT', url: 'https://www.framer.com/motion' },
  { name: 'Lucide', desc: '精美、一致的图标库', license: 'ISC', url: 'https://lucide.dev' },
  { name: 'Go', desc: 'Google 开发的高性能编程语言', license: 'BSD-3-Clause', url: 'https://go.dev' },
  { name: 'Python', desc: '通用高级编程语言', license: 'PSF', url: 'https://www.python.org' },
];

export function CreditsPage() {
  const { setActivePage, bgSettings } = useActivePage();
  const isImageBg = bgSettings.mode === 'image' && bgSettings.imageUrl;
  const cardClass = isImageBg ? 'bg-white/70 backdrop-blur-md' : 'bg-white';

  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">开源项目感谢</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">开源项目感谢</h1>
      <p className="text-[#8a7e6b] mb-6">感谢所有让星布谷地 Wiki 成为可能的项目与人们</p>

      {/* 开源项目 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-[#4a6741] mb-4 flex items-center gap-2">
          <Code size={18} />
          项目使用的开源项目
        </h2>
        <div className={`${cardClass} rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f1f8e9] text-[#4a6741]">
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider">项目</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">说明</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider">许可证</th>
              </tr>
            </thead>
            <tbody>
              {openSourceProjects.map((proj, idx) => (
                <tr
                  key={proj.name}
                  className={`transition-colors hover:bg-[#f8f6f1] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fdfbf7]'}`}
                >
                  <td className="px-5 py-3">
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#3d3428] hover:text-[#66a85c] transition-colors"
                    >
                      {proj.name}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-[#6b5d4d] text-xs hidden sm:table-cell">{proj.desc}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0ebe0] text-[#8a7e6b] font-medium">
                      {proj.license}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 社区共建倡议 */}
      <section>
        <h2 className="text-lg font-bold text-[#4a6741] mb-4 flex items-center gap-2">
          <Users size={18} />
          社区共建倡议
        </h2>

        <div className={`${cardClass} rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6`}>
          {/* 团队 Logo */}
          <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 pb-6 border-b border-[#f0ebe0]">
            <img
              src="/images/team-logo.png"
              alt="LUMi STUDIO"
              className="h-20 w-auto object-contain"
            />
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-[#3d3428]">LUMi STUDIO</h3>
              <p className="text-sm text-[#8a7e6b] mt-0.5">星布谷地 Wiki 开发团队</p>
            </div>
          </div>

          {/* 共建倡议 */}
          <div className="bg-[#f1f8e9] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={16} className="text-[#66a85c]" />
              <h4 className="text-sm font-bold text-[#4a6741]">社区共建倡议</h4>
            </div>
            <p className="text-xs text-[#6b5d4d] leading-relaxed mb-3">
              星布谷地 Wiki 是一个开放、自由、由社区共同驱动的项目。我们相信每一位玩家都可以为 Wiki 贡献自己的力量——无论是撰写词条、修正错误、翻译内容，还是提出建议和反馈。
            </p>
            <p className="text-xs text-[#6b5d4d] leading-relaxed mb-4">
              加入我们，让星布谷地 Wiki 成为最温暖、最全面的游戏知识库。你的每一份贡献，都会让更多玩家受益。
            </p>
            <button
              onClick={() => setActivePage('contribute')}
              className="px-5 py-2 rounded-xl bg-[#aed581] text-white text-sm font-medium hover:bg-[#9bc76d] transition-colors"
            >
              了解如何参与共建
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
