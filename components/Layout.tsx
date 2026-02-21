import React, { useState } from 'react';
import { Menu, X, Plane, LogOut, Bell, Trash2, AlertCircle } from 'lucide-react';
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
  notifications?: {id: string, message: string, time: Date}[];
  onClearNotifications?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setCurrentView, 
  isSidebarOpen, 
  setIsSidebarOpen,
  user,
  onSignOut,
  notifications = [],
  onClearNotifications
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const initiateSignOut = () => {
    setIsLogoutConfirmOpen(true);
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

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Confirm Logout</h3>
                <p className="text-sm text-slate-500 mt-2">Are you sure you want to end your session and sign out of JS Lanka Travels?</p>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <button 
                  onClick={onSignOut}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-100 transition-all active:scale-95 text-xs tracking-widest uppercase"
                >
                  Sign Out
                </button>
                <button 
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all text-xs uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-[70] transition-transform duration-300 ease-in-out transform
          ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full'}
          lg:translate-x-0 lg:relative ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
          bg-blue-700 text-white flex flex-col shadow-2xl lg:shadow-none
        `}
      >
        <div className="p-4 flex items-center gap-3 border-b border-blue-600/50 h-16 shrink-0 overflow-hidden">
          <Plane className="text-orange-300 shrink-0" size={28} strokeWidth={2.5} />
          {(isSidebarOpen || isMobileMenuOpen) && (
            <div className="flex items-center gap-1.5 leading-none truncate">
              <span className="font-black text-sm tracking-tighter text-white uppercase whitespace-nowrap">JS LANKA</span>
              <span className="text-[10px] font-bold text-blue-300 tracking-widest uppercase whitespace-nowrap">TRAVELS</span>
            </div>
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
            onClick={initiateSignOut}
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

          <div className="flex items-center gap-2 lg:gap-6">
            {/* Notification Hub */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-2 rounded-lg transition-all relative ${isNotificationOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>

              {isNotificationOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-slideDown">
                    <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Recent Activity</h3>
                      {notifications.length > 0 && (
                        <button onClick={onClearNotifications} className="text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed mb-1">{n.message}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                              {n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                          <Bell size={32} className="mx-auto mb-2 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No recent alerts</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

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
              onClick={initiateSignOut}
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