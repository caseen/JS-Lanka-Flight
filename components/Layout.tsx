
import React from 'react';
import { Menu, X, Plane, LogOut } from 'lucide-react';
import { AppView } from '../types';
import { NAV_ITEMS } from '../constants';
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
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-blue-700 text-white transition-all duration-300 ease-in-out flex flex-col z-50`}
      >
        <div className="p-4 flex items-center gap-3 border-b border-blue-600 h-16 shrink-0">
          <Plane className="text-orange-400 shrink-0" size={32} />
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight leading-none">JS Lanka<br/><span className="text-xs font-medium text-blue-200">Travels</span></span>}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as AppView)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'hover:bg-blue-600 text-blue-100'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-600">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {isSidebarOpen && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">
            {NAV_ITEMS.find(i => i.id === currentView)?.label}
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logged in as</p>
                <p className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
                {user.email?.[0].toUpperCase()}
              </div>
            </div>
            <button 
              onClick={onSignOut}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all group"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
