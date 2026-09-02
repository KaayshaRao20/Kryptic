import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CustomerHeaderBanner } from './CustomerHeaderBanner';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-background">
        <CustomerHeaderBanner />
        <Outlet />
      </main>
    </div>
  );
};
