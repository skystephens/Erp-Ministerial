
import React from 'react';
import { User } from '../types';
import { Bell, Search, Settings } from 'lucide-react';

interface HeaderProps {
  user: User;
  notificationCount: number;
  onClearNotifications: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, notificationCount, onClearNotifications }) => {
  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="bg-slate-50 flex items-center px-4 py-2 rounded-2xl w-96 border border-slate-200">
          <Search size={18} className="text-slate-300" />
          <input 
            type="text" 
            placeholder="Buscar tareas, talentos o procesos..." 
            className="bg-transparent border-none outline-none ml-2 text-sm w-full placeholder:text-slate-300"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={onClearNotifications}
          className="text-slate-400 hover:text-turqui relative transition-colors p-2 hover:bg-slate-50 rounded-xl"
        >
          <Bell size={20} className={notificationCount > 0 ? 'animate-swing origin-top' : ''} />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white font-bold">
              {notificationCount}
            </span>
          )}
        </button>
        <button className="text-slate-400 hover:text-turqui transition-colors p-2 hover:bg-slate-50 rounded-xl">
          <Settings size={20} />
        </button>
        
        <div className="h-6 w-[1px] bg-slate-100 mx-2"></div>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
            <p className="text-[9px] text-[#004182] font-bold uppercase tracking-widest mt-0.5">Rol: {user.role.replace('_', ' ')}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-turqui/10 border-2 border-turqui/20 overflow-hidden flex items-center justify-center shadow-sm">
            <img src={`https://picsum.photos/seed/${user.id}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
