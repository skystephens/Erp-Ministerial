
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, ApostolicAxis } from '../types';
import {
  ShieldCheck,
  UserCheck,
  RefreshCcw,
  UserPlus,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { MINISTRIES } from '../constants';
import { getProspectos, aprobarProspecto, rechazarProspecto, ProspectoAirtable } from '../services/airtableService';

interface AdminManagementProps {
  users: User[];
  onApprove: (userId: string, ministry: string, axis: ApostolicAxis) => void;
}

const ROLES_ASIGNABLES = [
  { value: 'MIEMBRO',          label: 'Miembro' },
  { value: 'LIDER_MINISTERIO', label: 'Líder de Ministerio' },
  { value: 'SUPERVISORA',      label: 'Supervisora de Eje' },
];

const EJES_OPTIONS = [
  { value: 'E1_EVANGELISMO',    label: 'E1 · Evangelismo y Células' },
  { value: 'E2_INTERCESION',    label: 'E2 · Intercesión y Formación' },
  { value: 'E3_CONSOLIDACION',  label: 'E3 · Consolidación y Anfitriones' },
  { value: 'E4_INFANCIA_DANZA', label: 'E4 · Danza y Escuela Infantil AMO' },
  { value: 'E5_ALABANZA_AV',    label: 'E5 · Medios y Alabanza' },
  { value: 'E6_SOCIAL_CUIDADO', label: 'E6 · Atención Social y Pastoral' },
  { value: 'E7_JOVENES',        label: 'E7 · Adolescentes y Adultos Jóvenes' },
];

const AdminManagement: React.FC<AdminManagementProps> = ({ users, onApprove }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'registros' | 'approvals'>('registros');
  const [approvalDraft, setApprovalDraft] = useState<{userId: string, ministry: string, axis: ApostolicAxis} | null>(null);

  // ── Prospectos de Airtable (Firebase Auth) ────────────────────────────────
  const [prospectos,        setProspectos]        = useState<ProspectoAirtable[]>([]);
  const [loadingProspectos, setLoadingProspectos] = useState(false);
  const [approving,         setApproving]         = useState<ProspectoAirtable | null>(null);
  const [approveForm,       setApproveForm]       = useState({ rol: 'MIEMBRO', ministerio: MINISTRIES[0] ?? '', eje: 'E5_ALABANZA_AV' });
  const [savingApproval,    setSavingApproval]    = useState(false);
  const [confirmReject,     setConfirmReject]      = useState<ProspectoAirtable | null>(null);
  const [actionMsg,         setActionMsg]         = useState('');

  const loadProspectos = useCallback(async () => {
    setLoadingProspectos(true);
    try {
      const data = await getProspectos();
      setProspectos(data);
    } finally {
      setLoadingProspectos(false);
    }
  }, []);

  useEffect(() => {
    if (activeAdminTab === 'registros') loadProspectos();
  }, [activeAdminTab, loadProspectos]);

  const handleApprove = async () => {
    if (!approving) return;
    setSavingApproval(true);
    try {
      await aprobarProspecto(approving.recordId, approveForm.rol, approveForm.ministerio, approveForm.eje);
      setProspectos(p => p.filter(x => x.recordId !== approving.recordId));
      setActionMsg(`✓ ${approving.nombre} aprobado como ${ROLES_ASIGNABLES.find(r=>r.value===approveForm.rol)?.label}`);
      setApproving(null);
      setTimeout(() => setActionMsg(''), 4000);
    } catch {
      setActionMsg('Error al guardar. Intenta de nuevo.');
    } finally {
      setSavingApproval(false);
    }
  };

  const handleReject = async () => {
    if (!confirmReject) return;
    try {
      await rechazarProspecto(confirmReject.recordId);
      setProspectos(p => p.filter(x => x.recordId !== confirmReject.recordId));
      setActionMsg(`Registro de ${confirmReject.nombre} eliminado.`);
      setConfirmReject(null);
      setTimeout(() => setActionMsg(''), 3000);
    } catch {
      setActionMsg('Error al eliminar. Intenta de nuevo.');
    }
  };

  const pendingUsers = users.filter(u => u.status === 'PENDING_APPROVAL');

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
        <button onClick={() => setActiveAdminTab('registros')} className={`px-8 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${activeAdminTab === 'registros' ? 'bg-white shadow-md text-navy-tafe' : 'text-slate-400 hover:text-slate-600'}`}>
          <UserPlus size={16} /> Nuevos Registros {prospectos.length > 0 && <span className="bg-red-500 text-white min-w-[1.1rem] h-[1.1rem] px-1 rounded-full text-[9px] flex items-center justify-center font-bold">{prospectos.length}</span>}
        </button>
        <button onClick={() => setActiveAdminTab('approvals')} className={`px-8 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${activeAdminTab === 'approvals' ? 'bg-white shadow-md text-navy-tafe' : 'text-slate-400 hover:text-slate-600'}`}>
          <UserCheck size={16} /> Aprobaciones {pendingUsers.length > 0 && <span className="bg-red-500 text-white w-2 h-2 rounded-full animate-pulse"></span>}
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

      {activeAdminTab === 'registros' && (
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
                <UserPlus size={24} className="text-turqui" /> Nuevos Registros Firebase
              </h3>
              <p className="text-slate-400 text-xs mt-1">Prospectos registrados vía Firebase Auth pendientes de asignación oficial.</p>
            </div>
            <button onClick={loadProspectos} title="Recargar" className="p-3 text-slate-400 hover:text-turqui transition-colors rounded-xl hover:bg-slate-50">
              <RefreshCcw size={16} className={loadingProspectos ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="p-8">
            {actionMsg && (
              <div className="mb-6 p-4 bg-turqui/10 border border-turqui/20 rounded-2xl text-turqui text-xs font-bold">{actionMsg}</div>
            )}
            {loadingProspectos ? (
              <div className="py-20 flex items-center justify-center gap-3 text-slate-400">
                <Loader2 size={20} className="animate-spin" /> Cargando prospectos...
              </div>
            ) : prospectos.length === 0 ? (
              <div className="py-20 text-center text-slate-400 italic">No hay registros nuevos pendientes.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prospectos.map(p => (
                  <div key={p.recordId} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-turqui/30 transition-all">
                    <h4 className="font-bold text-slate-800">{p.nombre}</h4>
                    <p className="text-[10px] text-slate-400 mb-1">{p.email}</p>
                    <p className="text-[10px] text-slate-500 mb-4">
                      Ministerio: <span className="font-bold">{p.ministerio || '—'}</span> · Eje: <span className="font-bold">{p.eje || '—'}</span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApproving(p)}
                        className="flex-1 py-2.5 bg-navy-tafe text-white font-bold text-[10px] rounded-xl flex items-center justify-center gap-1.5 hover:bg-navy-tafe/90 transition-colors"
                      >
                        <Check size={12} /> Aprobar
                      </button>
                      <button
                        onClick={() => setConfirmReject(p)}
                        className="flex-1 py-2.5 bg-red-50 text-red-500 font-bold text-[10px] rounded-xl flex items-center justify-center gap-1.5 border border-red-100 hover:bg-red-100 transition-colors"
                      >
                        <X size={12} /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Modal Aprobación Firebase Prospecto */}
      {approving && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
            <div className="bg-navy-tafe p-10 text-white">
              <h3 className="text-xl font-montserrat font-bold">Aprobar Prospecto</h3>
              <p className="text-white/60 text-xs mt-1">{approving.nombre} · {approving.email}</p>
            </div>
            <div className="p-10 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Rol</label>
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs"
                  value={approveForm.rol}
                  onChange={e => setApproveForm({ ...approveForm, rol: e.target.value })}
                >
                  {ROLES_ASIGNABLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Ministerio</label>
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs"
                  value={approveForm.ministerio}
                  onChange={e => setApproveForm({ ...approveForm, ministerio: e.target.value })}
                >
                  {MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Eje Apostólico</label>
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs"
                  value={approveForm.eje}
                  onChange={e => setApproveForm({ ...approveForm, eje: e.target.value })}
                >
                  {EJES_OPTIONS.map(ej => <option key={ej.value} value={ej.value}>{ej.label}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setApproving(null)} className="flex-1 py-4 text-slate-400 font-bold rounded-2xl border border-slate-200">Cancelar</button>
                <button
                  onClick={handleApprove}
                  disabled={savingApproval}
                  className="flex-[2] py-4 bg-turqui text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                >
                  {savingApproval ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {savingApproval ? 'Guardando...' : 'Confirmar Aprobación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación Rechazo */}
      {confirmReject && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-10 text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-montserrat font-bold text-slate-800">¿Eliminar registro?</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  El registro de <strong className="text-slate-600">{confirmReject.nombre}</strong> será eliminado de Airtable permanentemente.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setConfirmReject(null)} className="flex-1 py-4 text-slate-400 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">Cancelar</button>
                <button onClick={handleReject} className="flex-[2] py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
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
