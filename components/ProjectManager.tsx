
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
  ClipboardList,
  ListChecks,
  CheckCircle2,
  Circle,
  PlayCircle,
  Flag,
} from 'lucide-react';
import { MINISTRY_HIERARCHY } from '../constants';

interface ProjectManagerProps {
  user: User;
  tasks: Task[];
  schema: any;
  onUpdateSchema: (newSchema: any) => void;
  onAddTask: (task: Task) => void;
}

const TASK_TYPES: { value: Task['category']; label: string; color: string }[] = [
  { value: 'BRIGADA',       label: 'Brigada de Campo',           color: 'bg-orange-100 text-orange-700' },
  { value: 'RECOPILACION',  label: 'Recopilación de Datos',      color: 'bg-blue-100 text-blue-700' },
  { value: 'PASTORAL',      label: 'Tarea Pastoral',             color: 'bg-purple-100 text-purple-700' },
  { value: 'COORDINACION',  label: 'Coordinación Ministerial',   color: 'bg-emerald-100 text-emerald-700' },
  { value: 'LOGISTICA',     label: 'Logística',                  color: 'bg-amber-100 text-amber-700' },
  { value: 'CONTENIDO',     label: 'Contenido / Comunicación',   color: 'bg-pink-100 text-pink-700' },
];

const STATUS_MAP: Record<Task['status'], { label: string; icon: React.ReactNode; color: string }> = {
  PENDING:     { label: 'Pendiente',   icon: <Circle size={14} />,      color: 'text-slate-400' },
  IN_PROGRESS: { label: 'En Proceso',  icon: <PlayCircle size={14} />,  color: 'text-blue-500' },
  COMPLETED:   { label: 'Completada',  icon: <CheckCircle2 size={14} />,color: 'text-emerald-500' },
  OVERDUE:     { label: 'Atrasada',    icon: <AlertTriangle size={14} />,color: 'text-red-500' },
  INVITED:     { label: 'Invitada',    icon: <Circle size={14} />,      color: 'text-slate-400' },
};

const ProjectManager: React.FC<ProjectManagerProps> = ({ user, tasks, schema, onUpdateSchema, onAddTask }) => {
  const [selectedAxis, setSelectedAxis] = useState<ApostolicAxis | null>('E1_EVANGELISMO');
  const [isEditing, setIsEditing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [tempAction, setTempAction] = useState('');
  const [activeRespIndex, setActiveRespIndex] = useState<number | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'BRIGADA' as Task['category'],
    targetMinistry: '',
    dueDate: '',
    priority: 'MEDIA' as Task['priority'],
  });

  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const isSupervisora = user.role === UserRole.SUPERVISORA;

  // Lógica de Supervisión: Una supervisora puede editar si el eje seleccionado está bajo su cargo
  const supervisorAuthority = MINISTRY_HIERARCHY.find(h => h.pastora.includes(user.name.split(' ')[1] || '---'));
  const hasAuthorityOnSelectedAxis = isSuperAdmin || (supervisorAuthority && supervisorAuthority.axis === selectedAxis);

  const currentAxisData = selectedAxis ? schema[selectedAxis] : null;

  // Ministerios del eje seleccionado
  const axisMinistries = MINISTRY_HIERARCHY.find(h => h.axis === selectedAxis)?.ministries ?? [];

  // Tareas ministeriales asignadas a este eje por liderazgo
  const ministerialTasks = tasks.filter(t => t.axis === selectedAxis && t.isMinisterialTask);

  // Cálculo de sincronización: cuantas tareas reales hay para este eje
  const axisTasks = tasks.filter(t => t.axis === selectedAxis);
  const completedAxisTasks = axisTasks.filter(t => t.status === 'COMPLETED');
  const syncRate = axisTasks.length > 0 ? Math.round((completedAxisTasks.length / axisTasks.length) * 100) : 0;

  const handleCreateMinisterialTask = () => {
    if (!taskForm.title.trim() || !selectedAxis) return;
    const target = taskForm.targetMinistry || (axisMinistries[0]?.name ?? '');
    const newTask: Task = {
      id: `mt_${Date.now()}`,
      title: taskForm.title,
      description: taskForm.description,
      ministry: target,
      targetMinistry: target,
      assignedTo: 'lider_ministerio',
      dueDate: taskForm.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'PENDING',
      category: taskForm.category,
      priority: taskForm.priority,
      axis: selectedAxis,
      isMinisterialTask: true,
      createdBy: user.name,
      createdByRole: user.role,
    };
    onAddTask(newTask);
    setTaskForm({ title: '', description: '', category: 'BRIGADA', targetMinistry: '', dueDate: '', priority: 'MEDIA' });
    setShowTaskModal(false);
  };

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

           {/* ── Tareas del Eje ─────────────────────────────────────── */}
           {selectedAxis && (
             <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm animate-fadeIn">
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
                     <ListChecks size={24} className="text-turqui" />
                     Tareas Asignadas al Eje
                   </h3>
                   <p className="text-slate-400 text-xs mt-1">
                     Visibles para los líderes del ministerio correspondiente.
                   </p>
                 </div>
                 {(isSuperAdmin || (isSupervisora && hasAuthorityOnSelectedAxis)) && (
                   <button
                     onClick={() => setShowTaskModal(true)}
                     className="flex items-center gap-2 px-6 py-3 bg-turqui text-white font-bold text-xs rounded-2xl shadow-lg shadow-turqui/20 hover:scale-[1.02] transition-all"
                   >
                     <Plus size={16} /> Asignar Tarea al Eje
                   </button>
                 )}
               </div>

               {ministerialTasks.length === 0 ? (
                 <div className="py-16 text-center text-slate-300 italic text-sm">
                   No hay tareas asignadas a este eje todavía.
                 </div>
               ) : (
                 <div className="space-y-4">
                   {ministerialTasks.map(task => {
                     const typeInfo = TASK_TYPES.find(t => t.value === task.category);
                     const statusInfo = STATUS_MAP[task.status];
                     return (
                       <div key={task.id} className="flex items-start gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-turqui/20 transition-all">
                         <div className={`flex items-center gap-1.5 ${statusInfo.color} mt-0.5 flex-shrink-0`}>
                           {statusInfo.icon}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex flex-wrap items-center gap-2 mb-1">
                             <span className="font-bold text-sm text-slate-800">{task.title}</span>
                             {task.priority === 'CRITICA' && (
                               <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                 <Flag size={9} /> CRÍTICA
                               </span>
                             )}
                             {task.priority === 'ALTA' && (
                               <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">ALTA</span>
                             )}
                           </div>
                           {task.description && (
                             <p className="text-xs text-slate-500 leading-relaxed mb-2">{task.description}</p>
                           )}
                           <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                             {typeInfo && (
                               <span className={`px-2 py-0.5 rounded-full font-bold ${typeInfo.color}`}>{typeInfo.label}</span>
                             )}
                             <span className="font-bold text-navy-tafe/70">{task.targetMinistry || task.ministry}</span>
                             <span>· {task.dueDate}</span>
                             <span>· Por: {task.createdBy}</span>
                           </div>
                         </div>
                         <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl flex-shrink-0 ${
                           task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                           task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' :
                           'bg-slate-100 text-slate-500'
                         }`}>
                           {statusInfo.label}
                         </span>
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>
           )}
        </div>
      </div>

      {/* ── Modal: Nueva Tarea Ministerial ─────────────────────────────────── */}
      {showTaskModal && selectedAxis && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
            <div className="bg-navy-tafe p-10 text-white">
              <h3 className="text-xl font-montserrat font-bold flex items-center gap-3">
                <ListChecks size={22} className="text-turqui" />
                Asignar Tarea al Eje
              </h3>
              <p className="text-white/50 text-xs mt-1">
                {currentAxisData?.label} · Los líderes la verán en su panel.
              </p>
            </div>
            <div className="p-10 space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tipo de Tarea</label>
                <div className="grid grid-cols-2 gap-2">
                  {TASK_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTaskForm(f => ({ ...f, category: t.value }))}
                      className={`p-3 rounded-xl text-[10px] font-bold border transition-all text-left ${
                        taskForm.category === t.value
                          ? 'border-turqui bg-turqui/5 text-turqui'
                          : 'border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Título *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Brigada sector norte — zona E1"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 ring-turqui/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Descripción</label>
                <textarea
                  value={taskForm.description}
                  onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Instrucciones, contexto o detalle de la tarea..."
                  rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 ring-turqui/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Ministerio Destino</label>
                  <select
                    value={taskForm.targetMinistry}
                    onChange={e => setTaskForm(f => ({ ...f, targetMinistry: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                  >
                    {axisMinistries.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Prioridad</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Fecha Límite</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 ring-turqui/20"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-4 text-slate-400 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateMinisterialTask}
                  disabled={!taskForm.title.trim()}
                  className="flex-[2] py-4 bg-turqui text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-turqui/20 disabled:opacity-40 transition-all"
                >
                  <Plus size={16} /> Asignar Tarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
