import React, { useState } from 'react';
import { User, Task, UserRole } from '../types';
import { Bell, ChevronDown } from 'lucide-react';
import TurnoCSI from './TurnoCSI';
import FacebookSection from './FacebookSection';

interface MinistryPanelProps {
  user: User;
  tasks: Task[];
  onAddTask: (task: Task) => void;
}

const MinistryPanel: React.FC<MinistryPanelProps> = ({ user, tasks }) => {
  const supervisoraMinistries = ["CSI / Medios", "Alabanza"];
  const [activeMinistry, setActiveMinistry] = useState(user.ministry || supervisoraMinistries[0]);
  const [showSelector, setShowSelector] = useState(false);

  const isSupervisora = user.role === UserRole.SUPERVISORA;
  const canEdit = user.role === UserRole.SUPER_ADMIN
    || user.role === UserRole.SUPERVISORA
    || user.role === UserRole.LIDER_MINISTERIO;

  const activeTaskCount = tasks.filter(t => t.ministry === activeMinistry && t.status !== 'COMPLETED').length;

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Header */}
      <div className="bg-navy-tafe p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-turqui/20 text-turqui text-[10px] font-bold rounded-lg uppercase tracking-widest border border-turqui/30">
                {isSupervisora ? 'Control Supervisión Táctica' : 'Operaciones Activas'}
              </span>
              <Bell className="text-turqui animate-bounce" size={16} />
            </div>

            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-montserrat font-bold">
                Panel: <span className="text-turqui">{activeMinistry}</span>
              </h2>
              {isSupervisora && (
                <div className="relative">
                  <button
                    onClick={() => setShowSelector(!showSelector)}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10"
                  >
                    <ChevronDown size={20} />
                  </button>
                  {showSelector && (
                    <div className="absolute top-12 left-0 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-slideDown border border-slate-100">
                      <p className="p-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        Seleccionar Ministerio
                      </p>
                      {supervisoraMinistries.map(m => (
                        <button
                          key={m}
                          onClick={() => { setActiveMinistry(m); setShowSelector(false); }}
                          className={`w-full text-left px-6 py-4 text-xs font-bold transition-all hover:bg-slate-50 ${activeMinistry === m ? 'text-turqui bg-turqui/5' : 'text-slate-600'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-white/40 text-sm mt-3 max-w-xl italic">
              {isSupervisora
                ? `Supervisando el engranaje de ${activeMinistry}.`
                : 'Horario de turnos y servicios del equipo CSI.'}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center min-w-[140px]">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Tareas Activas</p>
              <p className="text-lg font-bold">{activeTaskCount}</p>
              <p className="text-[10px] text-turqui font-bold">Pendientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Turno de Servicio CSI — tabla principal */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <TurnoCSI canEdit={canEdit} />
      </section>

      {/* Feed Facebook TAFE */}
      <FacebookSection />

    </div>
  );
};

export default MinistryPanel;