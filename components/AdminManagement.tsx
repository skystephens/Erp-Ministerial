
import React, { useState } from 'react';
import { User, UserRole, ApostolicAxis, Task, PrayerRequest } from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Eye, 
  Key,
  Database,
  ChevronRight,
  Zap,
  Download,
  Upload,
  FileJson,
  Table as TableIcon,
  Trash2,
  RefreshCcw
} from 'lucide-react';
import { MINISTRIES } from '../constants';

interface AdminManagementProps {
  users: User[];
  tasks: Task[];
  petitions: PrayerRequest[];
  onApprove: (userId: string, ministry: string, axis: ApostolicAxis) => void;
  onImport: (data: any) => void;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ users, tasks, petitions, onApprove, onImport }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'approvals' | 'layers' | 'database'>('approvals');
  const [approvalDraft, setApprovalDraft] = useState<{userId: string, ministry: string, axis: ApostolicAxis} | null>(null);
  const [viewTable, setViewTable] = useState<'users' | 'tasks' | 'petitions'>('users');

  const pendingUsers = users.filter(u => u.status === 'PENDING_APPROVAL');

  const handleExport = () => {
    const fullData = { users, tasks, petitions, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TAFE_ERP_BACKUP_${new Date().toLocaleDateString()}.json`;
    a.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (window.confirm("¿Estás seguro de importar estos datos? Reemplazarán la base de datos local actual.")) {
          onImport(json);
        }
      } catch (error) {
        alert("Error al procesar el archivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  const confirmApproval = () => {
    if (approvalDraft) {
      onApprove(approvalDraft.userId, approvalDraft.ministry, approvalDraft.axis);
      setApprovalDraft(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Selector de Panel Admin */}
      <div className="flex flex-wrap gap-4 p-2 bg-slate-100 rounded-[2rem] w-fit border border-slate-200 shadow-inner">
        <button onClick={() => setActiveAdminTab('approvals')} className={`px-8 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${activeAdminTab === 'approvals' ? 'bg-white shadow-md text-navy-tafe' : 'text-slate-400 hover:text-slate-600'}`}>
          <UserCheck size={16} /> Aprobaciones {pendingUsers.length > 0 && <span className="bg-red-500 text-white w-2 h-2 rounded-full animate-pulse"></span>}
        </button>
        <button onClick={() => setActiveAdminTab('layers')} className={`px-8 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${activeAdminTab === 'layers' ? 'bg-white shadow-md text-navy-tafe' : 'text-slate-400 hover:text-slate-600'}`}>
          <Lock size={16} /> Capas de Conocimiento
        </button>
        <button onClick={() => setActiveAdminTab('database')} className={`px-8 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${activeAdminTab === 'database' ? 'bg-white shadow-md text-navy-tafe' : 'text-slate-400 hover:text-slate-600'}`}>
          <Database size={16} /> Base de Datos (Local)
        </button>
      </div>

      {activeAdminTab === 'approvals' && (
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
                  <ShieldCheck size={24} className="text-turqui" /> Validación de Candidatos
                </h3>
                <p className="text-slate-400 text-xs mt-1">Prospectos pendientes de asignación oficial.</p>
              </div>
            </div>
            <div className="p-8">
              {pendingUsers.length === 0 ? (
                <div className="py-20 text-center text-slate-400 italic">No hay solicitudes pendientes.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-turqui/30 transition-all group">
                       <h4 className="font-bold text-slate-800">{user.name}</h4>
                       <p className="text-[10px] text-slate-400 mb-4">{user.contact}</p>
                       <button onClick={() => setApprovalDraft({userId: user.id, ministry: MINISTRIES[0], axis: 'E1_EVANGELISMO'})} className="w-full py-3 bg-navy-tafe text-white font-bold text-[10px] rounded-xl">Validar e Integrar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </section>
      )}

      {activeAdminTab === 'database' && (
        <section className="space-y-6">
           <div className="bg-navy-tafe p-10 rounded-[3rem] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="max-w-md">
                 <h3 className="text-2xl font-montserrat font-bold flex items-center gap-3">
                    <FileJson className="text-turqui" /> Engine de Persistencia Local
                 </h3>
                 <p className="text-white/50 text-xs mt-3 leading-relaxed">
                    Toda la información del ERP se guarda en este dispositivo. Puedes exportar el JSON para moverlo a Render o reconectar Airtable en el futuro.
                 </p>
              </div>
              <div className="flex gap-4">
                 <button onClick={handleExport} className="px-6 py-4 bg-white/10 text-white rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-white/20 border border-white/10">
                    <Download size={16} /> Exportar JSON
                 </button>
                 <label className="px-6 py-4 bg-turqui text-white rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-turqui/80 cursor-pointer shadow-lg shadow-turqui/20">
                    <Upload size={16} /> Importar Datos
                    <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                 </label>
              </div>
           </div>

           <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 flex gap-4">
                 <button onClick={() => setViewTable('users')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${viewTable === 'users' ? 'bg-turqui text-white' : 'text-slate-400'}`}>Miembros ({users.length})</button>
                 <button onClick={() => setViewTable('tasks')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${viewTable === 'tasks' ? 'bg-turqui text-white' : 'text-slate-400'}`}>Tareas ({tasks.length})</button>
                 <button onClick={() => setViewTable('petitions')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${viewTable === 'petitions' ? 'bg-turqui text-white' : 'text-slate-400'}`}>Buzón ({petitions.length})</button>
              </div>

              <div className="overflow-x-auto p-4">
                 <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-100">
                       <tr>
                          <th className="p-4">ID</th>
                          <th className="p-4">Información Principal</th>
                          <th className="p-4">Detalle/Status</th>
                          <th className="p-4">Acción</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {viewTable === 'users' && users.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                             <td className="p-4 font-mono text-slate-300">...{u.id.slice(-6)}</td>
                             <td className="p-4 font-bold text-slate-800">{u.name}<br/><span className="text-[9px] font-normal text-slate-400">{u.contact}</span></td>
                             <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-bold">{u.role}</span></td>
                             <td className="p-4 text-slate-300"><Eye size={14}/></td>
                          </tr>
                       ))}
                       {viewTable === 'tasks' && tasks.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                             <td className="p-4 font-mono text-slate-300">...{t.id.slice(-6)}</td>
                             <td className="p-4 font-bold text-slate-800">{t.title}<br/><span className="text-[9px] font-normal text-slate-400">{t.ministry}</span></td>
                             <td className="p-4"><span className={`px-2 py-1 rounded text-[9px] font-bold ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{t.status}</span></td>
                             <td className="p-4 text-slate-300"><Trash2 size={14}/></td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </section>
      )}

      {/* Modal Aprobación Re-usado */}
      {approvalDraft && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
              <div className="bg-navy-tafe p-10 text-white">
                 <h3 className="text-xl font-montserrat font-bold">Integrar Miembro</h3>
              </div>
              <div className="p-10 space-y-6">
                 <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" value={approvalDraft.ministry} onChange={e => setApprovalDraft({...approvalDraft, ministry: e.target.value})}>
                    {MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
                 </select>
                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setApprovalDraft(null)} className="flex-1 py-4 text-slate-400 font-bold">Cancelar</button>
                    <button onClick={confirmApproval} className="flex-[2] py-4 bg-turqui text-white font-bold rounded-2xl">Confirmar en Local</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
