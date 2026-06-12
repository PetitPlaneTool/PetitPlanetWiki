import { useActivePage } from '@/hooks/useActivePage';

export function SidebarLogo() {
  const { sidebarCollapsed, setActivePage } = useActivePage();

  if (sidebarCollapsed) return null;

  return (
    <button
      onClick={() => setActivePage('home')}
      className="h-24 flex items-center justify-center px-2 pt-2"
    >
      <img
        src="/images/logo.png"
        alt="星布谷地"
        className="h-[72px] w-auto object-contain drop-shadow-sm"
      />
    </button>
  );
}
