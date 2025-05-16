import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { Package, Building, Users, ArrowDownToLine, ArrowUpFromLine, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation(); // Get current location

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Barang', href: '/items', icon: Package },
    { name: 'Suplier', href: '/suppliers', icon: Users },
    { name: 'Departemen', href: '/departments', icon: Building },
    { name: 'Barang Masuk', href: '/incoming', icon: ArrowDownToLine },
    { name: 'Barang Keluar', href: '/outgoing', icon: ArrowUpFromLine },
    // Mengganti link Laporan umum dengan link spesifik
    { name: 'Laporan Barang Masuk', href: '/reports/incoming', icon: FileText },
    { name: 'Laporan Barang Keluar', href: '/reports/outgoing', icon: FileText },
  ];

  return (
    <div className={cn("flex flex-col space-y-2 p-4 border-r bg-green-700 text-gray-100", className)}>
      <h2 className="text-lg font-semibold mb-4 text-gray-200">Menu Navigasi</h2>
      <nav className="flex flex-col space-y-1 flex-grow">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            // Add active class based on current location
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors",
              location.pathname === item.href
                ? "bg-green-600 text-white" // Active state
                : "hover:bg-green-600 hover:text-white" // Inactive state
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-4 text-center text-xs text-gray-300">
        Copyright by Muhammad Safry, 2025
      </div>
    </div>
  );
};

export default Sidebar;