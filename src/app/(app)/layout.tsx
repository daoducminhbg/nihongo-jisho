import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Topbar } from '@/components/layout/topbar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen md:ml-[260px]">
        {/* Mobile Top Bar */}
        <Topbar user={user} />

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
