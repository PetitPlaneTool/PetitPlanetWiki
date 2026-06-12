import { useActivePage } from '@/hooks/useActivePage';

import { recipes } from '@/data/wikiData';

export function CookingPage() {
  const { setActivePage } = useActivePage();

  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">菜肴</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">菜肴</h1>
      <p className="text-[#8a7e6b] mb-6">收集食材，烹饪美味料理</p>

      {recipes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
          <p className="text-[#8a7e6b]">内容正在建设中，敬请期待...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <div
              key={recipe.name}
              className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:translate-y-[-6px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)]"
            >
              <h3 className="font-bold text-lg text-[#3d3428] mb-2">{recipe.name}</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {recipe.ingredients.map((ing) => (
                  <span key={ing} className="text-xs px-2.5 py-1 rounded-full bg-[#fff8e1] text-[#e65100]">
                    {ing}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 text-sm text-[#8a7e6b]">
                <span>恢复 <span className="font-semibold text-[#66a85c]">{recipe.energy}</span> 能量</span>
                <span>售价 <span className="font-semibold text-[#e6a93f]">{recipe.sell} G</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
