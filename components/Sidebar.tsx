
import React, { useState } from 'react';
import { UserRole } from '../types';
import { NAV_ITEMS, COLORS, MINISTRY_HIERARCHY } from '../constants';
import { ChevronDown, LogOut, ShieldCheck, User as UserIcon, UserRoundCheck } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentRole, onRoleChange }) => {
  const [isMinistriesOpen, setIsMinistriesOpen] = useState(false);

  // Filter navigation items based on role
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.roles && !item.roles.includes(currentRole)) return false;
    
    if (currentRole === UserRole.MIEMBRO) {
      return !['directory', 'settings', 'admin_mgmt'].includes(item.id);
    }
    return true;
  });

  const getLabel = (item: any) => {
    if (item.id === 'pastoral_inbox') {
      return currentRole === UserRole.SUPER_ADMIN || currentRole === UserRole.SUPERVISORA ? 'Buzón Pastoral' : 'Mi Buzón';
    }
    return item.label;
  };

  const getVisibleMinistries = () => {
    if (currentRole === UserRole.SUPER_ADMIN) return MINISTRY_HIERARCHY;
    if (currentRole === UserRole.SUPERVISORA) {
      // Simulamos que la supervisora logueada es Liseth Lever
      return MINISTRY_HIERARCHY.filter(group => group.pastora === "Liseth Lever");
    }
    return [];
  };

  const visibleGroups = getVisibleMinistries();

  return (
    <aside className="w-64 bg-navy-tafe text-white flex flex-col h-full shadow-2xl z-20 transition-all duration-300">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 shadow-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#49D1C5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div className="leading-tight">
          <h1 className="font-montserrat font-bold text-lg tracking-tight">TAFE ERP</h1>
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">Torre de Control</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-white text-[#004182] font-bold shadow-lg' 
                : 'hover:bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            <span className={activeTab === item.id ? 'text-[#49D1C5]' : 'text-white/40 group-hover:text-[#49D1C5]'}>
              {item.icon}
            </span>
            <span className="font-montserrat text-sm">{getLabel(item)}</span>
          </button>
        ))}
        
        <div className="pt-6 mt-6 border-t border-white/10 pb-4">
          <p className="px-4 text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Jerarquía Ministerial</p>
          <button 
            onClick={() => setIsMinistriesOpen(!isMinistriesOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-all ${
              isMinistriesOpen ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${isMinistriesOpen ? 'bg-[#49D1C5] shadow-[0_0_8px_#49D1C5]' : 'bg-white/20'}`}></span>
              {currentRole === UserRole.MIEMBRO ? 'Mi Ministerio' : (currentRole === UserRole.SUPERVISORA ? 'Mis Asignados' : '15 Ministerios')}
            </span>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isMinistriesOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isMinistriesOpen && (
            <div className="mt-2 ml-4 pl-4 border-l border-white/10 space-y-3 animate-fadeIn">
              <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2 py-1 space-y-4">
                {currentRole === UserRole.MIEMBRO ? (
                  <button className="w-full text-left px-3 py-2 text-[11px] font-bold text-[#49D1C5] bg-[#49D1C5]/10 rounded-lg">
                    CSI / Medios (Asignado)
                  </button>
                ) : (
                  visibleGroups.map((group, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-[9px] font-bold text-[#49D1C5] uppercase tracking-tighter mb-1 opacity-80 flex items-center gap-1">
                        <UserRoundCheck size={10} /> Supervisora {group.pastora.split(' ')[0]}
                      </p>
                      {group.ministries.map((m, midx) => (
                        <div key={midx} className="flex flex-col pl-2 border-l border-white/5">
                           <button className="w-full text-left py-1.5 text-[10px] text-white/60 hover:text-white transition-colors truncate font-medium">
                            {m.name}
                          </button>
                          <span className="text-[8px] text-white/20 italic ml-1">Líder: {m.leader}</span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 mx-4 mb-4 bg-slate-900/40 rounded-2xl border border-white/10 shadow-inner">
        <p className="text-[9px] text-white/40 mb-2 font-bold uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck size={10} /> Rol de Operación
        </p>
        <select 
          value={currentRole}
          onChange={(e) => {
            onRoleChange(e.target.value as UserRole);
            setIsMinistriesOpen(false);
          }}
          className="w-full bg-[#002D5A] text-white text-xs font-bold border border-white/20 rounded-xl p-3 outline-none cursor-pointer hover:bg-[#003A75] transition-all focus:ring-2 ring-[#49D1C5]/40"
        >
          <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
          <option value={UserRole.SUPERVISORA}>Supervisora Táctica</option>
          <option value={UserRole.LIDER_MINISTERIO}>Líder Ministerio</option>
          <option value={UserRole.MIEMBRO}>Miembro</option>
        </select>
      </div>

      <div className="p-6 border-t border-white/5">
        <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-500/10 rounded-xl transition-all text-white/40 hover:text-red-400 group">
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="font-montserrat text-sm font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
