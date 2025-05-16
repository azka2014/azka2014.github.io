import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - hidden on small screens, fixed width on medium and larger */}
      <Sidebar className="w-64 hidden md:block flex-shrink-0" />

      {/* Main content area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Outlet will render the matched child route component */}
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;