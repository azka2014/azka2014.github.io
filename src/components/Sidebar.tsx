import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Building, Users, ArrowDownToLine, ArrowUpFromLine, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility is available

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Barang', href: '/items', icon: Package },
    { name: 'Suplier', href: '/suppliers', icon: Users },
    { name: 'Departemen', href: '/departments', icon: Building },
    { name: 'Barang Masuk', href: '/incoming', icon: ArrowDownToLine },
    { name: 'Barang Keluar', href: '/outgoing', icon: ArrowUpFromLine },
    { name: 'Laporan', href: '/reports', icon: FileText },
  ];

  return (
    <div className={cn("flex flex-col space-y-2 p-4 border-r bg-sidebar text-sidebar-foreground", className)}>
      <h2 className="text-lg font-semibold mb-4 text-sidebar-primary">Menu Navigasi</h2>
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;