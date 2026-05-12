
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import {
  Music2, Bell, Timer, Film, Mic2, Heart, PlayCircle,
  Newspaper, BookOpen, Sparkles, Star, ThumbsUp, Users,
  Pencil, Trash2, Check, X, AlertTriangle, Info as InfoIcon,
  Copy, ChevronDown, ChevronUp, Plus, Lock, User,
  Image as ImageIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'viernes' | 'domingo' | 'equipo' | 'novedades';
type TipoNovedad = 'warn' | 'info' | 'ok';
type GrupoEquipo = 'medios' | 'alabanza' | 'pastoral';
type IconKey =
  | 'imagen' | 'countdown' | 'cabezote' | 'ministro' | 'canciones'
  | 'ofrendas' | 'video' | 'tafe' | 'gracias' | 'pastor'
  | 'ministracion' | 'especial';

interface OrdenItem {
  id: string;
  iconKey: IconKey;
  name: string;
  desc: string;
  time: string;
  rolesAsignados: string[];
  novedad: string;
  ewSlide: string;
}

interface Novedad {
  id: string;
  tipo: TipoNovedad;
  titulo: string;
  texto: string;
}

interface EquipoMiembro {
  id: string;
  name: string;
  role: string;
  grupo: GrupoEquipo;
}

interface OrdenState {
  itemsViernes: OrdenItem[];
  itemsDomingo: OrdenItem[];
  equipo: EquipoMiembro[];
  novedades: Novedad[];
}

interface Props {
  role: UserRole;
}

// ─── Icon & color maps ────────────────────────────────────────────────────────

const ICON_MAP: Record<IconKey, React.ReactNode> = {
  imagen:       <ImageIcon size={14} />,
  countdown:    <Timer size={14} />,
  cabezote:     <Film size={14} />,
  ministro:     <Mic2 size={14} />,
  canciones:    <Music2 size={14} />,
  ofrendas:     <Heart size={14} />,
  video:        <PlayCircle size={14} />,
  tafe:         <Newspaper size={14} />,
  gracias:      <ThumbsUp size={14} />,
  pastor:       <BookOpen size={14} />,
  ministracion: <Sparkles size={14} />,
  especial:     <Star size={14} />,
};

const COLOR_MAP: Record<IconKey, string> = {
  imagen:       'bg-purple-100 text-purple-700',
  countdown:    'bg-purple-100 text-purple-700',
  cabezote:     'bg-purple-100 text-purple-700',
  ministro:     'bg-emerald-100 text-emerald-700',
  canciones:    'bg-emerald-100 text-emerald-700',
  ofrendas:     'bg-amber-100 text-amber-700',
  video:        'bg-purple-100 text-purple-700',
  tafe:         'bg-blue-100 text-blue-700',
  gracias:      'bg-slate-100 text-slate-600',
  pastor:       'bg-amber-100 text-amber-700',
  ministracion: 'bg-amber-100 text-amber-700',
  especial:     'bg-emerald-100 text-emerald-700',
};

const ICON_OPTIONS: IconKey[] = [
  'imagen', 'countdown', 'cabezote', 'ministro', 'canciones',
  'ofrendas', 'video', 'tafe', 'gracias', 'pastor', 'ministracion', 'especial',
];

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_VIERNES: OrdenItem[] = [
  { id: 'v1', iconKey: 'imagen',    name: 'Imagen de inicio',       desc: 'Próximo evento — diseño por equipo de medios',    time: '–20 min',     rolesAsignados: ['Medios: carga imagen en EW'],                                  novedad: 'Pendiente diseño del equipo',       ewSlide: 'Imagen próximo evento' },
  { id: 'v2', iconKey: 'countdown', name: 'Countdown 10 min',        desc: 'Timer cuenta regresiva antes de iniciar',         time: '–10 min',     rolesAsignados: ['Medios: activa slide countdown'],                              novedad: '',                                  ewSlide: 'Slide countdown 10:00' },
  { id: 'v3', iconKey: 'cabezote',  name: 'Cabezote TAFE',           desc: 'Video de apertura del servicio',                  time: '00:00',       rolesAsignados: ['Medios: reproduce cabezote'],                                  novedad: '',                                  ewSlide: 'Video cabezote TAFE' },
  { id: 'v4', iconKey: 'ministro',  name: 'Ministro de alabanza',    desc: 'Nombre del ministro a cargo — asignar',           time: '+2 min',      rolesAsignados: ['Medios: slide nombre ministro'],                               novedad: 'Asignar ministro',                  ewSlide: 'Slide nombre ministro 1' },
  { id: 'v5', iconKey: 'canciones', name: '4 – 6 canciones',         desc: 'Letras con fondos o video de fondo',              time: '+5 min',      rolesAsignados: ['Medios: secuencia letras EW', 'Alabanza: lista de canciones'], novedad: 'Confirmar lista con alabanza',      ewSlide: 'Canciones (letras + fondos)' },
  { id: 'v6', iconKey: 'ministro',  name: 'Ministro de cierre',      desc: 'Nombre del ministro de transición — asignar',     time: 'variable',    rolesAsignados: ['Medios: slide nombre ministro 2'],                             novedad: 'Asignar ministro',                  ewSlide: 'Slide nombre ministro 2' },
  { id: 'v7', iconKey: 'ofrendas',  name: 'Diezmos y ofrendas',      desc: 'Video de diezmos y ofrendas',                     time: 'variable',    rolesAsignados: ['Medios: reproduce video ofrendas'],                            novedad: '',                                  ewSlide: 'Video diezmos y ofrendas' },
  { id: 'v8', iconKey: 'tafe',      name: 'TAFE News',               desc: 'Video informativo semanal',                       time: 'variable',    rolesAsignados: ['Medios: reproduce TAFE News viernes'],                         novedad: 'Confirmar si hay versión viernes',  ewSlide: 'Video TAFE News' },
  { id: 'v9', iconKey: 'gracias',   name: 'Imagen de cierre',        desc: 'Gracias por acompañarnos',                        time: 'final',       rolesAsignados: ['Medios: activa imagen cierre'],                                novedad: '',                                  ewSlide: 'Imagen gracias por acompañarnos' },
];

const DEFAULT_DOMINGO: OrdenItem[] = [
  { id: 'd1',  iconKey: 'imagen',       name: 'Imagen de inicio',                    desc: 'Próximo evento o anuncio',                          time: '–20 min',     rolesAsignados: ['Medios: carga imagen en EW'],                                       novedad: '',               ewSlide: 'Imagen próximo evento' },
  { id: 'd2',  iconKey: 'countdown',    name: 'Countdown 10 min',                    desc: 'Timer cuenta regresiva',                            time: '–10 min',     rolesAsignados: ['Medios: activa slide countdown'],                                   novedad: '',               ewSlide: 'Slide countdown 10:00' },
  { id: 'd3',  iconKey: 'cabezote',     name: 'Cabezote TAFE',                       desc: 'Video apertura',                                    time: '00:00',       rolesAsignados: ['Medios: reproduce cabezote'],                                       novedad: '',               ewSlide: 'Video cabezote TAFE' },
  { id: 'd4',  iconKey: 'ministro',     name: 'Ministro de alabanza',                desc: 'Nombre del ministro a cargo',                       time: '+2 min',      rolesAsignados: ['Medios: slide nombre ministro'],                                    novedad: '',               ewSlide: 'Slide nombre ministro' },
  { id: 'd5',  iconKey: 'canciones',    name: '4 canciones',                         desc: 'Letras con fondos o video de fondo',                time: '+5 min',      rolesAsignados: ['Medios: secuencia letras', 'Alabanza: lista canciones'],            novedad: 'Confirmar lista', ewSlide: 'Canciones (letras + fondos)' },
  { id: 'd6',  iconKey: 'especial',     name: 'Especial (opcional)',                  desc: 'Número especial — confirmar si aplica',             time: 'variable',    rolesAsignados: ['Medios: material especial si aplica'],                              novedad: 'Por confirmar',  ewSlide: '[OPCIONAL] Especial' },
  { id: 'd7',  iconKey: 'pastor',       name: 'Pastor Lancelot',                     desc: 'Prédica dominical',                                 time: 'variable',    rolesAsignados: ['Medios: slide nombre pastor', 'StreamLabs: verificar audio'],      novedad: '',               ewSlide: 'Slide pastor Lancelot' },
  { id: 'd8',  iconKey: 'ministracion', name: 'Ministración — Profeta Nelda Ayala',  desc: 'Ministración post-prédica',                         time: 'post-prédica', rolesAsignados: ['Medios: slide nombre ministra'],                                   novedad: '',               ewSlide: 'Slide profeta Nelda Ayala' },
  { id: 'd9',  iconKey: 'ofrendas',     name: 'Diezmos y ofrendas',                  desc: 'Video — a cargo de profeta Nelda',                  time: 'variable',    rolesAsignados: ['Medios: reproduce video ofrendas'],                                 novedad: '',               ewSlide: 'Video diezmos y ofrendas' },
  { id: 'd10', iconKey: 'tafe',         name: 'TAFE News',                           desc: 'Video informativo semanal — versión domingo',       time: 'variable',    rolesAsignados: ['Medios: reproduce TAFE News domingo'],                              novedad: '',               ewSlide: 'Video TAFE News domingo' },
  { id: 'd11', iconKey: 'gracias',      name: 'Imagen de cierre',                    desc: 'Gracias por acompañarnos',                          time: 'final',       rolesAsignados: ['Medios: activa imagen cierre'],                                     novedad: '',               ewSlide: 'Imagen gracias por acompañarnos' },
];

const DEFAULT_EQUIPO: EquipoMiembro[] = [
  { id: 'e1', name: 'Equipo de medios',     role: 'Operador principal EW',             grupo: 'medios' },
  { id: 'e2', name: 'Diseñador/a',          role: 'Fondos, imágenes, TAFE News',       grupo: 'medios' },
  { id: 'e3', name: 'Operador cámara',      role: 'Grabación y streaming',             grupo: 'medios' },
  { id: 'e4', name: 'StreamLabs',           role: 'Monitor audio en vivo',             grupo: 'medios' },
  { id: 'e5', name: 'Ministro de alabanza', role: 'Viernes — por asignar',             grupo: 'alabanza' },
  { id: 'e6', name: 'Ministro de cierre',   role: 'Viernes — por asignar',             grupo: 'alabanza' },
  { id: 'e7', name: 'Ministro dominical',   role: 'Domingo — por asignar',             grupo: 'alabanza' },
  { id: 'e8', name: 'Pastor Lancelot',      role: 'Prédica dominical',                 grupo: 'pastoral' },
  { id: 'e9', name: 'Profeta Nelda Ayala',  role: 'Ministración y ofrendas (domingo)', grupo: 'pastoral' },
];

const DEFAULT_NOVEDADES: Novedad[] = [
  { id: 'n1', tipo: 'warn', titulo: 'StreamLabs — verificar audio',         texto: 'Recordar monitorear el canal del pastor en StreamLabs durante la prédica. Audio del Behringer X32 bus transmisión.' },
  { id: 'n2', tipo: 'info', titulo: 'TAFE News — versión viernes pendiente', texto: 'El equipo de medios debe confirmar si hay TAFE News específico para el servicio del viernes.' },
  { id: 'n3', tipo: 'ok',   titulo: 'Cabezote actualizado',                  texto: 'El video de cabezote para este mes ya está cargado en Easy Worship por el equipo de medios.' },
];

const DEFAULT_STATE: OrdenState = {
  itemsViernes: DEFAULT_VIERNES,
  itemsDomingo: DEFAULT_DOMINGO,
  equipo: DEFAULT_EQUIPO,
  novedades: DEFAULT_NOVEDADES,
};

const STORAGE_KEY = 'tafe_erp_orden_del_dia';
const GRUPO_LABELS: Record<GrupoEquipo, string> = {
  medios:    'Equipo de medios',
  alabanza:  'Ministerio de alabanza',
  pastoral:  'Ministerio pastoral',
};

// ─── Component ────────────────────────────────────────────────────────────────

const OrdenDelDia: React.FC<Props> = ({ role }) => {
  const canEdit = role === UserRole.SUPER_ADMIN || role === UserRole.LIDER_MINISTERIO;

  const [state, setState] = useState<OrdenState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  const [activeTab, setActiveTab]     = useState<Tab>('viernes');
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editForm, setEditForm]       = useState<Partial<OrdenItem> & { rolesStr?: string }>({});
  const [editEquipoId, setEditEquipoId] = useState<string | null>(null);
  const [equipoForm, setEquipoForm]   = useState<{ name: string; role: string }>({ name: '', role: '' });
  const [showAddEquipo, setShowAddEquipo] = useState(false);
  const [newEquipo, setNewEquipo]     = useState<{ name: string; role: string; grupo: GrupoEquipo }>({ name: '', role: '', grupo: 'medios' });
  const [showNovedadForm, setShowNovedadForm] = useState(false);
  const [novedadForm, setNovedadForm] = useState<{ tipo: TipoNovedad; titulo: string; texto: string }>({ tipo: 'info', titulo: '', texto: '' });
  const [copied, setCopied]           = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const isServiceTab = activeTab === 'viernes' || activeTab === 'domingo';
  const currentItems = activeTab === 'viernes' ? state.itemsViernes : state.itemsDomingo;

  const setCurrentItems = (fn: (prev: OrdenItem[]) => OrdenItem[]) => {
    if (activeTab === 'viernes') setState(s => ({ ...s, itemsViernes: fn(s.itemsViernes) }));
    else                         setState(s => ({ ...s, itemsDomingo: fn(s.itemsDomingo) }));
  };

  // ── Item editing ───────────────────────────────────────────────────────────

  const startEditItem = (item: OrdenItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setExpandedId(item.id);
    setEditForm({ ...item, rolesStr: item.rolesAsignados.join('\n') });
  };

  const saveEditItem = () => {
    if (!editingId) return;
    setCurrentItems(prev => prev.map(it => {
      if (it.id !== editingId) return it;
      return {
        ...it,
        name:          (editForm.name  ?? it.name).trim(),
        desc:          (editForm.desc  ?? it.desc).trim(),
        time:          (editForm.time  ?? it.time).trim(),
        ewSlide:       (editForm.ewSlide ?? it.ewSlide).trim(),
        novedad:       (editForm.novedad ?? it.novedad).trim(),
        iconKey:       (editForm.iconKey ?? it.iconKey) as IconKey,
        rolesAsignados: (editForm.rolesStr ?? '')
          .split('\n').map(r => r.trim()).filter(Boolean),
      };
    }));
    setEditingId(null);
    setEditForm({});
  };

  const cancelEditItem = () => { setEditingId(null); setEditForm({}); };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentItems(prev => prev.filter(it => it.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addItem = () => {
    const newItem: OrdenItem = {
      id:             `item_${Date.now()}`,
      iconKey:        'video',
      name:           'Nuevo elemento',
      desc:           'Descripción del elemento',
      time:           'variable',
      rolesAsignados: ['Medios: asignar'],
      novedad:        'Pendiente configurar',
      ewSlide:        'Nuevo slide EW',
    };
    setCurrentItems(prev => [...prev, newItem]);
    setExpandedId(newItem.id);
    setEditingId(newItem.id);
    setEditForm({ ...newItem, rolesStr: newItem.rolesAsignados.join('\n') });
  };

  // ── EW Export ──────────────────────────────────────────────────────────────

  const exportEW = () => {
    const label = activeTab === 'viernes' ? 'VIERNES ADORACIÓN' : 'DOMINGO SERVICIO';
    const lines = currentItems.map((it, i) => `${i + 1}. ${it.ewSlide}`).join('\n');
    const text = `ORDEN DEL DÍA — ${label}\nIglesia TAFE\n\n${lines}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Equipo ─────────────────────────────────────────────────────────────────

  const startEditEquipo = (m: EquipoMiembro, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditEquipoId(m.id);
    setEquipoForm({ name: m.name, role: m.role });
  };

  const saveEquipo = () => {
    if (!editEquipoId) return;
    setState(s => ({
      ...s,
      equipo: s.equipo.map(m =>
        m.id === editEquipoId ? { ...m, name: equipoForm.name.trim(), role: equipoForm.role.trim() } : m
      ),
    }));
    setEditEquipoId(null);
    setEquipoForm({ name: '', role: '' });
  };

  const addEquipoMember = () => {
    if (!newEquipo.name.trim()) return;
    setState(s => ({
      ...s,
      equipo: [...s.equipo, { id: `eq_${Date.now()}`, ...newEquipo }],
    }));
    setNewEquipo({ name: '', role: '', grupo: 'medios' });
    setShowAddEquipo(false);
  };

  const deleteEquipo = (id: string) => {
    setState(s => ({ ...s, equipo: s.equipo.filter(m => m.id !== id) }));
  };

  // ── Novedades ──────────────────────────────────────────────────────────────

  const addNovedad = () => {
    if (!novedadForm.titulo.trim()) return;
    setState(s => ({
      ...s,
      novedades: [{ id: `n_${Date.now()}`, ...novedadForm }, ...s.novedades],
    }));
    setNovedadForm({ tipo: 'info', titulo: '', texto: '' });
    setShowNovedadForm(false);
  };

  const deleteNovedad = (id: string) => {
    setState(s => ({ ...s, novedades: s.novedades.filter(n => n.id !== id) }));
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const StatusBadge = ({ novedad }: { novedad: string }) =>
    novedad ? (
      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-amber-200 truncate max-w-[180px]">
        <AlertTriangle size={10} className="flex-shrink-0" /> <span className="truncate">{novedad}</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-emerald-200">
        <Check size={10} /> listo
      </span>
    );

  const novedadStyle: Record<TipoNovedad, { card: string; badge: string; icon: React.ReactNode }> = {
    warn: { card: 'bg-red-50 border-red-200',     badge: 'bg-red-100 text-red-700',     icon: <AlertTriangle size={11} /> },
    info: { card: 'bg-blue-50 border-blue-200',   badge: 'bg-blue-100 text-blue-700',   icon: <InfoIcon size={11} /> },
    ok:   { card: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', icon: <Check size={11} /> },
  };

  // ── Tabs ───────────────────────────────────────────────────────────────────

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'viernes',   label: 'Viernes adoración', icon: <Music2 size={13} /> },
    { id: 'domingo',   label: 'Domingo servicio',  icon: <BookOpen size={13} /> },
    { id: 'equipo',    label: 'Equipo & roles',    icon: <Users size={13} /> },
    { id: 'novedades', label: 'Novedades',         icon: <Bell size={13} /> },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Orden del Día — Servicios TAFE</h2>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            Plantilla base para Easy Worship · visible para todo el equipo
            {!canEdit && (
              <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                <Lock size={11} /> Solo lectura
              </span>
            )}
          </p>
        </div>
        {isServiceTab && (
          <button
            onClick={exportEW}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            {copied
              ? <><Check size={14} className="text-emerald-500" /> Copiado</>
              : <><Copy size={14} /> Copiar secuencia EW</>
            }
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setExpandedId(null); setEditingId(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === t.id
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── VIERNES / DOMINGO ────────────────────────────────────────────────── */}
      {isServiceTab && (
        <div className="space-y-4">

          {/* Status bar */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex-wrap">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${activeTab === 'viernes' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <span className="text-sm text-slate-600">
              {activeTab === 'viernes'
                ? <><strong>Próximo viernes:</strong> Ministro de alabanza — pendiente asignar · Ministro de cierre — pendiente</>
                : <><strong>Próximo domingo:</strong> Pastor Lancelot · Ministración: Profeta Nelda Ayala</>
              }
            </span>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            {currentItems.map((item, i) => {
              const isLast     = i === currentItems.length - 1;
              const isExpanded = expandedId === item.id;
              const isEditing  = editingId === item.id;
              const iconCls    = COLOR_MAP[item.iconKey] ?? 'bg-slate-100 text-slate-600';

              return (
                <div key={item.id}>
                  {/* Row */}
                  <div
                    className={`flex gap-3 cursor-pointer rounded-xl transition-colors px-2 py-1.5 ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                    onClick={() => { if (!isEditing) setExpandedId(isExpanded ? null : item.id); }}
                  >
                    {/* Time + connector */}
                    <div className="flex flex-col items-center w-14 flex-shrink-0 pt-1.5">
                      <span className="text-[10px] text-slate-400 font-mono font-semibold leading-none">{item.time}</span>
                      {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[16px]" />}
                    </div>
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconCls} mt-0.5`}>
                      {ICON_MAP[item.iconKey]}
                    </div>
                    {/* Body */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">{item.name}</span>
                        <StatusBadge novedad={item.novedad} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
                    </div>
                    <div className="text-slate-400 self-center flex-shrink-0">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {/* Expanded detail (view) */}
                  {isExpanded && !isEditing && (
                    <div className="ml-[4.5rem] mb-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Roles asignados</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.rolesAsignados.map((r, ri) => (
                            <span key={ri} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg">
                              <User size={10} className="text-slate-400" /> {r}
                            </span>
                          ))}
                        </div>
                      </div>
                      {item.novedad && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Novedad / pendiente</p>
                          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">{item.novedad}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Slide Easy Worship</p>
                        <p className="text-xs text-slate-600 font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">{item.ewSlide}</p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2 pt-1 border-t border-slate-200">
                          <button
                            onClick={e => startEditItem(item, e)}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Pencil size={11} /> Editar
                          </button>
                          <button
                            onClick={e => deleteItem(item.id, e)}
                            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={11} /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline edit form */}
                  {isEditing && (
                    <div
                      className="ml-[4.5rem] mb-2 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre</label>
                          <input
                            className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400"
                            value={editForm.name ?? ''}
                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiempo</label>
                          <input
                            className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400"
                            value={editForm.time ?? ''}
                            onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descripción</label>
                        <input
                          className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400"
                          value={editForm.desc ?? ''}
                          onChange={e => setEditForm(f => ({ ...f, desc: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Slide EW</label>
                          <input
                            className="mt-1 w-full text-sm font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400"
                            value={editForm.ewSlide ?? ''}
                            onChange={e => setEditForm(f => ({ ...f, ewSlide: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ícono</label>
                          <select
                            className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400"
                            value={editForm.iconKey ?? 'video'}
                            onChange={e => setEditForm(f => ({ ...f, iconKey: e.target.value as IconKey }))}
                          >
                            {ICON_OPTIONS.map(k => (
                              <option key={k} value={k}>{k}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Roles asignados <span className="normal-case font-normal">(uno por línea)</span>
                        </label>
                        <textarea
                          rows={3}
                          className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400 resize-none"
                          value={editForm.rolesStr ?? ''}
                          onChange={e => setEditForm(f => ({ ...f, rolesStr: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Novedad / pendiente</label>
                        <input
                          className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400"
                          placeholder="Dejar vacío si está listo"
                          value={editForm.novedad ?? ''}
                          onChange={e => setEditForm(f => ({ ...f, novedad: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={saveEditItem}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Check size={12} /> Guardar
                        </button>
                        <button
                          onClick={cancelEditItem}
                          className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 hover:bg-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <X size={12} /> Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add item */}
            {canEdit && (
              <button
                onClick={addItem}
                className="w-full mt-2 flex items-center justify-center gap-2 border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-sm py-2.5 rounded-xl transition-all"
              >
                <Plus size={14} /> Agregar elemento
              </button>
            )}
          </div>

          {/* EW Sequence list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Secuencia Easy Worship — {activeTab === 'viernes' ? 'Viernes' : 'Domingo'}
            </p>
            <div className="space-y-0.5">
              {currentItems.map((it, i) => (
                <div key={it.id} className="flex gap-3 items-center py-1 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-mono text-slate-400 w-5 flex-shrink-0 text-right">{i + 1}</span>
                  <span className="text-sm text-slate-700">{it.ewSlide}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EQUIPO & ROLES ───────────────────────────────────────────────────── */}
      {activeTab === 'equipo' && (
        <div className="space-y-4">
          {(['medios', 'alabanza', 'pastoral'] as GrupoEquipo[]).map(grupo => (
            <div key={grupo} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                {GRUPO_LABELS[grupo]}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {state.equipo.filter(m => m.grupo === grupo).map(m =>
                  editEquipoId === m.id ? (
                    <div key={m.id} className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                      <input
                        className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400"
                        placeholder="Nombre"
                        value={equipoForm.name}
                        onChange={e => setEquipoForm(f => ({ ...f, name: e.target.value }))}
                      />
                      <input
                        className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400"
                        placeholder="Rol"
                        value={equipoForm.role}
                        onChange={e => setEquipoForm(f => ({ ...f, role: e.target.value }))}
                      />
                      <div className="flex gap-1.5">
                        <button onClick={saveEquipo} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-xs font-semibold py-1.5 rounded-lg">
                          <Check size={11} /> Guardar
                        </button>
                        <button onClick={() => setEditEquipoId(null)} className="flex-1 border border-slate-200 bg-white text-slate-600 text-xs py-1.5 rounded-lg">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="p-3 border border-slate-200 rounded-xl group flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User size={13} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{m.role}</p>
                      </div>
                      {canEdit && (
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => startEditEquipo(m, e)} className="text-slate-400 hover:text-blue-500 p-0.5 rounded">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => deleteEquipo(m.id)} className="text-slate-400 hover:text-red-500 p-0.5 rounded">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Add equipo member */}
          {canEdit && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              {showAddEquipo ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agregar miembro al equipo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white"
                      placeholder="Nombre"
                      value={newEquipo.name}
                      onChange={e => setNewEquipo(f => ({ ...f, name: e.target.value }))}
                    />
                    <input
                      className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white"
                      placeholder="Rol"
                      value={newEquipo.role}
                      onChange={e => setNewEquipo(f => ({ ...f, role: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grupo</label>
                    <select
                      className="mt-1 text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400 w-full"
                      value={newEquipo.grupo}
                      onChange={e => setNewEquipo(f => ({ ...f, grupo: e.target.value as GrupoEquipo }))}
                    >
                      <option value="medios">Equipo de medios</option>
                      <option value="alabanza">Ministerio de alabanza</option>
                      <option value="pastoral">Ministerio pastoral</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addEquipoMember} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                      <Plus size={13} /> Agregar
                    </button>
                    <button onClick={() => setShowAddEquipo(false)} className="text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddEquipo(true)}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-sm py-2.5 rounded-xl transition-all"
                >
                  <Plus size={14} /> Agregar miembro al equipo
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── NOVEDADES ────────────────────────────────────────────────────────── */}
      {activeTab === 'novedades' && (
        <div>
          {state.novedades.length === 0 && !showNovedadForm && (
            <div className="text-center py-16 text-slate-400">
              <Bell size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Sin novedades registradas</p>
            </div>
          )}

          {state.novedades.map(n => {
            const s = novedadStyle[n.tipo];
            return (
              <div key={n.id} className={`p-4 rounded-xl border ${s.card} mb-3`}>
                <div className="flex items-start justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 ${s.badge} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                    {s.icon} {n.titulo}
                  </span>
                  {canEdit && (
                    <button onClick={() => deleteNovedad(n.id)} className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mt-2">{n.texto}</p>
              </div>
            );
          })}

          {canEdit && (
            <div className="mt-2">
              {showNovedadForm ? (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Título</label>
                      <input
                        className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white"
                        placeholder="Título de la novedad"
                        value={novedadForm.titulo}
                        onChange={e => setNovedadForm(f => ({ ...f, titulo: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                      <select
                        className="mt-1 text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400"
                        value={novedadForm.tipo}
                        onChange={e => setNovedadForm(f => ({ ...f, tipo: e.target.value as TipoNovedad }))}
                      >
                        <option value="info">Info</option>
                        <option value="warn">Alerta</option>
                        <option value="ok">Ok</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detalle</label>
                    <textarea
                      rows={3}
                      className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white resize-none"
                      placeholder="Descripción de la novedad..."
                      value={novedadForm.texto}
                      onChange={e => setNovedadForm(f => ({ ...f, texto: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addNovedad} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                      <Check size={13} /> Registrar novedad
                    </button>
                    <button onClick={() => setShowNovedadForm(false)} className="text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNovedadForm(true)}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-sm py-3 rounded-xl transition-all"
                >
                  <Plus size={14} /> Registrar novedad
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdenDelDia;
