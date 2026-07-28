import { ThemeModeToggle } from './theme-mode-toggle';
import { Separator } from '@/client/ui/components/ui/separator';
import { SidebarTrigger } from '@/client/ui/components/ui/sidebar';
import { useGetActiveRoute } from '../hooks/use-get-active-route';

export function SiteHeader() {
  const activeRoute = useGetActiveRoute();

  return (
    <header className="bg-glass sticky top-0 z-50 h-(--header-height) w-full shrink-0 items-center gap-2 border-b border-gray-200/50 bg-white/70 py-2 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) dark:border-white/10 dark:bg-zinc-900/70">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{activeRoute?.title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeModeToggle />
        </div>
      </div>
    </header>
  );
}
