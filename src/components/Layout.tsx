import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Building, Users, ArrowDownCircle, ArrowUpCircle, FileText } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navItems = [
    { name: 'Daftar Suplier', path: '/supliers', icon: Users },
    { name: 'Daftar Departemen', path: '/departments', icon: Building },
    { name: 'Daftar Barang', path: '/items', icon: Package },
    { name: 'Barang Masuk', path: '/incoming', icon: ArrowDownCircle },
    { name: 'Barang Keluar', path: '/outgoing', icon: ArrowUpCircle },
    { name: 'Laporan', path: '/reports', icon: FileText },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-6 text-sidebar-primary">RSUD Inventory</h2>
        <ScrollArea className="flex-grow">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-background text-foreground">
        {children}
      </main>
    </div>
  );
};

export default Layout;