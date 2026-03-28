import React, { useState } from 'react';
import { ContentPiece, ContentChannel, ContentStatus, UserRole, ApostolicAxis } from '../types';
import {
  Newspaper,
  Plus,
  X,
  Filter,
  Search,
  ChevronDown,
  Check,
  Clock,
  Pencil,
  Trash2,
  Eye,
  FolderOpen,
  ExternalLink,
} from 'lucide-react';

interface ContentManagerProps {
  pieces: ContentPiece[];
  onAdd: (piece: ContentPiece) => void;
  onUpdate: (piece: ContentPiece) => void;
  onDelete: (id: string) => void;
  role: UserRole;
}

const CHANNEL_LABELS: Record<ContentChannel, string> = {
  FB: 'Facebook',
  INS: 'Instagram',
  YOU: 'YouTube',
  COMUNIDAD: 'Comunidad',
  WEB: 'Página Web',
  EN_VIVO: 'En Vivo',
  WHATSAPP: 'WhatsApp',
};

const STATUS_CONFIG: Record<ContentStatus, { label: string; bg: string; text: string; dot: string }> = {
  PENDIENTE:      { label: 'Pendiente',      bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
  EN_CONSTRUCCION:{ label: 'En construcción', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  EN_REVISION:    { label: 'En revisión',    bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  PUBLICADO:      { label: 'Publicado',      bg: 'bg-emerald-100',text: 'text-emerald-700',dot: 'bg-emerald-500' },
  CANCELADO:      { label: 'Cancelado',      bg: 'bg-slate-100',  text: 'text-slate-500',  dot: 'bg-slate-400' },
};

const ALL_CHANNELS: ContentChannel[] = ['FB', 'INS', 'YOU', 'COMUNIDAD', 'WEB', 'EN_VIVO', 'WHATSAPP'];
const ALL_STATUSES: ContentStatus[] = ['PENDIENTE', 'EN_CONSTRUCCION', 'EN_REVISION', 'PUBLICADO', 'CANCELADO'];

const EMPTY_PIECE: Omit<ContentPiece, 'id'> = {
  startDate: '',
  channels: [],
  topic: '',
  copy: '',
  status: 'PENDIENTE',
  notes: '',
  responsible: '',
  spellcheckBy: '',
  deliveryDate: '',
  campaign: '',
  driveUrl: '',
};

const ContentManager: React.FC<ContentManagerProps> = ({ pieces, onAdd, onUpdate, onDelete, role }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | 'ALL'>('ALL');
  const [filterCampaign, setFilterCampaign] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingPiece, setEditingPiece] = useState<ContentPiece | null>(null);
  const [form, setForm] = useState<Omit<ContentPiece, 'id'>>(EMPTY_PIECE);
  const [previewPiece, setPreviewPiece] = useState<ContentPiece | null>(null);

  const canEdit = role !== UserRole.PROSPECTO;

  const campaigns = ['ALL', ...Array.from(new Set(pieces.map(p => p.campaign).filter(Boolean)))];

  const filtered = pieces.filter(p => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (filterCampaign !== 'ALL' && p.campaign !== filterCampaign) return false;
    if (search && !p.topic.toLowerCase().includes(search.toLowerCase()) &&
        !p.responsible.toLowerCase().includes(search.toLowerCase()) &&
        !p.campaign.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openNew = () => {
    setEditingPiece(null);
    setForm(EMPTY_PIECE);
    setShowForm(true);
  };

  const openEdit = (piece: ContentPiece) => {
    setEditingPiece(piece);
    setForm({ ...piece });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.topic || !form.startDate || !form.responsible) return;
    if (editingPiece) {
      onUpdate({ ...form, id: editingPiece.id });
    } else {
      onAdd({ ...form, id: `cp_${Date.now()}` });
    }
    setShowForm(false);
    setForm(EMPTY_PIECE);
    setEditingPiece(null);
  };

  const toggleChannel = (ch: ContentChannel) => {
    setForm(prev => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter(c => c !== ch)
        : [...prev.channels, ch],
    }));
  };

  const statusCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = pieces.filter(p => p.status === s).length;
    return acc;
  }, {} as Record<ContentStatus, number>);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 text-turqui rounded-[1.8rem] shadow-xl">
            <Newspaper size={30} />
          </div>
          <div>
            <h2 className="text-2xl font-montserrat font-bold text-slate-800">Gestor de Contenidos</h2>
            <p className="text-slate-500 text-sm">Canales digitales TAFE · {new Date().getFullYear()}</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-6 py-3 bg-navy-tafe text-white font-bold rounded-2xl shadow-lg hover:bg-[#003366] transition-all"
          >
            <Plus size={18} /> Nueva pieza
          </button>
        )}
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {ALL_STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'ALL' : s)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                filterStatus === s
                  ? 'border-navy-tafe shadow-md scale-[1.02]'
                  : 'bg-white border-slate-100 hover:border-slate-300'
              }`}
            >
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${cfg.bg} ${cfg.text} mb-2`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </div>
              <p className="text-2xl font-mono font-bold text-slate-800">{statusCounts[s]}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por tema, responsable o campaña..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-turqui/30"
          />
        </div>
        <select
          value={filterCampaign}
          onChange={e => setFilterCampaign(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none cursor-pointer"
        >
          <option value="ALL">Todas las campañas</option>
          {campaigns.filter(c => c !== 'ALL').map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Fecha inicio</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Canales</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tema</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaña</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Responsable</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Rev. Ortogr.</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Entrega</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Archivo</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400 text-sm">
                    No hay piezas de contenido. {canEdit && 'Crea la primera con el botón "Nueva pieza".'}
                  </td>
                </tr>
              )}
              {filtered.map((piece, idx) => {
                const cfg = STATUS_CONFIG[piece.status];
                return (
                  <tr key={piece.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap font-mono text-xs">{piece.startDate || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {piece.channels.map(ch => (
                          <span key={ch} className="px-1.5 py-0.5 bg-navy-tafe/10 text-navy-tafe text-[9px] font-bold rounded-lg uppercase">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800 max-w-[200px] truncate">{piece.topic}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{piece.campaign || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs font-medium">{piece.responsible || '—'}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{piece.spellcheckBy || '—'}</td>
                    <td className="px-5 py-4 text-slate-500 font-mono text-xs whitespace-nowrap">{piece.deliveryDate || '—'}</td>
                    <td className="px-5 py-4">
                      {piece.driveUrl ? (
                        <a
                          href={piece.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all"
                        >
                          <FolderOpen size={12} /> Drive
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setPreviewPiece(piece)} className="p-1.5 text-slate-400 hover:text-turqui rounded-lg hover:bg-turqui/10 transition-all">
                          <Eye size={14} />
                        </button>
                        {canEdit && (
                          <>
                            <button onClick={() => openEdit(piece)} className="p-1.5 text-slate-400 hover:text-navy-tafe rounded-lg hover:bg-navy-tafe/10 transition-all">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => onDelete(piece.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
          {filtered.length} pieza{filtered.length !== 1 ? 's' : ''} {filterStatus !== 'ALL' || filterCampaign !== 'ALL' || search ? 'filtradas' : 'en total'}
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mb-10">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <h3 className="font-montserrat font-bold text-slate-800 text-lg">
                {editingPiece ? 'Editar pieza' : 'Nueva pieza de contenido'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              {/* Tema */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tema *</label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                  placeholder="Ej: Oración en vivo — Matutino"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-turqui/30"
                />
              </div>

              {/* Campaña */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Campaña / Serie</label>
                <input
                  type="text"
                  value={form.campaign}
                  onChange={e => setForm(p => ({ ...p, campaign: e.target.value }))}
                  placeholder="Ej: Nuevos en Casa — Q2 2026"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-turqui/30"
                />
              </div>

              {/* Canales */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Canales *</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_CHANNELS.map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        form.channels.includes(ch)
                          ? 'bg-navy-tafe text-white border-navy-tafe'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-navy-tafe'
                      }`}
                    >
                      {CHANNEL_LABELS[ch]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Copy */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Copy / Descripción</label>
                <textarea
                  rows={3}
                  value={form.copy}
                  onChange={e => setForm(p => ({ ...p, copy: e.target.value }))}
                  placeholder="Texto o descripción de la pieza..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-turqui/30 resize-none"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Fecha inicio *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-turqui/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Fecha entrega</label>
                  <input
                    type="date"
                    value={form.deliveryDate}
                    onChange={e => setForm(p => ({ ...p, deliveryDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-turqui/30"
                  />
                </div>
              </div>

              {/* Responsables */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Responsable *</label>
                  <input
                    type="text"
                    value={form.responsible}
                    onChange={e => setForm(p => ({ ...p, responsible: e.target.value }))}
                    placeholder="Ej: Heidy"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-turqui/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Revisión ortográfica</label>
                  <input
                    type="text"
                    value={form.spellcheckBy}
                    onChange={e => setForm(p => ({ ...p, spellcheckBy: e.target.value }))}
                    placeholder="Ej: Sky"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-turqui/30"
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Estado</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map(s => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, status: s }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          form.status === s
                            ? `${cfg.bg} ${cfg.text} border-current`
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Notas</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Ej: Usar plantilla Canva, imprimir QR..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-turqui/30"
                />
              </div>

              {/* Google Drive */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <FolderOpen size={12} /> Enlace Google Drive
                </label>
                <input
                  type="url"
                  value={form.driveUrl}
                  onChange={e => setForm(p => ({ ...p, driveUrl: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-turqui/30"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Sube el archivo a Drive, copia el enlace compartido y pégalo aquí.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 pb-8">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.topic || !form.startDate || !form.responsible}
                className="px-8 py-3 bg-navy-tafe text-white font-bold rounded-2xl shadow-lg hover:bg-[#003366] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check size={16} /> {editingPiece ? 'Guardar cambios' : 'Crear pieza'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewPiece && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <h3 className="font-montserrat font-bold text-slate-800">{previewPiece.topic}</h3>
              <button onClick={() => setPreviewPiece(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="p-8 space-y-4 text-sm">
              {[
                ['Campaña', previewPiece.campaign || '—'],
                ['Canales', previewPiece.channels.map(c => CHANNEL_LABELS[c]).join(', ') || '—'],
                ['Copy', previewPiece.copy || '—'],
                ['Responsable', previewPiece.responsible || '—'],
                ['Revisión ortogr.', previewPiece.spellcheckBy || '—'],
                ['Fecha inicio', previewPiece.startDate || '—'],
                ['Fecha entrega', previewPiece.deliveryDate || '—'],
                ['Notas', previewPiece.notes || '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32 shrink-0 pt-0.5">{label}</span>
                  <span className="text-slate-700">{val}</span>
                </div>
              ))}
              <div className="flex gap-3 items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32 shrink-0">Archivo</span>
                {previewPiece.driveUrl ? (
                  <a
                    href={previewPiece.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all"
                  >
                    <FolderOpen size={13} /> Abrir en Drive <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="text-slate-400 text-sm">Sin archivo adjunto</span>
                )}
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32 shrink-0">Estado</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold ${STATUS_CONFIG[previewPiece.status].bg} ${STATUS_CONFIG[previewPiece.status].text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[previewPiece.status].dot}`} />
                  {STATUS_CONFIG[previewPiece.status].label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;
