import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] transition-colors duration-200">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Header
        collapsed={collapsed}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />
      <main
        className={`pt-20 pb-12 px-6 transition-all duration-300 ease-in-out ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet context={{ selectedProjectId }} />
        </div>
      </main>
    </div>
  );
};
