import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = ({ onOpenUpload }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-high border-t border-outline-variant/30 flex items-center justify-around z-50">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`
        }
      >
        <span className="material-symbols-outlined text-[24px]">dashboard</span>
        <span className="text-[10px] font-bold">Home</span>
      </NavLink>

      <NavLink
        to="/transactions"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`
        }
      >
        <span className="material-symbols-outlined text-[24px]">receipt_long</span>
        <span className="text-[10px] font-bold">Trans</span>
      </NavLink>

      <div className="w-12 h-12 bg-primary rounded-full -mt-8 flex items-center justify-center text-on-primary shadow-lg shadow-primary/40 border-4 border-surface cursor-pointer active:scale-90 transition-transform" onClick={onOpenUpload}>
        <span className="material-symbols-outlined text-[24px]">add</span>
      </div>

      <NavLink
        to="/budgeting"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`
        }
      >
        <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
        <span className="text-[10px] font-bold">Budget</span>
      </NavLink>

      <NavLink
        to="/reports"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`
        }
      >
        <span className="material-symbols-outlined text-[24px]">analytics</span>
        <span className="text-[10px] font-bold">Reports</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
