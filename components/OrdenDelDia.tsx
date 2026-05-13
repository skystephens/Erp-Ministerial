
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole } from '../types';
import {
  Music2, Bell, Timer, Film, Mic2, Heart, PlayCircle,
  Newspaper, BookOpen, Sparkles, Star, ThumbsUp, Users,
  Pencil, Trash2, Check, X, AlertTriangle, Info as InfoIcon,
  Copy, ChevronDown, ChevronUp, Plus, Lock, User,
  Image as ImageIcon, CalendarDays,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TipoServicio = 'viernes' | 'domingo';
type TipoNovedad = 'warn' | 'info' | 'ok';
type GrupoEquipo = 'medios' | 'alabanza' | 'pastoral';
type PrograSection = 'viernes' | 'domingos' | 'ayunos' | 'eventos';
type IconKey =
  | 'imagen' | 'countdown' | 'cabezote' | 'ministro' | 'canciones'
  | 'ofrendas' | 'video' | 'tafe' | 'gracias' | 'pastor'
  | 'ministracion' | 'especial';

interface OrdenItem {
  id: string; iconKey: IconKey; name: string; desc: string; time: string;
  rolesAsignados: string[]; novedad: string; ewSlide: string;
}
interface Novedad { id: string; tipo: TipoNovedad; titulo: string; texto: string; }
interface EquipoMiembro { id: string; name: string; role: string; grupo: GrupoEquipo; }
interface ServicioViernes  { id: string; fechaLabel: string; ministro: string; tema: string; oracion: string; }
interface ServicioDomingo  { id: string; fechaLabel: string; primerServicio: string; segundoServicio: string; tema: string; }
interface Ayuno            { id: string; fechaLabel: string; ministerio: string; tema: string; }
interface EventoMes        { id: string; fechaLabel: string; nombre: string; lugar: string; hora: string; }
interface ProgramaMes {
  mesLabel: string; liderCargo: string; temasMes: string[];
  viernes: ServicioViernes[]; domingos: ServicioDomingo[]; ayunos: Ayuno[]; eventos: EventoMes[];
}
interface ServicioDetalle {
  id: string; tipo: TipoServicio;
  ordenItems: OrdenItem[]; equipo: EquipoMiembro[]; novedades: Novedad[];
}
interface OrdenState { programaMes: ProgramaMes; servicioData: Record<string, ServicioDetalle>; }
interface Props { role: UserRole; }

// ─── Maps ─────────────────────────────────────────────────────────────────────

const ICON_MAP: Record<IconKey, React.ReactNode> = {
  imagen: <ImageIcon size={14}/>, countdown: <Timer size={14}/>, cabezote: <Film size={14}/>,
  ministro: <Mic2 size={14}/>, canciones: <Music2 size={14}/>, ofrendas: <Heart size={14}/>,
  video: <PlayCircle size={14}/>, tafe: <Newspaper size={14}/>, gracias: <ThumbsUp size={14}/>,
  pastor: <BookOpen size={14}/>, ministracion: <Sparkles size={14}/>, especial: <Star size={14}/>,
};
const COLOR_MAP: Record<IconKey, string> = {
  imagen: 'bg-purple-100 text-purple-700', countdown: 'bg-purple-100 text-purple-700',
  cabezote: 'bg-purple-100 text-purple-700', ministro: 'bg-emerald-100 text-emerald-700',
  canciones: 'bg-emerald-100 text-emerald-700', ofrendas: 'bg-amber-100 text-amber-700',
  video: 'bg-purple-100 text-purple-700', tafe: 'bg-blue-100 text-blue-700',
  gracias: 'bg-slate-100 text-slate-600', pastor: 'bg-amber-100 text-amber-700',
  ministracion: 'bg-amber-100 text-amber-700', especial: 'bg-emerald-100 text-emerald-700',
};
const ICON_OPTIONS: IconKey[] = [
  'imagen','countdown','cabezote','ministro','canciones','ofrendas',
  'video','tafe','gracias','pastor','ministracion','especial',
];
const GRUPO_LABELS: Record<GrupoEquipo, string> = {
  medios: 'Equipo de medios', alabanza: 'Ministerio de alabanza', pastoral: 'Ministerio pastoral',
};
const PROGRA_FIELDS: Record<PrograSection, { key: string; label: string; placeholder: string }[]> = {
  viernes: [
    { key: 'fechaLabel', label: 'Fecha',   placeholder: 'ej: 1 mayo' },
    { key: 'ministro',   label: 'Ministro', placeholder: 'Nombre del ministro' },
    { key: 'tema',       label: 'Tema',     placeholder: 'Tema del mensaje' },
    { key: 'oracion',    label: 'Oración / Cierre', placeholder: 'Responsable' },
  ],
  domingos: [
    { key: 'fechaLabel',      label: 'Fecha',            placeholder: 'ej: 3 mayo' },
    { key: 'primerServicio',  label: '1er Serv. 08:00',  placeholder: 'Nombre' },
    { key: 'segundoServicio', label: '2do Serv. 10:00',  placeholder: 'Nombre' },
    { key: 'tema',            label: 'Tema / Observaciones', placeholder: 'Tema' },
  ],
  ayunos: [
    { key: 'fechaLabel', label: 'Fecha',      placeholder: 'ej: Sáb 9 mayo' },
    { key: 'ministerio', label: 'Ministerio', placeholder: 'Ministerio en ayuno' },
    { key: 'tema',       label: 'Tema',       placeholder: 'Tema del ayuno' },
  ],
  eventos: [
    { key: 'fechaLabel', label: 'Fecha',  placeholder: 'ej: Sáb 16 mayo' },
    { key: 'nombre',     label: 'Nombre', placeholder: 'Nombre del evento' },
    { key: 'lugar',      label: 'Lugar',  placeholder: 'Lugar' },
    { key: 'hora',       label: 'Hora',   placeholder: 'ej: 4:00 pm' },
  ],
};

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_VIERNES: OrdenItem[] = [
  { id: 'v1', iconKey: 'imagen',    name: 'Imagen de inicio',     desc: 'Próximo evento — diseño por equipo de medios', time: '–20 min', rolesAsignados: ['Medios: carga imagen en EW'],                                  novedad: 'Pendiente diseño del equipo',      ewSlide: 'Imagen próximo evento' },
  { id: 'v2', iconKey: 'countdown', name: 'Countdown 10 min',      desc: 'Timer cuenta regresiva antes de iniciar',    time: '–10 min', rolesAsignados: ['Medios: activa slide countdown'],                              novedad: '',                                 ewSlide: 'Slide countdown 10:00' },
  { id: 'v3', iconKey: 'cabezote',  name: 'Cabezote TAFE',         desc: 'Video de apertura del servicio',             time: '00:00',   rolesAsignados: ['Medios: reproduce cabezote'],                                  novedad: '',                                 ewSlide: 'Video cabezote TAFE' },
  { id: 'v4', iconKey: 'ministro',  name: 'Ministro de alabanza',  desc: 'Nombre del ministro a cargo — asignar',     time: '+2 min',  rolesAsignados: ['Medios: slide nombre ministro'],                               novedad: 'Asignar ministro',                 ewSlide: 'Slide nombre ministro 1' },
  { id: 'v5', iconKey: 'canciones', name: '4 – 6 canciones',       desc: 'Letras con fondos o video de fondo',        time: '+5 min',  rolesAsignados: ['Medios: secuencia letras EW','Alabanza: lista de canciones'], novedad: 'Confirmar lista con alabanza',     ewSlide: 'Canciones (letras + fondos)' },
  { id: 'v6', iconKey: 'ministro',  name: 'Ministro de cierre',    desc: 'Nombre del ministro de transición',         time: 'variable',rolesAsignados: ['Medios: slide nombre ministro 2'],                             novedad: 'Asignar ministro',                 ewSlide: 'Slide nombre ministro 2' },
  { id: 'v7', iconKey: 'ofrendas',  name: 'Diezmos y ofrendas',    desc: 'Video de diezmos y ofrendas',               time: 'variable',rolesAsignados: ['Medios: reproduce video ofrendas'],                            novedad: '',                                 ewSlide: 'Video diezmos y ofrendas' },
  { id: 'v8', iconKey: 'tafe',      name: 'TAFE News',             desc: 'Video informativo semanal',                 time: 'variable',rolesAsignados: ['Medios: reproduce TAFE News viernes'],                         novedad: 'Confirmar si hay versión viernes', ewSlide: 'Video TAFE News' },
  { id: 'v9', iconKey: 'gracias',   name: 'Imagen de cierre',      desc: 'Gracias por acompañarnos',                  time: 'final',   rolesAsignados: ['Medios: activa imagen cierre'],                                novedad: '',                                 ewSlide: 'Imagen gracias por acompañarnos' },
];

const DEFAULT_DOMINGO: OrdenItem[] = [
  { id: 'd1',  iconKey: 'imagen',       name: 'Imagen de inicio',                   desc: 'Próximo evento o anuncio',                    time: '–20 min',     rolesAsignados: ['Medios: carga imagen en EW'],                                   novedad: '',               ewSlide: 'Imagen próximo evento' },
  { id: 'd2',  iconKey: 'countdown',    name: 'Countdown 10 min',                   desc: 'Timer cuenta regresiva',                      time: '–10 min',     rolesAsignados: ['Medios: activa slide countdown'],                               novedad: '',               ewSlide: 'Slide countdown 10:00' },
  { id: 'd3',  iconKey: 'cabezote',     name: 'Cabezote TAFE',                      desc: 'Video apertura',                              time: '00:00',       rolesAsignados: ['Medios: reproduce cabezote'],                                   novedad: '',               ewSlide: 'Video cabezote TAFE' },
  { id: 'd4',  iconKey: 'ministro',     name: 'Ministro de alabanza',               desc: 'Nombre del ministro a cargo',                 time: '+2 min',      rolesAsignados: ['Medios: slide nombre ministro'],                                novedad: '',               ewSlide: 'Slide nombre ministro' },
  { id: 'd5',  iconKey: 'canciones',    name: '4 canciones',                        desc: 'Letras con fondos o video de fondo',          time: '+5 min',      rolesAsignados: ['Medios: secuencia letras','Alabanza: lista canciones'],         novedad: 'Confirmar lista', ewSlide: 'Canciones (letras + fondos)' },
  { id: 'd6',  iconKey: 'especial',     name: 'Especial (opcional)',                 desc: 'Número especial — confirmar si aplica',       time: 'variable',    rolesAsignados: ['Medios: material especial si aplica'],                          novedad: 'Por confirmar',  ewSlide: '[OPCIONAL] Especial' },
  { id: 'd7',  iconKey: 'pastor',       name: 'Pastor Lancelot',                    desc: 'Prédica dominical',                           time: 'variable',    rolesAsignados: ['Medios: slide nombre pastor','StreamLabs: verificar audio'],   novedad: '',               ewSlide: 'Slide pastor Lancelot' },
  { id: 'd8',  iconKey: 'ministracion', name: 'Ministración — Profeta Nelda Ayala', desc: 'Ministración post-prédica',                   time: 'post-prédica',rolesAsignados: ['Medios: slide nombre ministra'],                                novedad: '',               ewSlide: 'Slide profeta Nelda Ayala' },
  { id: 'd9',  iconKey: 'ofrendas',     name: 'Diezmos y ofrendas',                 desc: 'Video — a cargo de profeta Nelda',            time: 'variable',    rolesAsignados: ['Medios: reproduce video ofrendas'],                             novedad: '',               ewSlide: 'Video diezmos y ofrendas' },
  { id: 'd10', iconKey: 'tafe',         name: 'TAFE News',                          desc: 'Video informativo semanal — versión domingo', time: 'variable',    rolesAsignados: ['Medios: reproduce TAFE News domingo'],                          novedad: '',               ewSlide: 'Video TAFE News domingo' },
  { id: 'd11', iconKey: 'gracias',      name: 'Imagen de cierre',                   desc: 'Gracias por acompañarnos',                    time: 'final',       rolesAsignados: ['Medios: activa imagen cierre'],                                 novedad: '',               ewSlide: 'Imagen gracias por acompañarnos' },
];

const DEFAULT_EQUIPO: EquipoMiembro[] = [
  { id: 'e1', name: 'Equipo de medios',     role: 'Operador principal EW',             grupo: 'medios' },
  { id: 'e2', name: 'Diseñador/a',          role: 'Fondos, imágenes, TAFE News',       grupo: 'medios' },
  { id: 'e3', name: 'Operador cámara',      role: 'Grabación y streaming',             grupo: 'medios' },
  { id: 'e4', name: 'StreamLabs',           role: 'Monitor audio en vivo',             grupo: 'medios' },
  { id: 'e5', name: 'Ministro de alabanza', role: 'Por asignar',                       grupo: 'alabanza' },
  { id: 'e6', name: 'Ministro de cierre',   role: 'Por asignar',                       grupo: 'alabanza' },
  { id: 'e7', name: 'Ministro dominical',   role: 'Por asignar',                       grupo: 'alabanza' },
  { id: 'e8', name: 'Pastor Lancelot',      role: 'Prédica dominical',                 grupo: 'pastoral' },
  { id: 'e9', name: 'Profeta Nelda Ayala',  role: 'Ministración y ofrendas (domingo)', grupo: 'pastoral' },
];

const DEFAULT_PROGRAMA: ProgramaMes = {
  mesLabel: 'Mayo 2026',
  liderCargo: 'JOSEPH MEJIA DAVIS',
  temasMes: [
    'No te distraigas',
    'Las cosas que nos distraen',
    'El peligro de distraerse',
    'Como luchar contra las distracciones',
    'Puesto los ojos en Jesús',
  ],
  viernes: [
    { id: 'vf1', fechaLabel: '1 mayo',  ministro: 'JOSEPH MEJIA DAVIS', tema: 'No te distraigas',                     oracion: 'KAREN ANTOLINEZ' },
    { id: 'vf2', fechaLabel: '8 mayo',  ministro: 'LUZ ELENA PRETELT',  tema: 'Las cosas que nos distraen',           oracion: 'JORDY HERNANDEZ' },
    { id: 'vf3', fechaLabel: '15 mayo', ministro: 'LICETH LEVER',       tema: 'El peligro de distraerse',             oracion: 'NANCY VALLEJO' },
    { id: 'vf4', fechaLabel: '22 mayo', ministro: 'CLAUDIA DE LA HOZ',  tema: 'Como luchar contra las distracciones', oracion: 'JORDANY LEVER' },
    { id: 'vf5', fechaLabel: '29 mayo', ministro: 'SERGIO LEVER',       tema: 'Puesto los ojos en Jesús',             oracion: 'JORDANY LEVER' },
  ],
  domingos: [
    { id: 'dm1', fechaLabel: '3 mayo',  primerServicio: 'ALVARO GUERRERO',    segundoServicio: 'ALVARO GUERRERO',    tema: 'No te distraigas' },
    { id: 'dm2', fechaLabel: '10 mayo', primerServicio: 'ANA MILENA HERRERA', segundoServicio: 'KAREN ANTOLINEZ',   tema: 'Las cosas que nos distraen' },
    { id: 'dm3', fechaLabel: '17 mayo', primerServicio: 'HEIDY FREITTE',      segundoServicio: 'JORDANY LEVER',     tema: 'El peligro de distraerse' },
    { id: 'dm4', fechaLabel: '24 mayo', primerServicio: 'LICETH LEVER',       segundoServicio: 'LICETH LEVER',      tema: 'Como luchar contra las distracciones' },
    { id: 'dm5', fechaLabel: '31 mayo', primerServicio: 'BENETT BISCAINO',    segundoServicio: 'CLAUDIA DE LA HOZ', tema: 'Puestos los ojos en Jesús' },
  ],
  ayunos: [
    { id: 'ay1', fechaLabel: 'Sáb 9 mayo',  ministerio: 'MEDIOS',      tema: 'LAS COSAS QUE NOS DISTRAEN' },
    { id: 'ay2', fechaLabel: 'Sáb 23 mayo', ministerio: 'ANFITRIONES', tema: 'COMO LUCHAR CONTRA LAS DISTRACCIONES' },
  ],
  eventos: [
    { id: 'ev1', fechaLabel: 'Sáb 16 mayo', nombre: 'JORNADA DE EVANGELISMO', lugar: 'Barrio Las Palmas', hora: '4:00 pm' },
  ],
};

const STORAGE_KEY = 'tafe_erp_orden_del_dia';

// ─── Component ────────────────────────────────────────────────────────────────

const OrdenDelDia: React.FC<Props> = ({ role }) => {
  const canEdit = role === UserRole.SUPER_ADMIN || role === UserRole.LIDER_MINISTERIO;

  // ── State ──────────────────────────────────────────────────────────────────

  const [state, setState] = useState<OrdenState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.servicioData !== undefined) {
          return { programaMes: p.programaMes ?? DEFAULT_PROGRAMA, servicioData: p.servicioData ?? {} };
        }
        // migrate old format: keep programaMes, discard per-type item arrays
        return { programaMes: p.programaMes ?? DEFAULT_PROGRAMA, servicioData: {} };
      }
    } catch { /* ignore */ }
    return { programaMes: DEFAULT_PROGRAMA, servicioData: {} };
  });

  const [activeView,         setActiveView]         = useState<string>('mes');
  const [expandedId,         setExpandedId]         = useState<string | null>(null);
  const [editingId,          setEditingId]          = useState<string | null>(null);
  const [editForm,           setEditForm]           = useState<Partial<OrdenItem> & { rolesStr?: string }>({});
  const [editEquipoId,       setEditEquipoId]       = useState<string | null>(null);
  const [equipoForm,         setEquipoForm]         = useState<{ name: string; role: string }>({ name: '', role: '' });
  const [addingEquipoGrupo,  setAddingEquipoGrupo]  = useState<GrupoEquipo | null>(null);
  const [newEquipo,          setNewEquipo]          = useState<{ name: string; role: string }>({ name: '', role: '' });
  const [showNovedadForm,    setShowNovedadForm]    = useState(false);
  const [novedadForm,        setNovedadForm]        = useState<{ tipo: TipoNovedad; titulo: string; texto: string }>({ tipo: 'info', titulo: '', texto: '' });
  const [copied,             setCopied]             = useState(false);

  // Programa mes editing
  const [editingPrograId,     setEditingPrograId]     = useState<string | null>(null);
  const [editPrograForm,      setEditPrograForm]      = useState<Record<string, string>>({});
  const [addingPrograSection, setAddingPrograSection] = useState<PrograSection | null>(null);
  const [newPrograForm,       setNewPrograForm]       = useState<Record<string, string>>({});
  const [editingTemaIdx,      setEditingTemaIdx]      = useState<number | null>(null);
  const [editTema,            setEditTema]            = useState('');
  const [newTema,             setNewTema]             = useState('');
  const [showAddTema,         setShowAddTema]         = useState(false);
  const [editingMeta,         setEditingMeta]         = useState<'mes' | 'lider' | null>(null);
  const [metaForm,            setMetaForm]            = useState('');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const allServices = useMemo(() => {
    const vs = state.programaMes.viernes.map(v => ({ id: v.id, fechaLabel: v.fechaLabel, tipo: 'viernes' as TipoServicio, day: parseInt(v.fechaLabel) || 0 }));
    const ds = state.programaMes.domingos.map(d => ({ id: d.id, fechaLabel: d.fechaLabel, tipo: 'domingo' as TipoServicio, day: parseInt(d.fechaLabel) || 0 }));
    return [...vs, ...ds].sort((a, b) => a.day - b.day);
  }, [state.programaMes.viernes, state.programaMes.domingos]);

  const getServicio = (id: string, tipo: TipoServicio): ServicioDetalle =>
    state.servicioData[id] ?? {
      id, tipo,
      ordenItems: tipo === 'viernes' ? DEFAULT_VIERNES.map(i => ({ ...i })) : DEFAULT_DOMINGO.map(i => ({ ...i })),
      equipo: DEFAULT_EQUIPO.map(e => ({ ...e })),
      novedades: [],
    };

  const activeSvcMeta = activeView !== 'mes' ? allServices.find(s => s.id === activeView) : null;
  const activeDetalle = activeSvcMeta ? getServicio(activeView, activeSvcMeta.tipo) : null;

  const updateSvc = (updater: (s: ServicioDetalle) => ServicioDetalle) => {
    if (!activeSvcMeta) return;
    const current = getServicio(activeView, activeSvcMeta.tipo);
    setState(s => ({ ...s, servicioData: { ...s.servicioData, [activeView]: updater(current) } }));
  };

  const switchView = (id: string) => {
    setActiveView(id);
    setExpandedId(null); setEditingId(null); setEditForm({});
    setEditEquipoId(null); setAddingEquipoGrupo(null);
    setShowNovedadForm(false); setNovedadForm({ tipo: 'info', titulo: '', texto: '' });
    setEditingPrograId(null); setAddingPrograSection(null);
  };

  // ── Item handlers ──────────────────────────────────────────────────────────

  const startEditItem = (item: OrdenItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id); setExpandedId(item.id);
    setEditForm({ ...item, rolesStr: item.rolesAsignados.join('\n') });
  };
  const saveEditItem = () => {
    if (!editingId) return;
    updateSvc(sv => ({ ...sv, ordenItems: sv.ordenItems.map(it => it.id !== editingId ? it : {
      ...it, ...editForm,
      iconKey: (editForm.iconKey ?? it.iconKey) as IconKey,
      rolesAsignados: (editForm.rolesStr ?? '').split('\n').map(r => r.trim()).filter(Boolean),
    }) }));
    setEditingId(null); setEditForm({});
  };
  const cancelEditItem = () => { setEditingId(null); setEditForm({}); };
  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateSvc(sv => ({ ...sv, ordenItems: sv.ordenItems.filter(it => it.id !== id) }));
    if (expandedId === id) setExpandedId(null);
  };
  const addItem = () => {
    const n: OrdenItem = { id: `item_${Date.now()}`, iconKey: 'video', name: 'Nuevo elemento', desc: 'Descripción', time: 'variable', rolesAsignados: ['Medios: asignar'], novedad: 'Pendiente', ewSlide: 'Nuevo slide EW' };
    updateSvc(sv => ({ ...sv, ordenItems: [...sv.ordenItems, n] }));
    setExpandedId(n.id); setEditingId(n.id);
    setEditForm({ ...n, rolesStr: n.rolesAsignados.join('\n') });
  };

  const exportEW = () => {
    if (!activeDetalle || !activeSvcMeta) return;
    const label = `Servicio ${activeSvcMeta.fechaLabel.toUpperCase()} — ${state.programaMes.mesLabel}`;
    const lines = activeDetalle.ordenItems.map((it, i) => `${i + 1}. ${it.ewSlide}`).join('\n');
    navigator.clipboard.writeText(`ORDEN DEL DÍA — ${label}\nIglesia TAFE\n\n${lines}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Equipo handlers ────────────────────────────────────────────────────────

  const startEditEquipo = (m: EquipoMiembro, e: React.MouseEvent) => {
    e.stopPropagation(); setEditEquipoId(m.id); setEquipoForm({ name: m.name, role: m.role });
  };
  const saveEquipo = () => {
    if (!editEquipoId) return;
    updateSvc(sv => ({ ...sv, equipo: sv.equipo.map(m => m.id === editEquipoId ? { ...m, ...equipoForm } : m) }));
    setEditEquipoId(null); setEquipoForm({ name: '', role: '' });
  };
  const addEquipoMember = (grupo: GrupoEquipo) => {
    if (!newEquipo.name.trim()) return;
    updateSvc(sv => ({ ...sv, equipo: [...sv.equipo, { id: `eq_${Date.now()}`, name: newEquipo.name.trim(), role: newEquipo.role.trim(), grupo }] }));
    setNewEquipo({ name: '', role: '' }); setAddingEquipoGrupo(null);
  };
  const deleteEquipo = (id: string) => updateSvc(sv => ({ ...sv, equipo: sv.equipo.filter(m => m.id !== id) }));

  // ── Novedad handlers ───────────────────────────────────────────────────────

  const addNovedad = () => {
    if (!novedadForm.titulo.trim()) return;
    updateSvc(sv => ({ ...sv, novedades: [{ id: `n_${Date.now()}`, ...novedadForm }, ...sv.novedades] }));
    setNovedadForm({ tipo: 'info', titulo: '', texto: '' }); setShowNovedadForm(false);
  };
  const deleteNovedad = (id: string) => updateSvc(sv => ({ ...sv, novedades: sv.novedades.filter(n => n.id !== id) }));

  // ── Programa handlers ──────────────────────────────────────────────────────

  const updatePrograRow = (section: PrograSection, id: string, data: Record<string, string>) =>
    setState(s => ({ ...s, programaMes: { ...s.programaMes, [section]: (s.programaMes[section] as any[]).map((r: any) => r.id === id ? { ...r, ...data } : r) } }));
  const deletePrograRow = (section: PrograSection, id: string) =>
    setState(s => ({ ...s, programaMes: { ...s.programaMes, [section]: (s.programaMes[section] as any[]).filter((r: any) => r.id !== id) } }));
  const addPrograRow = (section: PrograSection, data: Record<string, string>) =>
    setState(s => ({ ...s, programaMes: { ...s.programaMes, [section]: [...(s.programaMes[section] as any[]), { id: `${section}_${Date.now()}`, ...data }] } }));
  const addTema = () => {
    if (!newTema.trim()) return;
    setState(s => ({ ...s, programaMes: { ...s.programaMes, temasMes: [...s.programaMes.temasMes, newTema.trim()] } }));
    setNewTema(''); setShowAddTema(false);
  };
  const deleteTema = (i: number) =>
    setState(s => ({ ...s, programaMes: { ...s.programaMes, temasMes: s.programaMes.temasMes.filter((_, idx) => idx !== i) } }));
  const saveTema = (i: number) => {
    setState(s => ({ ...s, programaMes: { ...s.programaMes, temasMes: s.programaMes.temasMes.map((t, idx) => idx === i ? editTema : t) } }));
    setEditingTemaIdx(null);
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const StatusBadge = ({ novedad }: { novedad: string }) =>
    novedad
      ? <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-amber-200 truncate max-w-[180px]"><AlertTriangle size={10} className="flex-shrink-0" /><span className="truncate">{novedad}</span></span>
      : <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-emerald-200"><Check size={10} /> listo</span>;

  const novStyle: Record<TipoNovedad, { card: string; badge: string; icon: React.ReactNode }> = {
    warn: { card: 'bg-red-50 border-red-200',     badge: 'bg-red-100 text-red-700',     icon: <AlertTriangle size={11} /> },
    info: { card: 'bg-blue-50 border-blue-200',   badge: 'bg-blue-100 text-blue-700',   icon: <InfoIcon size={11} /> },
    ok:   { card: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', icon: <Check size={11} /> },
  };

  // ── Date selector ──────────────────────────────────────────────────────────

  const renderDateSelector = () => (
    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      <button
        onClick={() => switchView('mes')}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 ${
          activeView === 'mes' ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
        }`}
      >
        <CalendarDays size={12} /> Programa del Mes
      </button>
      {allServices.map(svc => {
        const detalle = state.servicioData[svc.id];
        const hasNovedades = detalle && detalle.novedades.length > 0;
        const isActive = activeView === svc.id;
        const isVie = svc.tipo === 'viernes';
        return (
          <button
            key={svc.id}
            onClick={() => switchView(svc.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 ${
              isActive
                ? isVie ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            }`}
          >
            <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : isVie ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {isVie ? 'VIE' : 'DOM'}
            </span>
            {svc.fechaLabel}
            {hasNovedades && <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );

  // ── Timeline ───────────────────────────────────────────────────────────────

  const renderTimeline = (items: OrdenItem[]) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      {items.map((item, i) => {
        const isLast    = i === items.length - 1;
        const isExpanded = expandedId === item.id;
        const isEditing  = editingId  === item.id;
        return (
          <div key={item.id}>
            <div
              className={`flex gap-3 cursor-pointer rounded-xl transition-colors px-2 py-1.5 ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
              onClick={() => { if (!isEditing) setExpandedId(isExpanded ? null : item.id); }}
            >
              <div className="flex flex-col items-center w-14 flex-shrink-0 pt-1.5">
                <span className="text-[10px] text-slate-400 font-mono font-semibold leading-none">{item.time}</span>
                {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[16px]" />}
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${COLOR_MAP[item.iconKey] ?? 'bg-slate-100 text-slate-600'} mt-0.5`}>
                {ICON_MAP[item.iconKey]}
              </div>
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

            {isExpanded && !isEditing && (
              <div className="ml-[4.5rem] mb-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Roles asignados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.rolesAsignados.map((r, ri) => (
                      <span key={ri} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg"><User size={10} className="text-slate-400" /> {r}</span>
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
                    <button onClick={e => startEditItem(item, e)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Pencil size={11} /> Editar</button>
                    <button onClick={e => deleteItem(item.id, e)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={11} /> Eliminar</button>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div className="ml-[4.5rem] mb-2 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2" onClick={e => e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre</label><input className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiempo</label><input className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" value={editForm.time ?? ''} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} /></div>
                </div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descripción</label><input className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" value={editForm.desc ?? ''} onChange={e => setEditForm(f => ({ ...f, desc: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Slide EW</label><input className="mt-1 w-full text-sm font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" value={editForm.ewSlide ?? ''} onChange={e => setEditForm(f => ({ ...f, ewSlide: e.target.value }))} /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ícono</label>
                    <select className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" value={editForm.iconKey ?? 'video'} onChange={e => setEditForm(f => ({ ...f, iconKey: e.target.value as IconKey }))}>
                      {ICON_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Roles <span className="normal-case font-normal">(uno por línea)</span></label><textarea rows={3} className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400 resize-none" value={editForm.rolesStr ?? ''} onChange={e => setEditForm(f => ({ ...f, rolesStr: e.target.value }))} /></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Novedad / pendiente</label><input className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" placeholder="Dejar vacío si está listo" value={editForm.novedad ?? ''} onChange={e => setEditForm(f => ({ ...f, novedad: e.target.value }))} /></div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEditItem} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"><Check size={12} /> Guardar</button>
                  <button onClick={cancelEditItem} className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 hover:bg-white px-3 py-1.5 rounded-lg transition-colors"><X size={12} /> Cancelar</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {canEdit && (
        <button onClick={addItem} className="w-full mt-2 flex items-center justify-center gap-2 border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-sm py-2.5 rounded-xl transition-all">
          <Plus size={14} /> Agregar elemento
        </button>
      )}
    </div>
  );

  // ── Equipo section ─────────────────────────────────────────────────────────

  const renderEquipoSection = (equipo: EquipoMiembro[]) => (
    <div className="space-y-3">
      {(['medios', 'alabanza', 'pastoral'] as GrupoEquipo[]).map(grupo => (
        <div key={grupo} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{GRUPO_LABELS[grupo]}</h4>
            {canEdit && addingEquipoGrupo !== grupo && (
              <button onClick={() => { setAddingEquipoGrupo(grupo); setNewEquipo({ name: '', role: '' }); setEditEquipoId(null); }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Plus size={11} /> Agregar
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {equipo.filter(m => m.grupo === grupo).map(m =>
              editEquipoId === m.id ? (
                <div key={m.id} className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <input autoFocus className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" placeholder="Nombre" value={equipoForm.name} onChange={e => setEquipoForm(f => ({ ...f, name: e.target.value }))} />
                  <input className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" placeholder="Rol" value={equipoForm.role} onChange={e => setEquipoForm(f => ({ ...f, role: e.target.value }))} />
                  <div className="flex gap-1.5">
                    <button onClick={saveEquipo} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-xs font-semibold py-1.5 rounded-lg"><Check size={11} /> Guardar</button>
                    <button onClick={() => setEditEquipoId(null)} className="flex-1 border border-slate-200 bg-white text-slate-600 text-xs py-1.5 rounded-lg">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="p-3 border border-slate-200 rounded-xl flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5"><User size={13} className="text-slate-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{m.role}</p>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={e => startEditEquipo(m, e)} className="text-slate-300 hover:text-blue-500 p-1 rounded hover:bg-blue-50 transition-colors"><Pencil size={12} /></button>
                      <button onClick={() => deleteEquipo(m.id)} className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
              )
            )}
            {addingEquipoGrupo === grupo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <input autoFocus className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" placeholder="Nombre del miembro" value={newEquipo.name} onChange={e => setNewEquipo(f => ({ ...f, name: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') addEquipoMember(grupo); if (e.key === 'Escape') setAddingEquipoGrupo(null); }} />
                <input className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" placeholder="Rol o función" value={newEquipo.role} onChange={e => setNewEquipo(f => ({ ...f, role: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') addEquipoMember(grupo); if (e.key === 'Escape') setAddingEquipoGrupo(null); }} />
                <div className="flex gap-1.5">
                  <button onClick={() => addEquipoMember(grupo)} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"><Check size={11} /> Guardar</button>
                  <button onClick={() => setAddingEquipoGrupo(null)} className="flex-1 border border-slate-200 bg-white text-slate-600 text-xs py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Novedades section ──────────────────────────────────────────────────────

  const renderNovedadesSection = (novedades: Novedad[]) => (
    <div>
      {novedades.length === 0 && !showNovedadForm && (
        <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Bell size={28} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">Sin novedades para este servicio</p>
        </div>
      )}
      {novedades.map(n => {
        const s = novStyle[n.tipo];
        return (
          <div key={n.id} className={`p-4 rounded-xl border ${s.card} mb-2`}>
            <div className="flex items-start justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 ${s.badge} text-xs font-semibold px-2.5 py-1 rounded-full`}>{s.icon} {n.titulo}</span>
              {canEdit && <button onClick={() => deleteNovedad(n.id)} className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors flex-shrink-0"><Trash2 size={13} /></button>}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mt-2">{n.texto}</p>
          </div>
        );
      })}
      {canEdit && (
        showNovedadForm ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex gap-3">
              <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Título</label><input className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white" placeholder="Título de la novedad" value={novedadForm.titulo} onChange={e => setNovedadForm(f => ({ ...f, titulo: e.target.value }))} /></div>
              <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</label><select className="mt-1 text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400" value={novedadForm.tipo} onChange={e => setNovedadForm(f => ({ ...f, tipo: e.target.value as TipoNovedad }))}><option value="info">Info</option><option value="warn">Alerta</option><option value="ok">Ok</option></select></div>
            </div>
            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detalle</label><textarea rows={3} className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white resize-none" placeholder="Descripción..." value={novedadForm.texto} onChange={e => setNovedadForm(f => ({ ...f, texto: e.target.value }))} /></div>
            <div className="flex gap-2">
              <button onClick={addNovedad} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"><Check size={13} /> Registrar</button>
              <button onClick={() => setShowNovedadForm(false)} className="text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowNovedadForm(true)} className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-sm py-3 rounded-xl transition-all mt-1">
            <Plus size={14} /> Registrar novedad
          </button>
        )
      )}
    </div>
  );

  // ── Programa section renderer ──────────────────────────────────────────────

  const renderPrograSection = (sectionKey: PrograSection, sectionLabel: string, data: Record<string, string>[]) => {
    const fields = PROGRA_FIELDS[sectionKey];
    const isAdding = addingPrograSection === sectionKey;
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{sectionLabel}</h3>
          {canEdit && !isAdding && (
            <button onClick={() => { setAddingPrograSection(sectionKey); setNewPrograForm({}); setEditingPrograId(null); }}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Plus size={11} /> Agregar
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {fields.map(f => <th key={f.key} className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{f.label}</th>)}
                {canEdit && <th className="w-16 px-2" />}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) =>
                editingPrograId === row.id ? (
                  <tr key={row.id} className="bg-blue-50">
                    {fields.map(f => (
                      <td key={f.key} className="px-3 py-1.5">
                        <input className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-blue-400 min-w-[90px]"
                          value={editPrograForm[f.key] ?? row[f.key] ?? ''} onChange={e => setEditPrograForm(p => ({ ...p, [f.key]: e.target.value }))} />
                      </td>
                    ))}
                    <td className="px-2 py-1.5">
                      <div className="flex gap-1">
                        <button onClick={() => { updatePrograRow(sectionKey, row.id, editPrograForm); setEditingPrograId(null); }} className="p-1 text-emerald-600 hover:text-emerald-800"><Check size={13} /></button>
                        <button onClick={() => setEditingPrograId(null)} className="p-1 text-slate-400 hover:text-slate-600"><X size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    {fields.map(f => <td key={f.key} className="px-4 py-2.5 text-slate-700">{row[f.key] || '—'}</td>)}
                    {canEdit && (
                      <td className="px-2 py-2.5">
                        <div className="flex gap-0.5">
                          <button onClick={() => { setEditingPrograId(row.id); setEditPrograForm({}); setAddingPrograSection(null); }} className="p-1 text-slate-300 hover:text-blue-500 rounded hover:bg-blue-50 transition-colors"><Pencil size={11} /></button>
                          <button onClick={() => deletePrograRow(sectionKey, row.id)} className="p-1 text-slate-300 hover:text-red-500 rounded hover:bg-red-50 transition-colors"><Trash2 size={11} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              )}
              {data.length === 0 && <tr><td colSpan={fields.length + 1} className="px-4 py-4 text-xs text-slate-400 text-center">Sin registros</td></tr>}
            </tbody>
          </table>
        </div>
        {isAdding && (
          <div className="px-5 py-4 border-t border-blue-100 bg-blue-50 space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nuevo registro</p>
            <div className="grid grid-cols-2 gap-2">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{f.label}</label>
                  <input className="mt-0.5 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400"
                    placeholder={f.placeholder} value={newPrograForm[f.key] ?? ''} onChange={e => setNewPrograForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { addPrograRow(sectionKey, newPrograForm); setAddingPrograSection(null); setNewPrograForm({}); }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <Check size={12} /> Guardar
              </button>
              <button onClick={() => setAddingPrograSection(null)} className="text-xs text-slate-600 border border-slate-200 hover:bg-white px-3 py-1.5 rounded-lg transition-colors">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Service view ───────────────────────────────────────────────────────────

  const renderServicioView = () => {
    if (!activeSvcMeta || !activeDetalle) return null;
    const isVie = activeSvcMeta.tipo === 'viernes';
    const progV = isVie ? state.programaMes.viernes.find(v => v.id === activeSvcMeta.id) : null;
    const progD = !isVie ? state.programaMes.domingos.find(d => d.id === activeSvcMeta.id) : null;

    return (
      <div className="space-y-5">
        {/* Service header */}
        <div className={`rounded-2xl border p-4 ${isVie ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isVie ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                  {isVie ? 'Viernes de Adoración' : 'Servicio Dominical'}
                </span>
                <span className="text-slate-400 text-xs">{state.programaMes.mesLabel}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Servicio {activeSvcMeta.fechaLabel}</h3>
              {progV && (
                <div className="mt-1.5 text-xs text-slate-600 space-y-0.5">
                  <div>Ministro: <strong className="text-slate-800">{progV.ministro}</strong></div>
                  <div>Tema: <strong className="text-slate-800">{progV.tema}</strong></div>
                  <div>Oración / Cierre: <strong className="text-slate-800">{progV.oracion}</strong></div>
                </div>
              )}
              {progD && (
                <div className="mt-1.5 text-xs text-slate-600 space-y-0.5">
                  <div>1er servicio 08:00: <strong className="text-slate-800">{progD.primerServicio}</strong></div>
                  <div>2do servicio 10:00: <strong className="text-slate-800">{progD.segundoServicio}</strong></div>
                  <div>Tema: <strong className="text-slate-800">{progD.tema}</strong></div>
                </div>
              )}
            </div>
            <button onClick={exportEW} className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm flex-shrink-0">
              {copied ? <><Check size={14} className="text-emerald-500" /> Copiado</> : <><Copy size={14} /> Copiar secuencia EW</>}
            </button>
          </div>
        </div>

        {/* Order / Timeline */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Orden del servicio</p>
          {renderTimeline(activeDetalle.ordenItems)}
        </div>

        {/* EW sequence */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Secuencia Easy Worship</p>
          <div className="space-y-0.5">
            {activeDetalle.ordenItems.map((it, i) => (
              <div key={it.id} className="flex gap-3 items-center py-1 border-b border-slate-100 last:border-0">
                <span className="text-xs font-mono text-slate-400 w-5 flex-shrink-0 text-right">{i + 1}</span>
                <span className="text-sm text-slate-700">{it.ewSlide}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipo */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2"><Users size={11} /> Equipo para este servicio</p>
          {renderEquipoSection(activeDetalle.equipo)}
        </div>

        {/* Novedades */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2"><Bell size={11} /> Novedades de este servicio</p>
          {renderNovedadesSection(activeDetalle.novedades)}
        </div>
      </div>
    );
  };

  // ── Mes view ───────────────────────────────────────────────────────────────

  const renderMesView = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            {editingMeta === 'mes' ? (
              <div className="flex gap-2 items-center">
                <input autoFocus className="text-lg font-bold border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-400" value={metaForm} onChange={e => setMetaForm(e.target.value)} />
                <button onClick={() => { setState(s => ({ ...s, programaMes: { ...s.programaMes, mesLabel: metaForm } })); setEditingMeta(null); }} className="p-1.5 bg-blue-600 text-white rounded-lg"><Check size={13} /></button>
                <button onClick={() => setEditingMeta(null)} className="p-1.5 border border-slate-200 rounded-lg text-slate-500"><X size={13} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">Programación de Actividades · {state.programaMes.mesLabel}</h3>
                {canEdit && <button onClick={() => { setEditingMeta('mes'); setMetaForm(state.programaMes.mesLabel); }} className="text-slate-300 hover:text-blue-500 p-1 rounded transition-colors"><Pencil size={13} /></button>}
              </div>
            )}
            {editingMeta === 'lider' ? (
              <div className="flex gap-2 items-center mt-1">
                <input autoFocus className="text-sm border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-400" value={metaForm} onChange={e => setMetaForm(e.target.value)} />
                <button onClick={() => { setState(s => ({ ...s, programaMes: { ...s.programaMes, liderCargo: metaForm } })); setEditingMeta(null); }} className="p-1.5 bg-blue-600 text-white rounded-lg"><Check size={13} /></button>
                <button onClick={() => setEditingMeta(null)} className="p-1.5 border border-slate-200 rounded-lg text-slate-500"><X size={13} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-slate-500">Líder a cargo: <strong className="text-slate-700">{state.programaMes.liderCargo}</strong></p>
                {canEdit && <button onClick={() => { setEditingMeta('lider'); setMetaForm(state.programaMes.liderCargo); }} className="text-slate-300 hover:text-blue-500 p-0.5 rounded transition-colors"><Pencil size={11} /></button>}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temas a tratar en prédicas del mes</p>
            {canEdit && !showAddTema && (
              <button onClick={() => setShowAddTema(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Plus size={11} /> Agregar</button>
            )}
          </div>
          <div className="space-y-1">
            {state.programaMes.temasMes.map((t, i) =>
              editingTemaIdx === i ? (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right">{i + 1}.</span>
                  <input autoFocus className="flex-1 text-sm border border-slate-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:border-blue-400" value={editTema} onChange={e => setEditTema(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveTema(i); if (e.key === 'Escape') setEditingTemaIdx(null); }} />
                  <button onClick={() => saveTema(i)} className="p-1.5 bg-blue-600 text-white rounded-lg"><Check size={12} /></button>
                  <button onClick={() => setEditingTemaIdx(null)} className="p-1.5 border border-slate-200 rounded-lg text-slate-500"><X size={12} /></button>
                </div>
              ) : (
                <div key={i} className="flex items-center gap-2 group py-0.5">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right">{i + 1}.</span>
                  <span className="text-sm text-slate-700 flex-1">{t}</span>
                  {canEdit && (
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingTemaIdx(i); setEditTema(t); }} className="p-1 text-slate-300 hover:text-blue-500 rounded"><Pencil size={11} /></button>
                      <button onClick={() => deleteTema(i)} className="p-1 text-slate-300 hover:text-red-500 rounded"><Trash2 size={11} /></button>
                    </div>
                  )}
                </div>
              )
            )}
            {showAddTema && (
              <div className="flex gap-2 items-center mt-1">
                <span className="text-xs font-bold text-slate-400 w-5 text-right">{state.programaMes.temasMes.length + 1}.</span>
                <input autoFocus className="flex-1 text-sm border border-slate-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:border-blue-400" placeholder="Nuevo tema" value={newTema} onChange={e => setNewTema(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addTema(); if (e.key === 'Escape') setShowAddTema(false); }} />
                <button onClick={addTema} className="p-1.5 bg-blue-600 text-white rounded-lg"><Check size={12} /></button>
                <button onClick={() => setShowAddTema(false)} className="p-1.5 border border-slate-200 rounded-lg text-slate-500"><X size={12} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
      {renderPrograSection('viernes',  'Viernes de Ministración y Oración',       state.programaMes.viernes  as unknown as Record<string,string>[])}
      {renderPrograSection('domingos', 'Servicio Dominical — Oración de Apertura', state.programaMes.domingos as unknown as Record<string,string>[])}
      {renderPrograSection('ayunos',   'Ayunos',                                   state.programaMes.ayunos   as unknown as Record<string,string>[])}
      {renderPrograSection('eventos',  'Eventos del Mes',                          state.programaMes.eventos  as unknown as Record<string,string>[])}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Orden del Día — Servicios TAFE</h2>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            Plantilla base para Easy Worship · visible para todo el equipo
            {!canEdit && <span className="inline-flex items-center gap-1 text-slate-400 text-xs"><Lock size={11} /> Solo lectura</span>}
          </p>
        </div>
      </div>

      {renderDateSelector()}

      {activeView === 'mes' ? renderMesView() : renderServicioView()}
    </div>
  );
};

export default OrdenDelDia;
