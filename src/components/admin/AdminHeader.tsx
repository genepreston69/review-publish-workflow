
import { Header } from '@/components/Header';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Shield } from 'lucide-react';

interface AdminHeaderProps {
  isSuperAdmin: boolean;
  pageTitle: string;
}

export function AdminHeader({ isSuperAdmin, pageTitle }: AdminHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b">
      <Header />
      <div className="flex items-center gap-2 px-4 py-2 border-b">
        {!isSuperAdmin && <SidebarTrigger />}
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>
      </div>
    </div>
  );
}
