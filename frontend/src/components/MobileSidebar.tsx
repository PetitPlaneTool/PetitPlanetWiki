import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { useActivePage } from '@/hooks/useActivePage';

export function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useActivePage();

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden fixed top-3 left-3 z-40 p-2.5 rounded-xl bg-[#faf6ef]/90 backdrop-blur border border-[#e8e0d5] text-[#6b5d4d] shadow-sm">
          <Menu size={18} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 border-r-[#ede5d8] bg-transparent">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
