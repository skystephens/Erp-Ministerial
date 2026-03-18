
import React, { useState } from 'react';
import { UserRole, ApostolicAxis, User, Task } from '../types';
import { 
  Layers, 
  Activity,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Plus,
  PlusCircle,
  X,
  Save,
  Trash2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { MINISTRY_HIERARCHY } from '../constants';

interface ProjectManagerProps {
  user: User;
  tasks: Task[];
  schema: any;
  onUpdateSchema: (newSchema: any) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ user, tasks, schema, onUpdateSchema }) => {
  const [selectedAxis, setSelectedAxis] = useState<ApostolicAxis | null>('E1_EVANGELISMO');
  const [isEditing, setIsEditing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [tempAction, setTempAction] = useState('');
  const [activeRespIndex, setActiveRespIndex] = useState<number | null>(null);

  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  
  // Lógica de Supervisión: Una supervisora puede editar si el eje seleccionado está bajo su cargo
  const supervisorAuthority = MINISTRY_HIERARCHY.find(h => h.pastora.includes(user.name.split(' ')[1] || '---'));
  const hasAuthorityOnSelectedAxis = isSuperAdmin || (supervisorAuthority && supervisorAuthority.axis === selectedAxis);
  
  const currentAxisData = selectedAxis ? schema[selectedAxis] : null;

  // Cálculo de sincronización: cuantas tareas reales hay para este eje
  const axisTasks = tasks.filter(t => t.axis === selectedAxis);
  const completedAxisTasks = axisTasks.filter(t => t.status === 'COMPLETED');
  const syncRate = axisTasks.length > 0 ? Math.round((completedAxisTasks.length / axisTasks.length) * 100) : 0;

  const handleAddAction = (respIndex: number) => {
    if (!tempAction.trim() || !selectedAxis) return;
    
    const newSchema = { ...schema };
    newSchema[selectedAxis].responsibilities[respIndex].actions.push(tempAction);
    onUpdateSchema(newSchema);
    setTempAction('');
    setActiveRespIndex(null);
  };

  const handleRemoveAction = (respIndex: number, actionIndex: number) => {
    if (!selectedAxis) return;
    const newSchema = { ...schema };
    newSchema[selectedAxis].responsibilities[respIndex].actions.splice(actionIndex, 1);
    onUpdateSchema(newSchema);
  };

  const handleAddResponsibility = () => {
    if (!selectedAxis) return;
    const newSchema = { ...schema };
    newSchema[selectedAxis].responsibilities.push({
      name: 'Nueva Responsabilidad',
      actions: []
    });
    onUpdateSchema(newSchema);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
            <Layers size={28} className="text-turqui" />
            Engranaje Apostólico: Plan TAFE
          </h2>
          <p className="text-slate-500 text-sm">Gobernanza de Ejes, Responsabilidades y Acciones Operativas.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAuditing(!isAuditing)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              isAuditing ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white border border-slate-200 text-slate-500'
            }`}
          >
            <ClipboardList size={18} />
            {isAuditing ? 'Cerrar Auditoría' : 'Modo Auditoría'}
          </button>

          {(isSuperAdmin || user.role === UserRole.SUPERVISORA) && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              disabled={!hasAuthorityOnSelectedAxis}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed ${
                isEditing ? 'bg-navy-tafe text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-turqui'
              }`}
            >
              {isEditing ? <Save size={18} /> : <Sparkles size={18} />}
              {isEditing ? 'Finalizar Gestión' : 'Gestionar Operativa'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Selector de Ejes */}
        <div className="xl:col-span-1 space-y-3">
           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Ejes del Engranaje</h4>
           {(Object.keys(schema) as ApostolicAxis[]).map(key => (
             <button
              key={key}
              onClick={() => { setSelectedAxis(key); setIsEditing(false); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                selectedAxis === key 
                  ? 'bg-navy-tafe border-navy-tafe text-white shadow-xl translate-x-2' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-turqui/30'
              }`}
             >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl ${selectedAxis === key ? 'bg-white/10' : 'bg-slate-50 text-turqui'}`}>
                      <Activity size={18} />
                   </div>
                   <span className="text-xs font-bold font-montserrat">{schema[key].label.split(':')[1]}</span>
                </div>
                <ChevronRight size={16} className={selectedAxis === key ? 'text-turqui' : 'text-slate-200'} />
             </button>
           ))}
        </div>

        {/* Manual de Operaciones del Eje */}
        <div className="xl:col-span-3 space-y-6">
           {currentAxisData && (
             <div className={`bg-white p-10 rounded-[3rem] border transition-all shadow-sm animate-fadeIn ${isEditing ? 'border-turqui ring-4 ring-turqui/5' : 'border-slate-200'}`}>
                
                {/* Alerta de Auditoría */}
                {isAuditing && (
                   <div className="mb-10 p-6 bg-amber-50 rounded-3xl border border-amber-200 flex items-center justify-between animate-slideDown">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                            <AlertTriangle size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-amber-900 uppercase tracking-tight">Sincronización Operativa: {syncRate}%</p>
                            <p className="text-[10px] text-amber-700 font-medium">{axisTasks.length} tareas totales vinculadas a este eje en Operations.</p>
                         </div>
                      </div>
                      <div className="flex -space-x-2">
                         {axisTasks.slice(0, 3).map(t => (
                           <div key={t.id} className="w-8 h-8 rounded-full bg-white border-2 border-amber-100 flex items-center justify-center text-[8px] font-bold text-amber-600 shadow-sm" title={t.title}>
                              {t.title.charAt(0)}
                           </div>
                         ))}
                      </div>
                   </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                   <div>
                      <div className="flex items-center gap-2 mb-3">
                         <span className="px-3 py-1 bg-turqui/10 text-turqui text-[10px] font-bold rounded-lg uppercase tracking-widest border border-turqui/20">
                            Fase: {currentAxisData.label.split(':')[0]}
                         </span>
                         {!hasAuthorityOnSelectedAxis && (
                           <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[9px] font-bold rounded-lg uppercase flex items-center gap-1">
                              <ShieldCheck size={10} /> Solo Lectura
                           </span>
                         )}
                      </div>
                      <h3 className="text-3xl font-montserrat font-bold text-slate-800">{currentAxisData.function}</h3>
                      <p className="text-slate-400 text-sm mt-2 italic">Función de Reino establecida en el Plan TAFE.</p>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="flex justify-between items-center">
                      <h4 className="font-montserrat font-bold text-slate-800 flex items-center gap-2">
                        <BookOpen size={20} className="text-turqui" /> 
                        Manual de Responsabilidades
                      </h4>
                      {isEditing && (
                        <button 
                          onClick={handleAddResponsibility}
                          className="flex items-center gap-2 text-xs font-bold text-turqui bg-turqui/5 px-4 py-2 rounded-xl hover:bg-turqui/10 transition-all"
                        >
                          <PlusCircle size={14} /> Nueva Responsabilidad
                        </button>
                      )}
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentAxisData.responsibilities.map((resp: any, rIdx: number) => {
                        // Filtramos tareas que coincidan con esta responsabilidad (simulado)
                        const respTasks = axisTasks.filter(t => t.description.toLowerCase().includes(resp.name.toLowerCase().split(' ')[0]));
                        
                        return (
                          <div key={rIdx} className={`p-8 rounded-[2rem] border transition-all group relative ${isAuditing ? 'bg-slate-900 text-white' : 'bg-slate-50/50 border-slate-100'}`}>
                             {isEditing && (
                               <button className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors">
                                 <Trash2 size={16} />
                               </button>
                             )}
                             
                             <div className="flex justify-between items-start mb-6">
                                <h5 className={`text-lg font-bold flex items-center gap-3 ${isAuditing ? 'text-turqui' : 'text-slate-800'}`}>
                                   <div className={`w-1.5 h-6 rounded-full ${isAuditing ? 'bg-turqui shadow-[0_0_10px_#49D1C5]' : 'bg-turqui'}`} />
                                   {resp.name}
                                </h5>
                                {isAuditing && (
                                   <span className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full text-white/60">
                                      {respTasks.length} Tareas Activas
                                   </span>
                                )}
                             </div>
                             
                             <ul className="space-y-4">
                                {resp.actions.map((action: string, aIdx: number) => (
                                  <li key={aIdx} className="flex items-start gap-3 group/item">
                                     <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${isAuditing ? 'bg-turqui shadow-[0_0_5px_#49D1C5]' : 'bg-turqui'}`} />
                                     <div className="flex-1">
                                        <p className={`text-sm font-medium leading-tight ${isAuditing ? 'text-white/80' : 'text-slate-600'}`}>{action}</p>
                                        {isEditing && (
                                          <button 
                                            onClick={() => handleRemoveAction(rIdx, aIdx)}
                                            className="text-[9px] text-red-400 font-bold uppercase mt-1 opacity-0 group-hover/item:opacity-100 transition-all"
                                          >
                                            Eliminar Acción
                                          </button>
                                        )}
                                     </div>
                                  </li>
                                ))}
                                
                                {isEditing && (
                                  <div className="mt-4 pt-4 border-t border-slate-200/50">
                                     {activeRespIndex === rIdx ? (
                                       <div className="space-y-2 animate-fadeIn">
                                          <input 
                                            type="text" 
                                            value={tempAction}
                                            onChange={e => setTempAction(e.target.value)}
                                            placeholder="Describir nueva acción operativa..."
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui text-slate-800"
                                            autoFocus
                                          />
                                          <div className="flex gap-2">
                                             <button onClick={() => handleAddAction(rIdx)} className="flex-1 py-2 bg-turqui text-white text-[10px] font-bold rounded-lg shadow-md">Añadir al Manual</button>
                                             <button onClick={() => setActiveRespIndex(null)} className="p-2 text-slate-400 hover:text-slate-600"><X size={14}/></button>
                                          </div>
                                       </div>
                                     ) : (
                                       <button 
                                        onClick={() => setActiveRespIndex(rIdx)}
                                        className="flex items-center gap-2 text-[10px] font-bold text-turqui/60 hover:text-turqui transition-colors"
                                       >
                                          <Plus size={14} /> Agregar Acción Operativa
                                       </button>
                                     )}
                                  </div>
                                )}
                             </ul>
                          </div>
                        );
                      })}
                   </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                         {[1,2,3].map(i => <img key={i} src={`https://picsum.photos/seed/${i + 20}/100/100`} className="w-10 h-10 rounded-xl border-2 border-white shadow-sm" alt="" />)}
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-800">Pastora y Líderes a Cargo</p>
                         <p className="text-[9px] text-slate-400">Gobernanza del Eje {selectedAxis}</p>
                      </div>
                   </div>
                   <button className="px-8 py-4 bg-navy-tafe text-white font-bold rounded-2xl flex items-center gap-3 shadow-xl hover:bg-[#003366] transition-all">
                      Descargar Reporte de Sincronización <ArrowRight size={18} />
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;
