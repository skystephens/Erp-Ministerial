import React, { useState } from 'react';
import { User, Task, UserRole } from '../types';
import {
  Zap,
  Layers,
  PlusCircle,
  AlertTriangle,
  Send,
  Bell,
  ChevronDown,
  ArrowRight,
  Users
} from 'lucide-react';
import { MINISTRY_DETAILS } from '../constants';
import HorarioCSI from './HorarioCSI';

interface Requirement {
  id: string;
  author: string;
  content: string;
  urgency: 'ALTA' | 'MEDIA' | 'BAJA';
  status: 'PENDIENTE' | 'ACEPTADO';
}

interface MinistryPanelProps {
  user: User;
  tasks: Task[];
  onAddTask: (task: Task) => void;
}

const MinistryPanel: React.FC<MinistryPanelProps> = ({ user, tasks, onAddTask }) => {
  const supervisoraMinistries = ["CSI / Medios", "Alabanza"];
  const [activeMinistry, setActiveMinistry] = useState(user.ministry || supervisoraMinistries[0]);
  const [showSelector, setShowSelector] = useState(false);

  const [requirements, setRequirements] = useState<Requirement[]>([
    { id: 'r1', author: 'Pedro R.', content: 'Revisar conexión HDMI Cámara Principal', urgency: 'ALTA', status: 'PENDIENTE' },
    { id: 'r2', author: 'Marta S.', content: 'Actualizar visuales de TAFE News', urgency: 'MEDIA', status: 'PENDIENTE' }
  ]);
  const [newReq, setNewReq] = useState('');
  
  const details = MINISTRY_DETAILS[activeMinistry] || MINISTRY_DETAILS["CSI / Medios"];
  const isMedios = activeMinistry === "CSI / Medios";
  const isSupervisora = user.role === UserRole.SUPERVISORA;

  const handleAddRequirement = () => {
    if (!newReq.trim()) return;
    const req: Requirement = {
      id: `r${Date.now()}`,
      author: user.name,
      content: newReq,
      urgency: 'MEDIA',
      status: 'PENDIENTE'
    };
    setRequirements([req, ...requirements]);
    setNewReq('');
  };

  const handleAcceptRequirement = (req: Requirement) => {
    const newTask: Task = {
      id: `t_${Date.now()}`,
      title: req.content,
      description: `Requerimiento interno de ${req.author}: ${req.content}`,
      ministry: activeMinistry,
      assignedTo: user.id,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      category: 'TECNICO',
      isUrgent: req.urgency === 'ALTA',
      axis: 'E5_ALABANZA_AV'
    };
    
    onAddTask(newTask);
    setRequirements(prev => prev.map(r => r.id === req.id ? { ...r, status: 'ACEPTADO' } : r));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header del Micro-sitio */}
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
                      <p className="p-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Seleccionar Ministerio</p>
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
              {isSupervisora ? `Supervisando el engranaje de ${activeMinistry}.` : `Control de activos y requerimientos CSI / Medios.`}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center min-w-[140px]">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Tareas Hoy</p>
              <p className="text-lg font-bold">{tasks.filter(t => t.ministry === activeMinistry).length}</p>
              <p className="text-[10px] text-turqui font-bold">Activas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Requerimientos */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-montserrat font-bold text-slate-800 mb-6 flex items-center gap-3">
              <AlertTriangle className="text-amber-500" /> Requerimientos del Equipo
            </h3>
            
            <div className="mb-6 flex gap-2">
              <input 
                type="text" 
                placeholder="¿Qué se necesita?" 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 ring-turqui"
                value={newReq}
                onChange={(e) => setNewReq(e.target.value)}
              />
              <button onClick={handleAddRequirement} className="p-2 bg-turqui text-white rounded-xl hover:bg-turqui/80 transition-all">
                <PlusCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {requirements.map((req) => (
                <div key={req.id} className={`p-4 rounded-2xl border transition-all ${req.status === 'ACEPTADO' ? 'bg-slate-50 opacity-50 border-transparent' : 'bg-white border-slate-100 hover:border-turqui/30'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-lg ${req.urgency === 'ALTA' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                      {req.urgency}
                    </span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase">{req.author}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mb-3">{req.content}</p>
                  
                  {req.status === 'PENDIENTE' ? (
                    <button 
                      onClick={() => handleAcceptRequirement(req)}
                      className="w-full py-2 bg-turqui/10 text-turqui text-[9px] font-bold rounded-xl border border-turqui/20 hover:bg-turqui hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Zap size={10} /> Aceptar como Tarea
                    </button>
                  ) : (
                    <div className="text-[9px] font-bold text-emerald-500 flex items-center justify-center gap-2">
                       <Send size={10} /> Tarea vinculada en Operaciones
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Columna Derecha: Pipeline Semana 1 */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
                <Layers className="text-turqui" /> Flujo Semana 1: Conquista
              </h3>
              <span className="text-[9px] font-bold bg-slate-900 text-white px-4 py-1.5 rounded-full uppercase tracking-widest">Plan TAFE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-xl bg-turqui text-white flex items-center justify-center shadow-lg shadow-turqui/20">
                        <Camera size={16} />
                     </div>
                     <h4 className="text-xs font-bold text-slate-800">Captura Evangelismo (E1)</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-4">Registro de testimonios reales para alimentar la fe de la congregación.</p>
                  {tasks.filter(t => t.id === 'med_e1_1').map(t => (
                    <div key={t.id} className="flex items-center justify-between text-[9px] font-bold text-turqui uppercase mt-2">
                       <span>{t.status}</span>
                       <ArrowRight size={14} />
                    </div>
                  ))}
               </div>

               <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-xl bg-navy-tafe text-white flex items-center justify-center shadow-lg shadow-navy-tafe/20">
                        <Users size={16} />
                     </div>
                     <h4 className="text-xs font-bold text-slate-800">Data Bridge (E3)</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-4">Conversión de captura audiovisual en fichas de prospectos mapeados.</p>
                  {tasks.filter(t => t.id === 'med_e3_1').map(t => (
                    <div key={t.id} className="flex items-center justify-between text-[9px] font-bold text-navy-tafe uppercase mt-2">
                       <span>{t.status}</span>
                       <ArrowRight size={14} />
                    </div>
                  ))}
               </div>
            </div>

            <div className="mt-8 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Todas las Acciones Activas</h4>
              {tasks.filter(t => t.ministry === activeMinistry).map(task => (
                <div key={task.id} className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${task.isUrgent ? 'bg-red-500' : 'bg-turqui'}`} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{task.title}</h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{task.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-turqui bg-turqui/5 px-2 py-1 rounded-lg border border-turqui/10">{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Horario de Servicios CSI — full width */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <HorarioCSI canEdit={user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SUPERVISORA || user.role === UserRole.LIDER_MINISTERIO} />
      </section>
    </div>
  );
};

const TechStatusCard = ({ icon, label, status, color }: any) => (
  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
    <div className="text-turqui/60">{icon}</div>
    <p className="text-[9px] font-bold uppercase text-white/40">{label}</p>
    <p className={`text-[10px] font-bold ${color}`}>{status}</p>
  </div>
);

export default MinistryPanel;