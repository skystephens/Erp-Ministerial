import React, { useState } from 'react';
import { User, UserRole, AttendanceSession, Task } from '../types';
import { Users, ClipboardCheck, CheckSquare, Square, Star, ListChecks, Circle, PlayCircle, CheckCircle2, AlertTriangle, Flag } from 'lucide-react';
import { MINISTRY_DETAILS, MINISTRY_MEMBERS, MINISTRY_HIERARCHY } from '../constants';

interface MinisterioDashboardProps {
  ministry?: string;
  role: UserRole;
  users: User[];
  sessions: AttendanceSession[];
  tasks?: Task[];
  onUpdateTask?: (taskId: string, status: Task['status']) => void;
}

const MinisterioDashboard: React.FC<MinisterioDashboardProps> = ({
  ministry, role, users, sessions, tasks = [], onUpdateTask,
}) => {
  if (!ministry) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
        <Star size={40} className="opacity-20" />
        <p className="text-sm font-medium">No tienes un ministerio asignado aún.</p>
        <p className="text-xs">Habla con tu líder para que te asignen a uno.</p>
      </div>
    );
  }

  // Miembros: lista fija si existe, si no filtrar de users aprobados
  const memberNames: string[] =
    MINISTRY_MEMBERS[ministry] ??
    users.filter(u => u.ministry === ministry && u.status === 'APPROVED').map(u => u.name);

  // Info del ministerio desde la jerarquía
  const ministryInfo = MINISTRY_HIERARCHY
    .flatMap(g => g.ministries.map(m => ({ ...m, pastora: g.pastora })))
    .find(m => m.name === ministry);

  // Últimas 5 sesiones de asistencia de este ministerio
  const recentSessions = sessions
    .filter(s => s.ministry === ministry)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const details = MINISTRY_DETAILS[ministry];
  const totalSessions = sessions.filter(s => s.ministry === ministry).length;

  // Tareas ministeriales asignadas por liderazgo a este ministerio
  const ministerialTasks = tasks.filter(
    t => t.isMinisterialTask && (t.targetMinistry === ministry || t.ministry === ministry)
  ).sort((a, b) => {
    const order = { CRITICA: 0, ALTA: 1, MEDIA: 2, BAJA: 3 };
    return (order[a.priority ?? 'MEDIA'] ?? 2) - (order[b.priority ?? 'MEDIA'] ?? 2);
  });

  const pendingMinisterialCount = ministerialTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;

  const avgPct =
    recentSessions.length > 0
      ? Math.round(
          recentSessions.reduce((acc, s) => {
            const total = s.totalPresent + s.totalAbsent;
            return acc + (total > 0 ? (s.totalPresent / total) * 100 : 0);
          }, 0) / recentSessions.length
        )
      : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-navy-tafe p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, #49D1C5 0%, transparent 50%)',
        }} />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <span className="px-3 py-1 bg-turqui/20 text-turqui text-[10px] font-bold rounded-lg uppercase tracking-widest border border-turqui/30 mb-4 inline-block">
              Tu Ministerio
            </span>
            <h2 className="text-4xl font-montserrat font-bold mt-1">
              <span className="text-turqui">{ministry}</span>
            </h2>
            {ministryInfo && (
              <p className="text-white/40 text-sm mt-2">
                Líder: {ministryInfo.leader}
                {ministryInfo.pastora && ` · Supervisora: ${ministryInfo.pastora}`}
              </p>
            )}
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center min-w-[110px]">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Miembros</p>
              <p className="text-2xl font-bold">{memberNames.length}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center min-w-[110px]">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Servicios</p>
              <p className="text-2xl font-bold">{totalSessions}</p>
              <p className="text-[10px] text-turqui font-bold">Registrados</p>
            </div>
            {avgPct !== null && (
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center min-w-[110px]">
                <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Asistencia</p>
                <p className={`text-2xl font-bold ${avgPct >= 75 ? 'text-emerald-400' : avgPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {avgPct}%
                </p>
                <p className="text-[10px] text-white/30">Promedio</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de miembros */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-montserrat font-bold text-slate-800 mb-6 flex items-center gap-3">
            <Users className="text-turqui" size={18} />
            Miembros <span className="text-slate-400 font-normal text-sm">({memberNames.length})</span>
          </h3>
          <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {memberNames.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Sin miembros registrados</p>
            ) : (
              memberNames.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-turqui/10 text-turqui text-[10px] font-bold flex items-center justify-center shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700 font-medium">{name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-2 space-y-8">
          {/* Asistencia reciente */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-montserrat font-bold text-slate-800 mb-6 flex items-center gap-3">
              <ClipboardCheck className="text-turqui" size={18} /> Asistencia Reciente
            </h3>
            {recentSessions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Aún no hay registros de asistencia para {ministry}.
              </p>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((s) => {
                  const total = s.totalPresent + s.totalAbsent;
                  const pct = total > 0 ? Math.round((s.totalPresent / total) * 100) : 0;
                  return (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="text-xs font-bold text-slate-700">{s.serviceLabel}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{s.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">{s.totalPresent}/{total}</p>
                          <p className={`text-[10px] font-bold ${pct >= 75 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-red-400'}`}>
                            {pct}%
                          </p>
                        </div>
                        <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 75 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Checklist del servicio */}
          {details?.checklists && details.checklists.length > 0 && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="font-montserrat font-bold text-slate-800 mb-2 flex items-center gap-3">
                <CheckSquare className="text-turqui" size={18} /> Checklist del Servicio
              </h3>
              <p className="text-[10px] text-slate-400 mb-5 ml-7">Se reinicia cada vez que abres esta vista</p>
              <div className="space-y-2">
                {details.checklists.map((item, i) => (
                  <ChecklistItem key={i} label={item} />
                ))}
              </div>
            </div>
          )}

          {/* Especialidades del ministerio */}
          {details?.specialties && details.specialties.length > 0 && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="font-montserrat font-bold text-slate-800 mb-5 flex items-center gap-3">
                <Star className="text-turqui" size={18} /> Especialidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {details.specialties.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-turqui/10 text-turqui text-xs font-bold rounded-lg border border-turqui/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Tareas Generales asignadas por liderazgo ───────────────────────── */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-montserrat font-bold text-slate-800 flex items-center gap-3">
            <ListChecks className="text-turqui" size={18} />
            Tareas Generales
            {pendingMinisterialCount > 0 && (
              <span className="bg-turqui text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {pendingMinisterialCount}
              </span>
            )}
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Asignadas por Supervisora / Pastor</span>
        </div>

        {ministerialTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-300 text-sm italic">
            No hay tareas asignadas por liderazgo para este ministerio.
          </div>
        ) : (
          <div className="space-y-3">
            {ministerialTasks.map(task => {
              const statusCycle: Record<Task['status'], Task['status']> = {
                PENDING: 'IN_PROGRESS',
                IN_PROGRESS: 'COMPLETED',
                COMPLETED: 'COMPLETED',
                OVERDUE: 'IN_PROGRESS',
                INVITED: 'PENDING',
              };
              const statusColors: Record<Task['status'], string> = {
                PENDING:     'bg-slate-100 text-slate-500',
                IN_PROGRESS: 'bg-blue-50 text-blue-600',
                COMPLETED:   'bg-emerald-50 text-emerald-600',
                OVERDUE:     'bg-red-50 text-red-500',
                INVITED:     'bg-slate-100 text-slate-400',
              };
              const statusLabels: Record<Task['status'], string> = {
                PENDING: 'Pendiente', IN_PROGRESS: 'En Proceso',
                COMPLETED: 'Completada', OVERDUE: 'Atrasada', INVITED: 'Invitada',
              };
              const categoryColors: Partial<Record<Task['category'], string>> = {
                BRIGADA:      'bg-orange-100 text-orange-700',
                RECOPILACION: 'bg-blue-100 text-blue-700',
                PASTORAL:     'bg-purple-100 text-purple-700',
                COORDINACION: 'bg-emerald-100 text-emerald-700',
                LOGISTICA:    'bg-amber-100 text-amber-700',
                CONTENIDO:    'bg-pink-100 text-pink-700',
              };
              const categoryLabels: Partial<Record<Task['category'], string>> = {
                BRIGADA: 'Brigada', RECOPILACION: 'Recopilación', PASTORAL: 'Pastoral',
                COORDINACION: 'Coordinación', LOGISTICA: 'Logística', CONTENIDO: 'Contenido',
              };

              return (
                <div key={task.id} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                  task.status === 'COMPLETED' ? 'bg-emerald-50/40 border-emerald-100' :
                  task.priority === 'CRITICA' ? 'bg-red-50/30 border-red-100' :
                  task.priority === 'ALTA' ? 'bg-orange-50/30 border-orange-100' :
                  'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${categoryColors[task.category] ?? 'bg-slate-100 text-slate-500'}`}>
                        {categoryLabels[task.category] ?? task.category}
                      </span>
                      {(task.priority === 'CRITICA' || task.priority === 'ALTA') && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-red-600">
                          <Flag size={9} /> {task.priority}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-bold text-slate-800 mb-0.5 ${task.status === 'COMPLETED' ? 'line-through opacity-50' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-500 leading-relaxed mb-1">{task.description}</p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      Asignada por: <span className="font-bold text-navy-tafe/60">{task.createdBy}</span>
                      {task.dueDate && <> · Fecha límite: <span className="font-bold">{task.dueDate}</span></>}
                    </p>
                  </div>
                  {onUpdateTask && task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => onUpdateTask(task.id, statusCycle[task.status])}
                      className={`flex-shrink-0 px-3 py-2 text-[10px] font-bold rounded-xl border transition-all hover:scale-105 ${statusColors[task.status]}`}
                    >
                      {task.status === 'PENDING' ? 'Iniciar' : 'Completar'}
                    </button>
                  )}
                  {task.status === 'COMPLETED' && (
                    <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                      <CheckCircle2 size={12} /> Listo
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ChecklistItem: React.FC<{ label: string }> = ({ label }) => {
  const [checked, setChecked] = useState(false);
  return (
    <button
      onClick={() => setChecked(v => !v)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
        checked ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'
      }`}
    >
      {checked
        ? <CheckSquare size={16} className="text-emerald-500 shrink-0" />
        : <Square size={16} className="text-slate-300 shrink-0" />
      }
      <span className={`text-sm font-medium ${checked ? 'line-through opacity-60' : ''}`}>{label}</span>
    </button>
  );
};

export default MinisterioDashboard;
