import React, { useState } from 'react';
import { Menu, X, Plane, LogOut } from 'lucide-react';
import { AppView } from '../types.ts';
import { NAV_ITEMS } from '../constants.tsx';
import { User } from '@supabase/supabase-js';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  user: User;
  onSignOut: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setCurrentView, 
  isSidebarOpen, 
  setIsSidebarOpen,
  user,
  onSignOut
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive Drawer */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-[70] transition-transform duration-300 ease-in-out transform
          ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full'}
          lg:translate-x-0 lg:relative ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
          bg-blue-700 text-white flex flex-col shadow-2xl lg:shadow-none
        `}
      >
        <div className="p-4 flex items-center gap-3 border-b border-blue-600 h-16 shrink-0">
          <Plane className="text-orange-400 shrink-0" size={32} />
          {(isSidebarOpen || isMobileMenuOpen) && (
            <span className="font-bold text-lg tracking-tight leading-none">
              JS Lanka<br/><span className="text-xs font-medium text-blue-200">Travels</span>
            </span>
          )}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as AppView)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                currentView === item.id 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'hover:bg-blue-600 text-blue-100'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-600 space-y-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex items-center gap-3 text-blue-200 hover:text-white transition-colors w-full"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {isSidebarOpen && <span>Collapse Sidebar</span>}
          </button>
          
          <button 
            onClick={onSignOut}
            className="flex lg:hidden items-center gap-3 text-rose-200 hover:text-rose-100 transition-colors w-full p-2"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-slate-800 truncate max-w-[150px] sm:max-w-none">
              {NAV_ITEMS.find(i => i.id === currentView)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Logged in</p>
                <p className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{user.email}</p>
              </div>
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm shrink-0">
                {user.email?.[0].toUpperCase()}
              </div>
            </div>
            <button 
              onClick={onSignOut}
              className="hidden lg:flex p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;