
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface AdminHeaderProps {
  isSuperAdmin: boolean;
  pageTitle: string;
}

export function AdminHeader({ isSuperAdmin, pageTitle }: AdminHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 bg-white border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex-1">
        <h1 className="font-semibold">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
      </div>
    </header>
  );
}
