
import React, { useState } from 'react';
import { Task, UserRole, ApostolicAxis } from '../types';
import { 
  BarChart3, 
  Users, 
  Zap, 
  TrendingUp, 
  Target, 
  Clock, 
  Activity,
  ArrowRight,
  MonitorPlay,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  MousePointer2
} from 'lucide-react';
import { MEDIA_STRATEGY_PROJECTS } from '../constants';

interface MediaStrategyProps {
  tasks: Task[];
  role: UserRole;
}

const MediaStrategy: React.FC<MediaStrategyProps> = ({ tasks, role }) => {
  const [activeProject, setActiveProject] = useState(MEDIA_STRATEGY_PROJECTS[0]);

  const mediaTasks = tasks.filter(t => t.ministry === "CSI / Medios");
  const totalHours = mediaTasks.reduce((acc, t) => acc + (t.estimatedHours || 2), 0);
  const teamNeeded = mediaTasks.reduce((acc, t) => acc + (t.teamSizeRequired || 1), 0);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Header Estratégico */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-slate-900 text-turqui rounded-[1.8rem] shadow-xl">
              <BarChart3 size={34} />
           </div>
           <div>
              <h2 className="text-2xl font-montserrat font-bold text-slate-800">Estrategia y Capacidad de Medios</h2>
              <p className="text-slate-500 text-sm">"Excelencia en el Recipiente para que brille el Contenido"</p>
           </div>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 flex items-center gap-3">
              <Users size={18} className="text-slate-400" />
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Carga de Equipo</p>
                 <p className="text-sm font-bold text-slate-800">{teamNeeded} Personas Requeridas</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Proyectos Estratégicos */}
         <div className="lg:col-span-1 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Pipeline de Reino</h4>
            {MEDIA_STRATEGY_PROJECTS.map(project => (
              <button 
                key={project.id}
                onClick={() => setActiveProject(project)}
                className={`w-full text-left p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${
                  activeProject.id === project.id 
                    ? 'bg-navy-tafe text-white border-navy-tafe shadow-xl scale-[1.02]' 
                    : 'bg-white border-slate-100 text-slate-500 hover:border-turqui/30'
                }`}
              >
                 <div className="space-y-1">
                    <p className="text-xs font-bold font-montserrat">{project.name}</p>
                    <p className={`text-[9px] ${activeProject.id === project.id ? 'text-white/60' : 'text-slate-400'}`}>
                       Impacto: {project.impactAxis.split('_')[1]}
                    </p>
                 </div>
                 <ArrowRight size={14} className={activeProject.id === project.id ? 'text-turqui' : 'text-slate-200'} />
              </button>
            ))}

            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 mt-8">
               <div className="flex items-center gap-2 mb-3">
                  <Flame size={16} className="text-amber-500" />
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Alerta Burnout</p>
               </div>
               <p className="text-[10px] text-amber-600 leading-relaxed italic">
                 "El equipo de edición tiene 45h acumuladas para esta semana. Considerar delegar en Banco de Tiempo."
               </p>
            </div>
         </div>

         {/* Análisis de Capacidad y Flujo */}
         <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
               <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                  <div>
                     <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-turqui/10 text-turqui text-[10px] font-bold rounded-lg uppercase tracking-widest border border-turqui/20">
                           Proyecto Activo
                        </span>
                     </div>
                     <h3 className="text-3xl font-montserrat font-bold text-slate-800">{activeProject.name}</h3>
                     <p className="text-slate-400 text-sm mt-2 italic">{activeProject.description}</p>
                  </div>
                  
                  <div className="flex gap-4">
                     <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Horas Estimadas</p>
                        <p className="text-2xl font-mono font-bold text-navy-tafe">{activeProject.id === 'p_live' ? '12h' : '8h'}</p>
                     </div>
                  </div>
               </div>

               {/* Flujo de Trabajo Dominical (SOPs) */}
               <section className="space-y-8">
                  <h4 className="font-montserrat font-bold text-slate-800 flex items-center gap-2">
                    <Activity size={20} className="text-turqui" /> 
                    Workflow Operativo (SOPs)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                     <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[1px] bg-slate-100 -z-10" />
                     
                     <WorkflowStep 
                        phase="PRE-PRODUCCIÓN" 
                        title="Preparación Visual" 
                        status="COMPLETO" 
                        color="emerald"
                        items={['Diseño de placas', 'Guion de noticias', 'Prueba de visuales']}
                     />
                     <WorkflowStep 
                        phase="PRODUCCIÓN" 
                        title="Ejecución Live" 
                        status="EN ESPERA" 
                        color="amber"
                        items={['Soundcheck', 'Sync cámaras', 'Streaming bitrates']}
                     />
                     <WorkflowStep 
                        phase="POST-PRODUCCIÓN" 
                        title="Impacto & Redes" 
                        status="PENDIENTE" 
                        color="slate"
                        items={['Recorte de clips', 'Carga YouTube', 'Analítica de alcance']}
                     />
                  </div>
               </section>

               <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-turqui/10 rounded-2xl">
                        <Users className="text-turqui" size={24} />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-800">Cuerpo Técnico Requerido</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                           {activeProject.roles.map(r => (
                             <span key={r} className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-500 uppercase">{r}</span>
                           ))}
                        </div>
                     </div>
                  </div>
                  <button className="px-8 py-4 bg-navy-tafe text-white font-bold rounded-2xl flex items-center gap-3 shadow-xl hover:bg-[#003366] transition-all">
                     Lanzar Orden de Operación <Play size={18} fill="currentColor" />
                  </button>
               </div>
            </div>

            {/* Test de Tareas (Para usar en el test del usuario) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                  <h4 className="font-montserrat font-bold mb-6 flex items-center gap-3">
                    <Zap className="text-turqui" /> Banco de Pruebas (Tasks)
                  </h4>
                  <p className="text-xs text-white/40 mb-6 leading-relaxed">
                    Usa estas tareas para testear el flujo de aprobación y asignación de la Supervisora.
                  </p>
                  <div className="space-y-4">
                     <TestTaskItem 
                        title="Calibración PTZ" 
                        axis="E5" 
                        desc="Ajustar colorimetría de cámaras para el streaming."
                     />
                     <TestTaskItem 
                        title="Edición TAFE News" 
                        axis="E5" 
                        desc="Packaging del noticiero semanal."
                     />
                     <TestTaskItem 
                        title="Test Latencia Nodo" 
                        axis="E5" 
                        desc="Mantenimiento preventivo de red mezzanine."
                     />
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <Target className="text-turqui mb-4" size={48} />
                  <h4 className="text-lg font-montserrat font-bold text-slate-800">Meta Estratégica</h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto italic">
                     "Que no sea el ruido técnico el que impida que una familia reciba la palabra de Dios."
                  </p>
                  <div className="w-full h-2 bg-slate-100 rounded-full mt-8 overflow-hidden">
                     <div className="w-[88%] h-full bg-turqui shadow-[0_0_10px_#49D1C5]" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Excelencia Operativa: 88%</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const WorkflowStep = ({ phase, title, status, items, color }: any) => {
  const colorMap = {
    emerald: 'bg-emerald-500 border-emerald-500 text-emerald-500',
    amber: 'bg-amber-500 border-amber-500 text-amber-500',
    slate: 'bg-slate-300 border-slate-300 text-slate-400'
  };
  
  const current = colorMap[color as keyof typeof colorMap];

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-turqui transition-all z-10">
       <div className="flex items-center gap-2 mb-4">
          <div className={`w-1.5 h-6 rounded-full ${current.split(' ')[0]}`} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{phase}</p>
       </div>
       <h5 className="font-bold text-slate-800 text-sm mb-1">{title}</h5>
       <p className={`text-[9px] font-bold uppercase mb-4 ${current.split(' ')[2]}`}>{status}</p>
       
       <div className="space-y-2">
          {items.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-slate-200" />
               <span className="text-[10px] text-slate-500">{item}</span>
            </div>
          ))}
       </div>
    </div>
  );
};

const TestTaskItem = ({ title, axis, desc }: any) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 cursor-pointer group transition-all">
     <div className="flex justify-between items-start mb-2">
        <h5 className="text-xs font-bold text-white group-hover:text-turqui transition-colors">{title}</h5>
        <span className="text-[8px] font-bold px-1.5 py-0.5 bg-turqui/20 text-turqui rounded border border-turqui/20">{axis}</span>
     </div>
     <p className="text-[10px] text-white/40 leading-tight">{desc}</p>
  </div>
);

export default MediaStrategy;
