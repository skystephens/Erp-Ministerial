import React, { useState } from 'react';
import { Edit2, Save, X, Users, Radio } from 'lucide-react';

// ─── Static data ──────────────────────────────────────────────────────────────

const ROLES = [
  { id: 'pc1',    label: 'Pantalla PC 1',          color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'switch', label: 'Switch PC 2 — En Vivo',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'luces',  label: 'Luces',                  color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'cam1',   label: 'Cámara 1',               color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'cam2',   label: 'Cámara 2',               color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'sonido', label: 'Sonido',                 color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

const SERVICES = [
  { id: 'vie_8pm',  label: 'Viernes 8PM'  },
  { id: 'dom_8am',  label: 'Domingo 8AM'  },
  { id: 'dom_10am', label: 'Domingo 10AM' },
];

const ALL_MEMBERS = [
  'Jorge', 'Sky', 'Guillermo', 'Jeferson', 'Jhony', 'Shungú',
  'Heidy', 'Karen', 'Juan Diego', 'Jimmy', 'Emmanuel', 'Luis Carlos',
  'Janamy', 'Ares', 'Jordany',
];

type TurnoGrid = Record<string, Record<string, string[]>>;

const DEFAULT_TURNO: TurnoGrid = {
  pc1:    { vie_8pm: ['Jorge'],     dom_8am: ['Heidy', 'Karen'], dom_10am: ['Janamy']      },
  switch: { vie_8pm: ['Sky'],       dom_8am: ['Juan Diego'],     dom_10am: []              },
  luces:  { vie_8pm: ['Guillermo'], dom_8am: ['Guillermo'],      dom_10am: ['Luis Carlos'] },
  cam1:   { vie_8pm: ['Jeferson'],  dom_8am: ['Jimmy'],          dom_10am: []              },
  cam2:   { vie_8pm: ['Jhony'],     dom_8am: ['Emmanuel'],       dom_10am: []              },
  sonido: { vie_8pm: ['Shungú'],    dom_8am: ['Shungú'],         dom_10am: []              },
};

const STORAGE_KEY = 'tafe_turno_csi';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TurnoCSIProps {
  canEdit?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const TurnoCSI: React.FC<TurnoCSIProps> = ({ canEdit = false }) => {
  const [turno, setTurno] = useState<TurnoGrid>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TURNO;
    } catch {
      return DEFAULT_TURNO;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TurnoGrid>(DEFAULT_TURNO);
  const [activeCell, setActiveCell] = useState<{ roleId: string; svcId: string } | null>(null);

  const startEdit = () => {
    setDraft(JSON.parse(JSON.stringify(turno)));
    setIsEditing(true);
    setActiveCell(null);
  };

  const saveEdit = () => {
    setTurno(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setIsEditing(false);
    setActiveCell(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setActiveCell(null);
  };

  const toggleMember = (roleId: string, svcId: string, member: string) => {
    setDraft(prev => {
      const next = { ...prev, [roleId]: { ...prev[roleId] } };
      const cell = [...(next[roleId][svcId] ?? [])];
      const idx = cell.indexOf(member);
      if (idx >= 0) cell.splice(idx, 1);
      else cell.push(member);
      next[roleId][svcId] = cell;
      return next;
    });
  };

  const source = isEditing ? draft : turno;
  const isCellActive = (roleId: string, svcId: string) =>
    activeCell?.roleId === roleId && activeCell?.svcId === svcId;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio size={18} className="text-turqui" />
          <div>
            <h3 className="font-montserrat font-bold text-slate-800">Turno de Servicio CSI</h3>
            <p className="text-[10px] text-slate-400">Asignación de roles por servicio semanal</p>
          </div>
        </div>

        {canEdit && !isEditing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:border-turqui hover:text-turqui transition-all"
          >
            <Edit2 size={14} /> Editar Turnos
          </button>
        )}
        {canEdit && isEditing && (
          <div className="flex gap-2">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-400 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              onClick={saveEdit}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-turqui rounded-xl shadow-md shadow-turqui/20 hover:bg-turqui/90 transition-all"
            >
              <Save size={14} /> Guardar
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[2rem] border border-slate-200 shadow-sm bg-white">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-44">
                Rol / Estación
              </th>
              {SERVICES.map(svc => (
                <th key={svc.id} className="px-4 py-4 text-center text-[10px] font-bold text-navy-tafe uppercase tracking-widest">
                  {svc.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role, rIdx) => (
              <React.Fragment key={role.id}>
                <tr className={`border-b border-slate-50 ${rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  {/* Role label */}
                  <td className="px-6 py-4">
                    <span className={`inline-block text-[10px] font-bold px-3 py-1.5 rounded-xl border ${role.color}`}>
                      {role.label}
                    </span>
                  </td>

                  {/* Service cells */}
                  {SERVICES.map(svc => {
                    const members = source[role.id]?.[svc.id] ?? [];
                    const isActive = isCellActive(role.id, svc.id);

                    return (
                      <td key={svc.id} className="px-4 py-3 text-center align-top">
                        <div
                          onClick={() => {
                            if (!isEditing) return;
                            setActiveCell(isActive ? null : { roleId: role.id, svcId: svc.id });
                          }}
                          className={`inline-flex flex-wrap justify-center gap-1 min-h-[32px] min-w-[90px] px-2 py-1.5 rounded-xl transition-all ${
                            isEditing
                              ? isActive
                                ? 'bg-turqui/10 border-2 border-turqui cursor-pointer'
                                : 'bg-slate-100 border-2 border-dashed border-slate-200 cursor-pointer hover:border-turqui/40'
                              : ''
                          }`}
                        >
                          {members.length === 0 ? (
                            <span className="text-[10px] text-slate-300 font-medium self-center">—</span>
                          ) : (
                            members.map(m => (
                              <span
                                key={m}
                                className="text-[10px] font-bold text-navy-tafe bg-navy-tafe/5 border border-navy-tafe/10 px-2 py-0.5 rounded-lg"
                              >
                                {m}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Member picker row — appears below the active cell's row */}
                {isEditing && activeCell?.roleId === role.id && (
                  <tr className="bg-turqui/5 border-b border-turqui/10">
                    <td colSpan={4} className="px-6 py-4">
                      <div className="flex flex-col gap-2 animate-fadeIn">
                        <p className="text-[9px] font-bold text-turqui uppercase tracking-widest flex items-center gap-1.5">
                          <Users size={10} />
                          {role.label} · {SERVICES.find(s => s.id === activeCell.svcId)?.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ALL_MEMBERS.map(m => {
                            const selected = (draft[role.id]?.[activeCell.svcId] ?? []).includes(m);
                            return (
                              <button
                                key={m}
                                onClick={() => toggleMember(role.id, activeCell.svcId, m)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                                  selected
                                    ? 'bg-turqui text-white border-turqui shadow-md shadow-turqui/20'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-turqui/50'
                                }`}
                              >
                                {m}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <p className="text-[10px] text-slate-400 text-center">
          Toca una celda para asignar o quitar miembros · Los cambios se guardan localmente
        </p>
      )}
    </div>
  );
};

export default TurnoCSI;
