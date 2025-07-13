
import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, Users, MessageCircle, Bell, Settings, User, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  onLogout: () => void;
}

const Layout = ({ onLogout }: LayoutProps) => {
  const location = useLocation();
  const [isAdmin] = useState(false); // This would come from auth context
  
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/swap', icon: Users, label: 'Swap' },
    { path: '/chats', icon: MessageCircle, label: 'Chats' },
    { path: '/notifications', icon: Bell, label: 'Alerts' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', icon: Shield, label: 'Admin' });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-colors",
                  isActive(item.path) 
                    ? "text-[#875A7B] bg-[#F3F0F2]" 
                    : "text-gray-500 hover:text-[#875A7B]"
                )}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:bottom-0 md:w-64 md:bg-white md:border-r md:border-gray-200 md:flex md:flex-col md:z-40">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#875A7B]">SkillSwap</h1>
        </div>
        <nav className="flex-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-colors",
                  isActive(item.path)
                    ? "bg-[#875A7B] text-white"
                    : "text-gray-600 hover:bg-[#F3F0F2] hover:text-[#875A7B]"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full flex items-center gap-2 text-gray-600 hover:text-red-600 hover:border-red-600"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
