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
    // Changed background to green-700, text to white, title to gray-200, hover states
    <div className={cn("flex flex-col space-y-2 p-4 border-r bg-green-700 text-gray-100", className)}>
      <h2 className="text-lg font-semibold mb-4 text-gray-200">Menu Navigasi</h2>
      <nav className="flex flex-col space-y-1 flex-grow"> {/* Added flex-grow to push copyright to bottom */}
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            // Adjusted hover background and text color for contrast on green
            className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-green-600 hover:text-white transition-colors"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      {/* Copyright text at the bottom */}
      <div className="mt-auto pt-4 text-center text-xs text-gray-300"> {/* Added mt-auto to push it down */}
        Copyright by Muhammad Safry, 2025
      </div>
    </div>
  );
};

export default Sidebar;