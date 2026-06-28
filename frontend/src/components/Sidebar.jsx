import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onOpenUpload }) => {
  const { user, logout } = useAuth();

  // Helper to extract a friendly display name from the user's email
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (!user?.email) return 'User';
    
    const parts = user.email.split('@')[0].split(/[\._\-]/);
    const nameParts = parts
      .map((p) => p.replace(/\d+/g, '').trim())
      .filter((p) => p.length > 0);
      
    if (nameParts.length === 0) {
      return user.email.split('@')[0];
    }
    
    return nameParts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  };

  const displayName = getDisplayName();
  const displayInitial = displayName.charAt(0).toUpperCase();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Transactions', path: '/transactions', icon: 'receipt_long' },
    { name: 'Budgeting', path: '/budgeting', icon: 'account_balance_wallet' },
    { name: 'Reports', path: '/reports', icon: 'analytics' }
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container dark:bg-surface-container-low/50 backdrop-blur-md border-r border-outline-variant/20 shadow-md p-md gap-sm z-50">
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-on-primary-container">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-black text-primary leading-tight">SpendLens</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Wealth Management</p>
        </div>
      </div>

      <nav className="flex-1 mt-6 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 scale-100 active:scale-[0.98] font-label-md text-label-md ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-outline-variant/20 flex flex-col gap-1">
        <button
          onClick={onOpenUpload}
          className="w-full bg-primary py-3 px-4 rounded-xl text-on-primary font-bold text-label-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all mb-4 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
          Upload Statement
        </button>

        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary uppercase border border-primary/20">
            {displayInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-md text-label-md text-on-surface truncate font-semibold">{displayName}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{user?.email || 'Premium Plan'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all w-full text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
