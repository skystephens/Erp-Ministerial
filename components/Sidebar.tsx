
import React, { useState } from 'react';
import { UserRole } from '../types';
import { NAV_SECTIONS, MINISTRY_HIERARCHY } from '../constants';
import { ChevronDown, LogOut, ShieldCheck, UserRoundCheck, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentRole, onRoleChange, onLogout }) => {
  // Start with all sections open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sec_medios: true,
    sec_ministerial: true,
    sec_personas: true,
    sec_admin: true,
  });
  const [isMinistriesOpen, setIsMinistriesOpen] = useState(false);

  const toggleSection = (id: string) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const canSeeSection = (roles?: UserRole[]) =>
    !roles || roles.includes(currentRole);

  const canSeeItem = (roles?: UserRole[]) =>
    !roles || roles.includes(currentRole);

  const getVisibleMinistries = () => {
    if (currentRole === UserRole.SUPER_ADMIN) return MINISTRY_HIERARCHY;
    if (currentRole === UserRole.SUPERVISORA)
      return MINISTRY_HIERARCHY.filter(g => g.pastora === 'Liseth Lever');
    return [];
  };

  const getPastoralLabel = () => {
    if (currentRole === UserRole.SUPER_ADMIN || currentRole === UserRole.SUPERVISORA)
      return 'Buzón Pastoral';
    return 'Mi Buzón';
  };

  const getItemLabel = (id: string, label: string) =>
    id === 'pastoral_inbox' ? getPastoralLabel() : label;

  return (
    <aside className="w-64 bg-navy-tafe text-white flex flex-col h-full shadow-2xl z-20">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3 shrink-0">
        <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 shadow-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#49D1C5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div className="leading-tight">
          <h1 className="font-montserrat font-bold text-lg tracking-tight">TAFE ERP</h1>
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">Torre de Control</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar space-y-1 pb-4">

        {/* Dashboard — siempre visible, fuera de secciones */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
            activeTab === 'dashboard'
              ? 'bg-white text-[#004182] font-bold shadow-lg'
              : 'hover:bg-white/5 text-white/70 hover:text-white'
          }`}
        >
          <span className={activeTab === 'dashboard' ? 'text-[#49D1C5]' : 'text-white/40 group-hover:text-[#49D1C5]'}>
            <LayoutDashboard size={18} />
          </span>
          <span className="font-montserrat text-sm">Dashboard</span>
        </button>

        {/* Secciones */}
        {NAV_SECTIONS.map(section => {
          if (!canSeeSection(section.roles)) return null;

          const visibleItems = section.items.filter(item => canSeeItem(item.roles));
          if (visibleItems.length === 0) return null;

          const isOpen = openSections[section.id];
          const sectionActive = visibleItems.some(i => i.id === activeTab);

          return (
            <div key={section.id} className="pt-2">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group ${
                  sectionActive && !isOpen
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`${sectionActive ? 'text-turqui' : 'text-white/30 group-hover:text-turqui'} transition-colors`}>
                    {section.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] font-montserrat">
                    {section.label}
                  </span>
                </span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Section items */}
              {isOpen && (
                <div className="ml-2 pl-3 border-l border-white/10 mt-1 space-y-0.5">
                  {visibleItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                        activeTab === item.id
                          ? 'bg-white text-[#004182] font-bold shadow-md'
                          : 'hover:bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className={activeTab === item.id ? 'text-[#49D1C5]' : 'text-white/30 group-hover:text-[#49D1C5]'}>
                        {item.icon}
                      </span>
                      <span className="font-montserrat text-sm">{getItemLabel(item.id, item.label)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Jerarquía Ministerial */}
        <div className="pt-4 mt-2 border-t border-white/10">
          <button
            onClick={() => setIsMinistriesOpen(!isMinistriesOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-all ${
              isMinistriesOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full transition-all ${isMinistriesOpen ? 'bg-turqui shadow-[0_0_8px_#49D1C5]' : 'bg-white/20'}`} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                {currentRole === UserRole.MIEMBRO ? 'Mi Ministerio' : currentRole === UserRole.SUPERVISORA ? 'Mis Asignados' : '15 Ministerios'}
              </span>
            </span>
            <ChevronDown size={13} className={`transition-transform duration-200 ${isMinistriesOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMinistriesOpen && (
            <div className="mt-1 ml-2 pl-3 border-l border-white/10 max-h-56 overflow-y-auto custom-scrollbar pr-1 space-y-3 py-2 animate-fadeIn">
              {currentRole === UserRole.MIEMBRO ? (
                <button className="w-full text-left px-3 py-2 text-[11px] font-bold text-turqui bg-turqui/10 rounded-lg">
                  CSI / Medios (Asignado)
                </button>
              ) : (
                getVisibleMinistries().map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[9px] font-bold text-turqui uppercase tracking-tighter flex items-center gap-1 opacity-80">
                      <UserRoundCheck size={10} /> {group.pastora.split(' ')[0]}
                    </p>
                    {group.ministries.map((m, midx) => (
                      <div key={midx} className="pl-2 border-l border-white/5">
                        <button className="w-full text-left py-1 text-[10px] text-white/55 hover:text-white transition-colors truncate font-medium">
                          {m.name}
                        </button>
                        <span className="text-[8px] text-white/20 italic ml-1">Líder: {m.leader}</span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Role selector */}
      <div className="p-4 mx-4 mb-4 bg-slate-900/40 rounded-2xl border border-white/10 shadow-inner shrink-0">
        <p className="text-[9px] text-white/40 mb-2 font-bold uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck size={10} /> Rol de Operación
        </p>
        <select
          value={currentRole}
          onChange={e => {
            onRoleChange(e.target.value as UserRole);
            setIsMinistriesOpen(false);
          }}
          className="w-full bg-[#002D5A] text-white text-xs font-bold border border-white/20 rounded-xl p-3 outline-none cursor-pointer hover:bg-[#003A75] transition-all focus:ring-2 ring-turqui/40"
        >
          <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
          <option value={UserRole.SUPERVISORA}>Supervisora Táctica</option>
          <option value={UserRole.LIDER_MINISTERIO}>Líder Ministerio</option>
          <option value={UserRole.MIEMBRO}>Miembro</option>
        </select>
      </div>

      {/* Logout */}
      <div className="px-6 pb-6 shrink-0 border-t border-white/5">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-500/10 rounded-xl transition-all text-white/40 hover:text-red-400 group mt-4"
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="font-montserrat text-sm font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
