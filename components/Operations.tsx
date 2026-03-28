
import React, { useState } from 'react';
import { UserRole, Task, User } from '../types';
import { 
  Plus, 
  Clock, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  UserCheck, 
  Layers
} from 'lucide-react';
import { processTaskRequest } from '../services/anthropicService';

interface OperationsProps {
  role: UserRole;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const Operations: React.FC<OperationsProps> = ({ role, tasks, setTasks }) => {
  const [showModal, setShowModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isProcessingAi, setIsProcessingAi] = useState(false);

  const isMember = role === UserRole.MIEMBRO;
  // Fix: UserRole.PASTOR_MINISTERIOS replaced with UserRole.SUPERVISORA as per consolidated roles in types.ts
  const isLeader = role === UserRole.SUPER_ADMIN || role === UserRole.LIDER_MINISTERIO || role === UserRole.SUPERVISORA;
  const canCreate = role === UserRole.SUPER_ADMIN || role === UserRole.LIDER_MINISTERIO;

  const handleAiTaskCreation = async () => {
    if (!aiPrompt.trim()) return;
    setIsProcessingAi(true);
    const result = await processTaskRequest(aiPrompt);
    if (result) {
      const newTask: Task = {
        id: `t${Date.now()}`,
        title: result.taskTitle || 'Nueva Tarea IA',
        description: aiPrompt,
        ministry: result.ministry || 'CSI / Medios',
        assignedTo: 'u_auto',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        status: 'PENDING',
        requiredSkill: result.requiredSkill,
        axis: 'E5_ALABANZA_AV',
        category: 'TECNICO'
      };
      setTasks([newTask, ...tasks]);
      setAiPrompt('');
      setShowModal(false);
    }
    setIsProcessingAi(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-slate-800">
            {isMember ? 'Mis Operaciones' : 'Gestión de Operaciones'}
          </h2>
          <p className="text-slate-500 text-sm italic">
            {isMember ? 'Tus tareas activas del ministerio.' : 'Control de tareas del equipo de Medios.'}
          </p>
        </div>
        
        <div className="flex gap-3">
          {canCreate && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-turqui text-white font-montserrat font-bold rounded-xl shadow-lg shadow-turqui/20 hover:scale-[1.02] transition-all"
            >
              <Plus size={20} />
              Vincular Acción TAFE
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-montserrat font-bold text-slate-800">
          Flujo de Trabajo Ministerial
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn title="PENDIENTES" tasks={tasks.filter(t => t.status === 'PENDING')} color="bg-turqui" />
          <TaskColumn title="EN PROCESO" tasks={tasks.filter(t => t.status === 'IN_PROGRESS')} color="bg-blue-500" />
          <TaskColumn title="COMPLETADAS" tasks={tasks.filter(t => t.status === 'COMPLETED' || t.status === 'OVERDUE')} color="bg-emerald-500" />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp">
            <div className="bg-navy-tafe p-8 text-white relative">
              <h3 className="text-xl font-montserrat font-bold flex items-center gap-3">
                <Layers size={24} className="text-turqui" />
                Nueva Tarea de Medios
              </h3>
              <p className="text-white/60 text-sm mt-1">La IA asignará el requerimiento al ministerio correspondiente.</p>
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-white/40 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Describir Acción Requerida</label>
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ej: Necesito 2 anfitriones para la pesca milagrosa..."
                  className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 ring-turqui/20 outline-none transition-all resize-none text-slate-700 text-sm"
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Cancelar</button>
                <button onClick={handleAiTaskCreation} disabled={isProcessingAi} className="flex-[2] py-4 bg-turqui text-white font-bold rounded-2xl shadow-xl shadow-turqui/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isProcessingAi ? 'Mapeando Engranaje...' : 'Vincular y Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskColumn = ({ title, tasks, color }: any) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2 px-2">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title} ({tasks.length})</h3>
      <div className={`w-10 h-1 rounded-full ${color}`} />
    </div>
    <div className="space-y-4 min-h-[300px]">
      {tasks.map((task: Task) => (
        <div key={task.id} className={`bg-white p-6 rounded-3xl border-2 transition-all hover:shadow-xl ${task.isUrgent ? 'border-red-100 shadow-red-50' : 'border-slate-50 shadow-sm'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[9px] font-bold px-3 py-1 rounded-lg bg-navy-tafe text-white uppercase leading-none tracking-widest">
              {task.ministry}
            </span>
            {task.status === 'OVERDUE' && <AlertCircle size={14} className="text-red-500" />}
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">{task.title}</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed mb-4">{task.description}</p>
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest">{task.dueDate}</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg">
               <ShieldCheck size={10} className="text-turqui" />
               <span className="text-[8px] font-bold text-slate-400 uppercase">Verificado TAFE</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Operations;
