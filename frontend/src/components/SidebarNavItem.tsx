import type { PageId } from '@/types';
import { useActivePage } from '@/hooks/useActivePage';

interface SidebarNavItemProps {
  pageId: PageId;
  label: string;
  icon: React.ReactNode;
  indent?: boolean;
  collapsed?: boolean;
}

export function SidebarNavItem({ pageId, label, icon, indent = false, collapsed = false }: SidebarNavItemProps) {
  const { activePage, setActivePage, setSidebarOpen } = useActivePage();
  const isActive = activePage === pageId;

  return (
    <button
      onClick={() => {
        setActivePage(pageId);
        setSidebarOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      title={collapsed ? label : undefined}
      className={`
        relative flex items-center rounded-xl
        text-sm transition-all duration-200 group
        ${collapsed
          ? 'w-10 h-10 mx-auto justify-center'
          : indent
            ? 'w-[calc(100%-1.25rem)] ml-5 px-3 py-2 gap-3'
            : 'w-full px-3 py-2 gap-3'
        }
        ${isActive
          ? 'bg-[#e8f5e9] text-[#2e7d32] font-semibold shadow-[0_1px_4px_rgba(46,125,50,0.08)]'
          : 'text-[#6b5d4d] font-medium hover:bg-[#f0ebe0] hover:text-[#4a3f32]'
        }
      `}
    >
      {isActive && !collapsed && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#66bb6a]" />
      )}
      <span className={`shrink-0 transition-colors ${
        isActive ? 'text-[#66bb6a]' : 'text-[#a89b8c] group-hover:text-[#7a6b5a]'
      }`}>
        {icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}
