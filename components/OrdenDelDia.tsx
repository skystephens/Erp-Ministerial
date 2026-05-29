
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserRole } from '../types';
import {
  Music2, Bell, Timer, Film, Mic2, Heart, PlayCircle,
  Newspaper, BookOpen, Sparkles, Star, ThumbsUp, Users,
  Pencil, Trash2, Check, X, AlertTriangle, Info as InfoIcon,
  Copy, ChevronDown, ChevronUp, Plus, Lock, User,
  Image as ImageIcon, CalendarDays, Clock, Loader2, RefreshCw,
} from 'lucide-react';
import { airtableIsActive, getConfigRecord, upsertConfigRecord } from '../services/airtableService';

// ─── Types ────────────────────────────────────────────────────────────────────

type TipoServicio = 'viernes' | 'domingo' | 'especial';
type TipoNovedad  = 'warn' | 'info' | 'ok';
type GrupoEquipo  = 'medios' | 'alabanza' | 'pastoral';
type PrograSection = 'viernes' | 'domingos' | 'ayunos' | 'eventos' | 'especiales' | 'evangelismos';
type IconKey =
  | 'imagen' | 'countdown' | 'cabezote' | 'ministro' | 'canciones'
  | 'ofrendas' | 'video' | 'tafe' | 'gracias' | 'pastor'
  | 'ministracion' | 'especial';

interface OrdenItem {
  id: string; iconKey: IconKey; name: string; desc: string; time: string;
  rolesAsignados: string[]; novedad: string; ewSlide: string;
}
interface Novedad        { id: string; tipo: TipoNovedad; titulo: string; texto: string; }
interface EquipoMiembro  { id: string; name: string; role: string; grupo: GrupoEquipo; }
interface ServicioViernes { id: string; fechaLabel: string; ministro: string; tema: string; oracion: string; }
interface ServicioDomingo { id: string; fechaLabel: string; primerServicio: string; segundoServicio: string; tema: string; }
interface EspecialServicio{ id: string; fechaLabel: string; nombre: string; }
interface Ayuno              { id: string; fechaLabel: string; ministerio: string; tema: string; }
interface EventoMes         { id: string; fechaLabel: string; nombre: string; lugar: string; hora: string; }
interface JornadaEvangelismo { id: string; fechaLabel: string; barrio: string; hora: string; descripcion: string; }

interface ProgramaMes {
  id: string; mesLabel: string; liderCargo: string; temasMes: string[];
  viernes: ServicioViernes[]; domingos: ServicioDomingo[];
  especiales: EspecialServicio[]; ayunos: Ayuno[]; eventos: EventoMes[];
  evangelismos: JornadaEvangelismo[];
}
interface ServicioDetalle {
  id: string; tipo: TipoServicio;
  ordenItems: OrdenItem[]; equipo: EquipoMiembro[]; novedades: Novedad[];
}
interface OrdenState {
  meses: ProgramaMes[];
  activeMesId: string;
  servicioData: Record<string, ServicioDetalle>;
}
interface Props { role: UserRole; }

// ─── Maps ─────────────────────────────────────────────────────────────────────

const ICON_MAP: Record<IconKey, React.ReactNode> = {
  imagen:<ImageIcon size={14}/>, countdown:<Timer size={14}/>, cabezote:<Film size={14}/>,
  ministro:<Mic2 size={14}/>, canciones:<Music2 size={14}/>, ofrendas:<Heart size={14}/>,
  video:<PlayCircle size={14}/>, tafe:<Newspaper size={14}/>, gracias:<ThumbsUp size={14}/>,
  pastor:<BookOpen size={14}/>, ministracion:<Sparkles size={14}/>, especial:<Star size={14}/>,
};
const COLOR_MAP: Record<IconKey, string> = {
  imagen:'bg-purple-100 text-purple-700', countdown:'bg-purple-100 text-purple-700',
  cabezote:'bg-purple-100 text-purple-700', ministro:'bg-emerald-100 text-emerald-700',
  canciones:'bg-emerald-100 text-emerald-700', ofrendas:'bg-amber-100 text-amber-700',
  video:'bg-purple-100 text-purple-700', tafe:'bg-blue-100 text-blue-700',
  gracias:'bg-slate-100 text-slate-600', pastor:'bg-amber-100 text-amber-700',
  ministracion:'bg-amber-100 text-amber-700', especial:'bg-purple-100 text-purple-700',
};
const ICON_OPTIONS: IconKey[] = [
  'imagen','countdown','cabezote','ministro','canciones','ofrendas',
  'video','tafe','gracias','pastor','ministracion','especial',
];
const GRUPO_LABELS: Record<GrupoEquipo, string> = {
  medios:'Equipo de medios', alabanza:'Ministerio de alabanza', pastoral:'Ministerio pastoral',
};
const PROGRA_FIELDS: Record<PrograSection, { key: string; label: string; placeholder: string }[]> = {
  viernes:   [{ key:'fechaLabel',label:'Fecha',placeholder:'ej: 1 mayo'},{ key:'ministro',label:'Ministro',placeholder:'Nombre'},{ key:'tema',label:'Tema',placeholder:'Tema'},{ key:'oracion',label:'Oración / Cierre',placeholder:'Responsable'}],
  domingos:  [{ key:'fechaLabel',label:'Fecha',placeholder:'ej: 3 mayo'},{ key:'primerServicio',label:'1er Serv. 08:00',placeholder:'Nombre'},{ key:'segundoServicio',label:'2do Serv. 10:00',placeholder:'Nombre'},{ key:'tema',label:'Tema',placeholder:'Tema'}],
  especiales:[{ key:'fechaLabel',label:'Fecha',placeholder:'ej: Sáb 14 mayo'},{ key:'nombre',label:'Nombre del servicio',placeholder:'ej: Vigilia de Oración'}],
  ayunos:    [{ key:'fechaLabel',label:'Fecha',placeholder:'ej: Sáb 9 mayo'},{ key:'ministerio',label:'Ministerio',placeholder:'Ministerio en ayuno'},{ key:'tema',label:'Tema',placeholder:'Tema del ayuno'}],
  eventos:       [{ key:'fechaLabel',label:'Fecha',placeholder:'ej: Sáb 16 mayo'},{ key:'nombre',label:'Nombre',placeholder:'Nombre del evento'},{ key:'lugar',label:'Lugar',placeholder:'Lugar'},{ key:'hora',label:'Hora',placeholder:'ej: 4:00 pm'}],
  evangelismos:  [{ key:'fechaLabel',label:'Fecha',placeholder:'ej: Sáb 20 junio'},{ key:'barrio',label:'Barrio / Sector',placeholder:'ej: Las Palmas'},{ key:'hora',label:'Hora de cita',placeholder:'ej: 4:30 pm'},{ key:'descripcion',label:'Descripción',placeholder:'Ej: Jornada E1 · Conquista'}],
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_VIERNES: OrdenItem[] = [
  { id:'v1', iconKey:'imagen',    name:'Imagen de inicio',     desc:'Próximo evento — diseño por equipo de medios', time:'–20 min', rolesAsignados:['Medios: carga imagen en EW'],                                  novedad:'Pendiente diseño del equipo',      ewSlide:'Imagen próximo evento' },
  { id:'v2', iconKey:'countdown', name:'Countdown 10 min',      desc:'Timer cuenta regresiva antes de iniciar',    time:'–10 min', rolesAsignados:['Medios: activa slide countdown'],                              novedad:'',                                 ewSlide:'Slide countdown 10:00' },
  { id:'v3', iconKey:'cabezote',  name:'Cabezote TAFE',         desc:'Video de apertura del servicio',             time:'00:00',   rolesAsignados:['Medios: reproduce cabezote'],                                  novedad:'',                                 ewSlide:'Video cabezote TAFE' },
  { id:'v4', iconKey:'ministro',  name:'Ministro de alabanza',  desc:'Nombre del ministro a cargo — asignar',     time:'+2 min',  rolesAsignados:['Medios: slide nombre ministro'],                               novedad:'Asignar ministro',                 ewSlide:'Slide nombre ministro 1' },
  { id:'v5', iconKey:'canciones', name:'4 – 6 canciones',       desc:'Letras con fondos o video de fondo',        time:'+5 min',  rolesAsignados:['Medios: secuencia letras EW','Alabanza: lista de canciones'], novedad:'Confirmar lista con alabanza',     ewSlide:'Canciones (letras + fondos)' },
  { id:'v6', iconKey:'ministro',  name:'Ministro de cierre',    desc:'Nombre del ministro de transición',         time:'variable',rolesAsignados:['Medios: slide nombre ministro 2'],                             novedad:'Asignar ministro',                 ewSlide:'Slide nombre ministro 2' },
  { id:'v7', iconKey:'ofrendas',  name:'Diezmos y ofrendas',    desc:'Video de diezmos y ofrendas',               time:'variable',rolesAsignados:['Medios: reproduce video ofrendas'],                            novedad:'',                                 ewSlide:'Video diezmos y ofrendas' },
  { id:'v8', iconKey:'tafe',      name:'TAFE News',             desc:'Video informativo semanal',                 time:'variable',rolesAsignados:['Medios: reproduce TAFE News viernes'],                         novedad:'Confirmar si hay versión viernes', ewSlide:'Video TAFE News' },
  { id:'v9', iconKey:'gracias',   name:'Imagen de cierre',      desc:'Gracias por acompañarnos',                  time:'final',   rolesAsignados:['Medios: activa imagen cierre'],                                novedad:'',                                 ewSlide:'Imagen gracias por acompañarnos' },
];
const DEFAULT_DOMINGO: OrdenItem[] = [
  { id:'d1',  iconKey:'imagen',       name:'Imagen de inicio',                   desc:'Próximo evento o anuncio',                    time:'–20 min',     rolesAsignados:['Medios: carga imagen en EW'],                                   novedad:'',               ewSlide:'Imagen próximo evento' },
  { id:'d2',  iconKey:'countdown',    name:'Countdown 10 min',                   desc:'Timer cuenta regresiva',                      time:'–10 min',     rolesAsignados:['Medios: activa slide countdown'],                               novedad:'',               ewSlide:'Slide countdown 10:00' },
  { id:'d3',  iconKey:'cabezote',     name:'Cabezote TAFE',                      desc:'Video apertura',                              time:'00:00',       rolesAsignados:['Medios: reproduce cabezote'],                                   novedad:'',               ewSlide:'Video cabezote TAFE' },
  { id:'d4',  iconKey:'ministro',     name:'Ministro de alabanza',               desc:'Nombre del ministro a cargo',                 time:'+2 min',      rolesAsignados:['Medios: slide nombre ministro'],                                novedad:'',               ewSlide:'Slide nombre ministro' },
  { id:'d5',  iconKey:'canciones',    name:'4 canciones',                        desc:'Letras con fondos o video de fondo',          time:'+5 min',      rolesAsignados:['Medios: secuencia letras','Alabanza: lista canciones'],         novedad:'Confirmar lista', ewSlide:'Canciones (letras + fondos)' },
  { id:'d6',  iconKey:'especial',     name:'Especial (opcional)',                 desc:'Número especial — confirmar si aplica',       time:'variable',    rolesAsignados:['Medios: material especial si aplica'],                          novedad:'Por confirmar',  ewSlide:'[OPCIONAL] Especial' },
  { id:'d7',  iconKey:'pastor',       name:'Pastor Lancelot',                    desc:'Prédica dominical',                           time:'variable',    rolesAsignados:['Medios: slide nombre pastor','StreamLabs: verificar audio'],   novedad:'',               ewSlide:'Slide pastor Lancelot' },
  { id:'d8',  iconKey:'ministracion', name:'Ministración — Profeta Nelda Ayala', desc:'Ministración post-prédica',                   time:'post-prédica',rolesAsignados:['Medios: slide nombre ministra'],                                novedad:'',               ewSlide:'Slide profeta Nelda Ayala' },
  { id:'d9',  iconKey:'ofrendas',     name:'Diezmos y ofrendas',                 desc:'Video — a cargo de profeta Nelda',            time:'variable',    rolesAsignados:['Medios: reproduce video ofrendas'],                             novedad:'',               ewSlide:'Video diezmos y ofrendas' },
  { id:'d10', iconKey:'tafe',         name:'TAFE News',                          desc:'Video informativo semanal — versión domingo', time:'variable',    rolesAsignados:['Medios: reproduce TAFE News domingo'],                          novedad:'',               ewSlide:'Video TAFE News domingo' },
  { id:'d11', iconKey:'gracias',      name:'Imagen de cierre',                   desc:'Gracias por acompañarnos',                    time:'final',       rolesAsignados:['Medios: activa imagen cierre'],                                 novedad:'',               ewSlide:'Imagen gracias por acompañarnos' },
];
const DEFAULT_ESPECIAL: OrdenItem[] = [
  { id:'esp1', iconKey:'imagen',    name:'Imagen de inicio',  desc:'Diseño del evento especial', time:'–20 min', rolesAsignados:['Medios: carga imagen en EW'],     novedad:'Pendiente diseño', ewSlide:'Imagen del evento' },
  { id:'esp2', iconKey:'countdown', name:'Countdown 10 min',   desc:'Timer cuenta regresiva',    time:'–10 min', rolesAsignados:['Medios: activa slide countdown'], novedad:'',                 ewSlide:'Slide countdown 10:00' },
  { id:'esp3', iconKey:'cabezote',  name:'Cabezote TAFE',      desc:'Video de apertura',         time:'00:00',   rolesAsignados:['Medios: reproduce cabezote'],     novedad:'',                 ewSlide:'Video cabezote TAFE' },
  { id:'esp4', iconKey:'canciones', name:'Alabanza',           desc:'Segmento de adoración',     time:'+5 min',  rolesAsignados:['Alabanza: confirmar canciones'],  novedad:'Confirmar lista',  ewSlide:'Canciones' },
  { id:'esp5', iconKey:'gracias',   name:'Imagen de cierre',   desc:'Gracias por acompañarnos',  time:'final',   rolesAsignados:['Medios: activa imagen cierre'],   novedad:'',                 ewSlide:'Imagen gracias por acompañarnos' },
];
const DEFAULT_EQUIPO: EquipoMiembro[] = [
  { id:'e1', name:'Equipo de medios',     role:'Operador principal EW',             grupo:'medios' },
  { id:'e2', name:'Diseñador/a',          role:'Fondos, imágenes, TAFE News',       grupo:'medios' },
  { id:'e3', name:'Operador cámara',      role:'Grabación y streaming',             grupo:'medios' },
  { id:'e4', name:'StreamLabs',           role:'Monitor audio en vivo',             grupo:'medios' },
  { id:'e5', name:'Ministro de alabanza', role:'Por asignar',                       grupo:'alabanza' },
  { id:'e6', name:'Ministro de cierre',   role:'Por asignar',                       grupo:'alabanza' },
  { id:'e7', name:'Ministro dominical',   role:'Por asignar',                       grupo:'alabanza' },
  { id:'e8', name:'Pastor Lancelot',      role:'Prédica dominical',                 grupo:'pastoral' },
  { id:'e9', name:'Profeta Nelda Ayala',  role:'Ministración y ofrendas (domingo)', grupo:'pastoral' },
];
const DEFAULT_PROGRAMA: ProgramaMes = {
  id:'mes_mayo2026', mesLabel:'Mayo 2026', liderCargo:'JOSEPH MEJIA DAVIS',
  temasMes:['No te distraigas','Las cosas que nos distraen','El peligro de distraerse','Como luchar contra las distracciones','Puesto los ojos en Jesús'],
  viernes:[
    { id:'vf1', fechaLabel:'1 mayo',  ministro:'JOSEPH MEJIA DAVIS', tema:'No te distraigas',                     oracion:'KAREN ANTOLINEZ' },
    { id:'vf2', fechaLabel:'8 mayo',  ministro:'LUZ ELENA PRETELT',  tema:'Las cosas que nos distraen',           oracion:'JORDY HERNANDEZ' },
    { id:'vf3', fechaLabel:'15 mayo', ministro:'LICETH LEVER',       tema:'El peligro de distraerse',             oracion:'NANCY VALLEJO' },
    { id:'vf4', fechaLabel:'22 mayo', ministro:'CLAUDIA DE LA HOZ',  tema:'Como luchar contra las distracciones', oracion:'JORDANY LEVER' },
    { id:'vf5', fechaLabel:'29 mayo', ministro:'SERGIO LEVER',       tema:'Puesto los ojos en Jesús',             oracion:'JORDANY LEVER' },
  ],
  domingos:[
    { id:'dm1', fechaLabel:'3 mayo',  primerServicio:'ALVARO GUERRERO',    segundoServicio:'ALVARO GUERRERO',    tema:'No te distraigas' },
    { id:'dm2', fechaLabel:'10 mayo', primerServicio:'ANA MILENA HERRERA', segundoServicio:'KAREN ANTOLINEZ',   tema:'Las cosas que nos distraen' },
    { id:'dm3', fechaLabel:'17 mayo', primerServicio:'HEIDY FREITTE',      segundoServicio:'JORDANY LEVER',     tema:'El peligro de distraerse' },
    { id:'dm4', fechaLabel:'24 mayo', primerServicio:'LICETH LEVER',       segundoServicio:'LICETH LEVER',      tema:'Como luchar contra las distracciones' },
    { id:'dm5', fechaLabel:'31 mayo', primerServicio:'BENETT BISCAINO',    segundoServicio:'CLAUDIA DE LA HOZ', tema:'Puestos los ojos en Jesús' },
  ],
  especiales:[], evangelismos:[], ayunos:[
    { id:'ay1', fechaLabel:'Sáb 9 mayo',  ministerio:'MEDIOS',      tema:'LAS COSAS QUE NOS DISTRAEN' },
    { id:'ay2', fechaLabel:'Sáb 23 mayo', ministerio:'ANFITRIONES', tema:'COMO LUCHAR CONTRA LAS DISTRACCIONES' },
  ],
  eventos:[{ id:'ev1', fechaLabel:'Sáb 16 mayo', nombre:'JORNADA DE EVANGELISMO', lugar:'Barrio Las Palmas', hora:'4:00 pm' }],
};

const STORAGE_KEY = 'tafe_erp_orden_del_dia';

const buildInitialState = (): OrdenState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      // Current multi-month format
      if (Array.isArray(p.meses)) {
        return {
          meses: p.meses.map((m: any) => ({ ...m, evangelismos: m.evangelismos ?? [] })),
          activeMesId: p.activeMesId ?? p.meses[0]?.id ?? DEFAULT_PROGRAMA.id,
          servicioData: p.servicioData ?? {},
        };
      }
      // Previous single-month with servicioData
      if (p.servicioData !== undefined) {
        const mes: ProgramaMes = { ...DEFAULT_PROGRAMA, ...(p.programaMes ?? {}), id: 'mes_mayo2026', especiales: p.programaMes?.especiales ?? [], evangelismos: p.programaMes?.evangelismos ?? [] };
        return { meses: [mes], activeMesId: mes.id, servicioData: p.servicioData };
      }
      // Oldest format
      if (p.programaMes) {
        const mes: ProgramaMes = { ...DEFAULT_PROGRAMA, ...p.programaMes, id: 'mes_mayo2026', especiales: [], evangelismos: [] };
        return { meses: [mes], activeMesId: mes.id, servicioData: {} };
      }
    }
  } catch { /* ignore */ }
  return { meses: [DEFAULT_PROGRAMA], activeMesId: DEFAULT_PROGRAMA.id, servicioData: {} };
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

const MONTHS_ES: Record<string, number> = {
  enero:0, febrero:1, marzo:2, abril:3, mayo:4, junio:5,
  julio:6, agosto:7, septiembre:8, octubre:9, noviembre:10, diciembre:11,
};
const parseMesInfo = (mesLabel: string): { year: number; month: number } | null => {
  const parts = mesLabel.toLowerCase().split(' ');
  const month = MONTHS_ES[parts[0]];
  const year  = parseInt(parts[1] ?? '');
  return month !== undefined && !isNaN(year) ? { year, month } : null;
};
const extractDay = (fechaLabel: string): number => {
  const m = fechaLabel.match(/\b(\d{1,2})\b/);
  return m ? parseInt(m[1]) : 0;
};

// ─── Component ────────────────────────────────────────────────────────────────

const OrdenDelDia: React.FC<Props> = ({ role }) => {
  const canEdit = role === UserRole.SUPER_ADMIN || role === UserRole.LIDER_MINISTERIO;

  const [state,             setState]             = useState<OrdenState>(buildInitialState);
  const [syncStatus,        setSyncStatus]        = useState<'idle'|'loading'|'saving'|'synced'|'local'>('idle');
  const configRecordIdRef = useRef<string | undefined>(undefined);
  const saveTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitializedRef = useRef(false);

  const [activeView,        setActiveView]        = useState<string>('mes');
  const [expandedId,        setExpandedId]        = useState<string | null>(null);
  const [editingId,         setEditingId]         = useState<string | null>(null);
  const [editForm,          setEditForm]          = useState<Partial<OrdenItem> & { rolesStr?: string }>({});
  const [editEquipoId,      setEditEquipoId]      = useState<string | null>(null);
  const [equipoForm,        setEquipoForm]        = useState<{ name: string; role: string }>({ name:'', role:'' });
  const [addingEqGrupo,     setAddingEqGrupo]     = useState<GrupoEquipo | null>(null);
  const [newEquipo,         setNewEquipo]         = useState<{ name: string; role: string }>({ name:'', role:'' });
  const [showNovedadForm,   setShowNovedadForm]   = useState(false);
  const [novedadForm,       setNovedadForm]       = useState<{ tipo: TipoNovedad; titulo: string; texto: string }>({ tipo:'info', titulo:'', texto:'' });
  const [copied,            setCopied]            = useState(false);

  // Month management
  const [showAddMes,        setShowAddMes]        = useState(false);
  const [addMesForm,        setAddMesForm]        = useState<{ mesLabel: string; liderCargo: string }>({ mesLabel:'', liderCargo:'' });
  const [confirmDelMes,     setConfirmDelMes]     = useState<string | null>(null);

  // Add service to date selector
  const [showAddService,    setShowAddService]    = useState(false);
  const [addServiceForm,    setAddServiceForm]    = useState<{ tipo: TipoServicio; fechaLabel: string; nombre: string }>({ tipo:'viernes', fechaLabel:'', nombre:'' });

  // Programa editing
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

  // ── Carga inicial desde Airtable ────────────────────────────────────────────
  useEffect(() => {
    if (!airtableIsActive()) { setSyncStatus('local'); hasInitializedRef.current = true; return; }
    setSyncStatus('loading');
    getConfigRecord('orden_del_dia_state')
      .then(result => {
        if (result) {
          configRecordIdRef.current = result.id;
          try {
            const remote = JSON.parse(result.valor) as OrdenState;
            if (Array.isArray(remote.meses)) {
              remote.meses = remote.meses.map((m: any) => ({ ...m, evangelismos: m.evangelismos ?? [] }));
            }
            hasInitializedRef.current = true;
            setState(remote);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
          } catch { hasInitializedRef.current = true; }
          setSyncStatus('synced');
        } else {
          hasInitializedRef.current = true;
          setSyncStatus('local');
        }
      })
      .catch(() => { hasInitializedRef.current = true; setSyncStatus('local'); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persistencia: localStorage inmediata + Airtable con debounce ─────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!airtableIsActive() || !hasInitializedRef.current) return;
    setSyncStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const newId = await upsertConfigRecord('orden_del_dia_state', JSON.stringify(state), configRecordIdRef.current);
      if (newId) { configRecordIdRef.current = newId; setSyncStatus('synced'); }
    }, 2500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [state]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const activeMes = state.meses.find(m => m.id === state.activeMesId) ?? state.meses[0];

  const allServices = useMemo(() => {
    if (!activeMes) return [];
    const vs = activeMes.viernes.map(v  => ({ id:v.id,  fechaLabel:v.fechaLabel,  tipo:'viernes'  as TipoServicio, day:parseInt(v.fechaLabel)||0,  nombre:'' }));
    const ds = activeMes.domingos.map(d => ({ id:d.id,  fechaLabel:d.fechaLabel,  tipo:'domingo'  as TipoServicio, day:parseInt(d.fechaLabel)||0,  nombre:'' }));
    const es = (activeMes.especiales??[]).map(e => ({ id:e.id, fechaLabel:e.fechaLabel, tipo:'especial' as TipoServicio, day:parseInt(e.fechaLabel)||0, nombre:e.nombre }));
    return [...vs, ...ds, ...es].sort((a, b) => a.day - b.day);
  }, [activeMes]);

  const getServicio = (id: string, tipo: TipoServicio): ServicioDetalle =>
    state.servicioData[id] ?? {
      id, tipo,
      ordenItems: tipo==='viernes' ? DEFAULT_VIERNES.map(i=>({...i})) : tipo==='domingo' ? DEFAULT_DOMINGO.map(i=>({...i})) : DEFAULT_ESPECIAL.map(i=>({...i})),
      equipo: DEFAULT_EQUIPO.map(e=>({...e})),
      novedades: [],
    };

  const activeSvcMeta   = activeView !== 'mes' ? allServices.find(s => s.id === activeView) : null;
  const activeDetalle   = activeSvcMeta ? getServicio(activeView, activeSvcMeta.tipo) : null;

  const isServicePast = (fechaLabel: string): boolean => {
    const info = parseMesInfo(activeMes?.mesLabel ?? '');
    if (!info) return false;
    const day = extractDay(fechaLabel);
    if (!day) return false;
    const now = new Date();
    return info.year < now.getFullYear() ||
      (info.year === now.getFullYear() && info.month < now.getMonth()) ||
      (info.year === now.getFullYear() && info.month === now.getMonth() && day < now.getDate());
  };

  const switchView = (id: string) => {
    setActiveView(id);
    setExpandedId(null); setEditingId(null); setEditForm({});
    setEditEquipoId(null); setAddingEqGrupo(null);
    setShowNovedadForm(false); setNovedadForm({ tipo:'info', titulo:'', texto:'' });
    setEditingPrograId(null); setAddingPrograSection(null);
    setShowAddService(false);
  };

  // ── State helpers ──────────────────────────────────────────────────────────

  const updateActiveMes = (updater: (m: ProgramaMes) => ProgramaMes) =>
    setState(s => ({ ...s, meses: s.meses.map(m => m.id === s.activeMesId ? updater(m) : m) }));

  const updateSvc = (updater: (s: ServicioDetalle) => ServicioDetalle) => {
    if (!activeSvcMeta) return;
    const cur = getServicio(activeView, activeSvcMeta.tipo);
    setState(s => ({ ...s, servicioData: { ...s.servicioData, [activeView]: updater(cur) } }));
  };

  // ── Month handlers ─────────────────────────────────────────────────────────

  const addNewMes = () => {
    if (!addMesForm.mesLabel.trim()) return;
    const nm: ProgramaMes = {
      id: `mes_${Date.now()}`, mesLabel: addMesForm.mesLabel.trim(), liderCargo: addMesForm.liderCargo.trim(),
      temasMes: [], viernes: [], domingos: [], especiales: [], ayunos: [], eventos: [],
    };
    setState(s => ({ ...s, meses: [...s.meses, nm], activeMesId: nm.id }));
    setShowAddMes(false); setAddMesForm({ mesLabel:'', liderCargo:'' });
    switchView('mes');
  };

  const deleteMes = (mesId: string) => {
    if (state.meses.length <= 1) return;
    setState(s => {
      const remaining = s.meses.filter(m => m.id !== mesId);
      return { ...s, meses: remaining, activeMesId: s.activeMesId === mesId ? remaining[0].id : s.activeMesId };
    });
    setConfirmDelMes(null);
    switchView('mes');
  };

  const switchMes = (mesId: string) => {
    setState(s => ({ ...s, activeMesId: mesId }));
    switchView('mes');
  };

  // ── Add service date ───────────────────────────────────────────────────────

  const addServiceDate = () => {
    const { tipo, fechaLabel, nombre } = addServiceForm;
    if (!fechaLabel.trim()) return;
    const id = `${tipo}_${Date.now()}`;
    if (tipo === 'viernes') {
      updateActiveMes(m => ({ ...m, viernes: [...m.viernes, { id, fechaLabel:fechaLabel.trim(), ministro:'', tema:'', oracion:'' }] }));
    } else if (tipo === 'domingo') {
      updateActiveMes(m => ({ ...m, domingos: [...m.domingos, { id, fechaLabel:fechaLabel.trim(), primerServicio:'', segundoServicio:'', tema:'' }] }));
    } else {
      updateActiveMes(m => ({ ...m, especiales: [...(m.especiales??[]), { id, fechaLabel:fechaLabel.trim(), nombre:nombre.trim()||'Servicio Especial' }] }));
    }
    setShowAddService(false);
    setAddServiceForm({ tipo:'viernes', fechaLabel:'', nombre:'' });
    setActiveView(id);
  };

  // ── Item handlers ──────────────────────────────────────────────────────────

  const startEditItem = (item: OrdenItem, e: React.MouseEvent) => {
    e.stopPropagation(); setEditingId(item.id); setExpandedId(item.id);
    setEditForm({ ...item, rolesStr: item.rolesAsignados.join('\n') });
  };
  const saveEditItem = () => {
    if (!editingId) return;
    updateSvc(sv => ({ ...sv, ordenItems: sv.ordenItems.map(it => it.id !== editingId ? it : {
      ...it, ...editForm, iconKey:(editForm.iconKey??it.iconKey) as IconKey,
      rolesAsignados:(editForm.rolesStr??'').split('\n').map(r=>r.trim()).filter(Boolean),
    }) }));
    setEditingId(null); setEditForm({});
  };
  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateSvc(sv => ({ ...sv, ordenItems: sv.ordenItems.filter(it => it.id !== id) }));
    if (expandedId === id) setExpandedId(null);
  };
  const addItem = () => {
    const n: OrdenItem = { id:`item_${Date.now()}`, iconKey:'video', name:'Nuevo elemento', desc:'Descripción', time:'variable', rolesAsignados:['Medios: asignar'], novedad:'Pendiente', ewSlide:'Nuevo slide EW' };
    updateSvc(sv => ({ ...sv, ordenItems: [...sv.ordenItems, n] }));
    setExpandedId(n.id); setEditingId(n.id);
    setEditForm({ ...n, rolesStr: n.rolesAsignados.join('\n') });
  };
  const exportEW = () => {
    if (!activeDetalle || !activeSvcMeta) return;
    const label = `Servicio ${activeSvcMeta.fechaLabel.toUpperCase()} — ${activeMes?.mesLabel??''}`;
    const lines = activeDetalle.ordenItems.map((it,i) => `${i+1}. ${it.ewSlide}`).join('\n');
    navigator.clipboard.writeText(`ORDEN DEL DÍA — ${label}\nIglesia TAFE\n\n${lines}`).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2500); });
  };

  // ── Equipo handlers ────────────────────────────────────────────────────────

  const saveEquipo = () => {
    if (!editEquipoId) return;
    updateSvc(sv => ({ ...sv, equipo: sv.equipo.map(m => m.id===editEquipoId ? {...m,...equipoForm} : m) }));
    setEditEquipoId(null); setEquipoForm({ name:'', role:'' });
  };
  const addEquipoMember = (grupo: GrupoEquipo) => {
    if (!newEquipo.name.trim()) return;
    updateSvc(sv => ({ ...sv, equipo:[...sv.equipo,{ id:`eq_${Date.now()}`, name:newEquipo.name.trim(), role:newEquipo.role.trim(), grupo }] }));
    setNewEquipo({ name:'', role:'' }); setAddingEqGrupo(null);
  };
  const deleteEquipo = (id: string) => updateSvc(sv => ({ ...sv, equipo:sv.equipo.filter(m=>m.id!==id) }));

  // ── Novedad handlers ───────────────────────────────────────────────────────

  const addNovedad = () => {
    if (!novedadForm.titulo.trim()) return;
    updateSvc(sv => ({ ...sv, novedades:[{ id:`n_${Date.now()}`, ...novedadForm }, ...sv.novedades] }));
    setNovedadForm({ tipo:'info', titulo:'', texto:'' }); setShowNovedadForm(false);
  };
  const deleteNovedad = (id: string) => updateSvc(sv => ({ ...sv, novedades:sv.novedades.filter(n=>n.id!==id) }));

  // ── Programa handlers ──────────────────────────────────────────────────────

  const updatePrograRow = (sec: PrograSection, id: string, data: Record<string,string>) =>
    updateActiveMes(m => ({ ...m, [sec]:(m[sec] as any[]).map((r:any) => r.id===id ? {...r,...data} : r) }));
  const deletePrograRow = (sec: PrograSection, id: string) =>
    updateActiveMes(m => ({ ...m, [sec]:(m[sec] as any[]).filter((r:any) => r.id!==id) }));
  const addPrograRow = (sec: PrograSection, data: Record<string,string>) =>
    updateActiveMes(m => ({ ...m, [sec]:[...(m[sec] as any[]), { id:`${sec}_${Date.now()}`, ...data }] }));
  const movePrograRow = (sec: PrograSection, id: string, dir: 'up' | 'down') =>
    updateActiveMes(m => {
      const arr = [...(m[sec] as any[])];
      const idx = arr.findIndex((r: any) => r.id === id);
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= arr.length) return m;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return { ...m, [sec]: arr };
    });
  const addTema = () => {
    if (!newTema.trim()) return;
    updateActiveMes(m => ({ ...m, temasMes:[...m.temasMes, newTema.trim()] }));
    setNewTema(''); setShowAddTema(false);
  };
  const deleteTema = (i: number) => updateActiveMes(m => ({ ...m, temasMes:m.temasMes.filter((_,idx)=>idx!==i) }));
  const saveTema   = (i: number) => { updateActiveMes(m => ({ ...m, temasMes:m.temasMes.map((t,idx)=>idx===i?editTema:t) })); setEditingTemaIdx(null); };

  // ── Style helpers ──────────────────────────────────────────────────────────

  const svcPillActive = (tipo: TipoServicio) =>
    tipo==='viernes' ? 'bg-emerald-600 text-white border-emerald-600' :
    tipo==='domingo' ? 'bg-amber-500  text-white border-amber-500'  :
                       'bg-purple-600 text-white border-purple-600';
  const svcBadgeInactive = (tipo: TipoServicio) =>
    tipo==='viernes' ? 'bg-emerald-100 text-emerald-700' :
    tipo==='domingo' ? 'bg-amber-100  text-amber-700'  :
                       'bg-purple-100 text-purple-700';
  const svcBadgeLabel = (tipo: TipoServicio) =>
    tipo==='viernes' ? 'VIE' : tipo==='domingo' ? 'DOM' : 'ESP';
  const svcHeaderBg = (tipo: TipoServicio) =>
    tipo==='viernes' ? 'bg-emerald-50 border-emerald-200' :
    tipo==='domingo' ? 'bg-amber-50  border-amber-200'  :
                       'bg-purple-50 border-purple-200';

  const StatusBadge = ({ novedad }: { novedad: string }) =>
    novedad
      ? <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-amber-200 truncate max-w-[180px]"><AlertTriangle size={10} className="flex-shrink-0"/><span className="truncate">{novedad}</span></span>
      : <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-emerald-200"><Check size={10}/> listo</span>;

  const novStyle: Record<TipoNovedad,{ card:string; badge:string; icon:React.ReactNode }> = {
    warn:{ card:'bg-red-50 border-red-200',     badge:'bg-red-100 text-red-700',     icon:<AlertTriangle size={11}/> },
    info:{ card:'bg-blue-50 border-blue-200',   badge:'bg-blue-100 text-blue-700',   icon:<InfoIcon size={11}/> },
    ok:  { card:'bg-emerald-50 border-emerald-200', badge:'bg-emerald-100 text-emerald-700', icon:<Check size={11}/> },
  };

  // ── Month switcher ─────────────────────────────────────────────────────────

  const renderMonthSwitcher = () => (
    <div className="space-y-2">
      <div className="flex gap-1.5 items-center flex-wrap">
        {state.meses.map(m => (
          <div key={m.id} className="relative group">
            <button
              onClick={() => switchMes(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                m.id === state.activeMesId
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              {m.mesLabel}
            </button>
            {canEdit && state.meses.length > 1 && (
              <button
                onClick={() => setConfirmDelMes(m.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] items-center justify-center hidden group-hover:flex transition-all"
                title="Eliminar mes"
              >×</button>
            )}
          </div>
        ))}
        {canEdit && !showAddMes && (
          <button
            onClick={() => setShowAddMes(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-all"
          >
            <Plus size={11}/> Nuevo mes
          </button>
        )}
      </div>

      {showAddMes && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-wrap gap-2 items-end">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mes</label>
            <input autoFocus className="mt-0.5 block text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400 w-36"
              placeholder="ej: Junio 2026" value={addMesForm.mesLabel} onChange={e=>setAddMesForm(f=>({...f,mesLabel:e.target.value}))}
              onKeyDown={e=>{ if(e.key==='Enter') addNewMes(); if(e.key==='Escape') setShowAddMes(false); }} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Líder a cargo</label>
            <input className="mt-0.5 block text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400 w-48"
              placeholder="Nombre del líder" value={addMesForm.liderCargo} onChange={e=>setAddMesForm(f=>({...f,liderCargo:e.target.value}))}
              onKeyDown={e=>{ if(e.key==='Enter') addNewMes(); if(e.key==='Escape') setShowAddMes(false); }} />
          </div>
          <div className="flex gap-1.5">
            <button onClick={addNewMes} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"><Check size={12}/> Crear</button>
            <button onClick={()=>setShowAddMes(false)} className="text-xs border border-slate-200 bg-white text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {confirmDelMes && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3 text-sm text-red-700 flex-wrap">
          <AlertTriangle size={14}/>
          <span>¿Eliminar <strong>{state.meses.find(m=>m.id===confirmDelMes)?.mesLabel}</strong>? Los datos de servicios de ese mes no se recuperan.</span>
          <button onClick={()=>deleteMes(confirmDelMes)} className="ml-auto bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Eliminar</button>
          <button onClick={()=>setConfirmDelMes(null)} className="text-xs border border-red-200 bg-white px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Cancelar</button>
        </div>
      )}
    </div>
  );

  // ── Date selector ──────────────────────────────────────────────────────────

  const renderDateSelector = () => (
    <div className="space-y-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1 items-center" style={{ scrollbarWidth:'none' }}>
        <button
          onClick={() => switchView('mes')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${
            activeView==='mes' ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
          }`}
        >
          <CalendarDays size={12}/> Programa del Mes
        </button>

        {allServices.map(svc => {
          const detalle  = state.servicioData[svc.id];
          const hasNov   = !!(detalle?.novedades?.length);
          const isActive = activeView === svc.id;
          const isPast   = isServicePast(svc.fechaLabel);
          return (
            <button key={svc.id} onClick={() => switchView(svc.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${
                isActive
                  ? svcPillActive(svc.tipo)
                  : isPast
                    ? 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : svcBadgeInactive(svc.tipo)}`}>
                {svcBadgeLabel(svc.tipo)}
              </span>
              <span className={isPast && !isActive ? 'opacity-60' : ''}>
                {svc.tipo === 'especial' && svc.nombre ? `${svc.nombre} · ${svc.fechaLabel}` : svc.fechaLabel}
              </span>
              {isPast && !isActive && <Clock size={9} className="text-slate-300 flex-shrink-0"/>}
              {hasNov && <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"/>}
            </button>
          );
        })}

        {canEdit && (
          <button onClick={() => { setShowAddService(v => !v); }}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 ${
              showAddService ? 'bg-blue-600 text-white border-blue-600' : 'border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400'
            }`}
          >
            <Plus size={12}/> Agregar fecha
          </button>
        )}
      </div>

      {showAddService && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-wrap gap-2 items-end">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo</label>
            <select className="mt-0.5 block text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400"
              value={addServiceForm.tipo} onChange={e=>setAddServiceForm(f=>({...f, tipo:e.target.value as TipoServicio}))}>
              <option value="viernes">Viernes</option>
              <option value="domingo">Domingo</option>
              <option value="especial">Especial</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha</label>
            <input autoFocus className="mt-0.5 block text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400 w-32"
              placeholder="ej: 5 junio" value={addServiceForm.fechaLabel}
              onChange={e=>setAddServiceForm(f=>({...f,fechaLabel:e.target.value}))}
              onKeyDown={e=>{ if(e.key==='Enter') addServiceDate(); if(e.key==='Escape') setShowAddService(false); }} />
          </div>
          {addServiceForm.tipo === 'especial' && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre del servicio</label>
              <input className="mt-0.5 block text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400 w-48"
                placeholder="ej: Vigilia de Oración" value={addServiceForm.nombre}
                onChange={e=>setAddServiceForm(f=>({...f,nombre:e.target.value}))}
                onKeyDown={e=>{ if(e.key==='Enter') addServiceDate(); if(e.key==='Escape') setShowAddService(false); }} />
            </div>
          )}
          <div className="flex gap-1.5">
            <button onClick={addServiceDate} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"><Check size={12}/> Agregar</button>
            <button onClick={()=>setShowAddService(false)} className="text-xs border border-slate-200 bg-white text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
          </div>
        </div>
      )}
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
            <div className={`flex gap-3 cursor-pointer rounded-xl transition-colors px-2 py-1.5 ${isExpanded?'bg-slate-50':'hover:bg-slate-50'}`}
              onClick={() => { if(!isEditing) setExpandedId(isExpanded?null:item.id); }}>
              <div className="flex flex-col items-center w-14 flex-shrink-0 pt-1.5">
                <span className="text-[10px] text-slate-400 font-mono font-semibold leading-none">{item.time}</span>
                {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[16px]"/>}
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${COLOR_MAP[item.iconKey]??'bg-slate-100 text-slate-600'} mt-0.5`}>
                {ICON_MAP[item.iconKey]}
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 text-sm">{item.name}</span>
                  <StatusBadge novedad={item.novedad}/>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
              </div>
              <div className="text-slate-400 self-center flex-shrink-0">
                {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              </div>
            </div>

            {isExpanded && !isEditing && (
              <div className="ml-[4.5rem] mb-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Roles asignados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.rolesAsignados.map((r,ri) => (
                      <span key={ri} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg"><User size={10} className="text-slate-400"/> {r}</span>
                    ))}
                  </div>
                </div>
                {item.novedad && <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Novedad / pendiente</p><p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">{item.novedad}</p></div>}
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Slide Easy Worship</p><p className="text-xs text-slate-600 font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">{item.ewSlide}</p></div>
                {canEdit && (
                  <div className="flex gap-2 pt-1 border-t border-slate-200">
                    <button onClick={e=>startEditItem(item,e)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Pencil size={11}/> Editar</button>
                    <button onClick={e=>deleteItem(item.id,e)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={11}/> Eliminar</button>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div className="ml-[4.5rem] mb-2 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2" onClick={e=>e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre</label><input className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" value={editForm.name??''} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))}/></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiempo</label><input className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" value={editForm.time??''} onChange={e=>setEditForm(f=>({...f,time:e.target.value}))}/></div>
                </div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descripción</label><input className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" value={editForm.desc??''} onChange={e=>setEditForm(f=>({...f,desc:e.target.value}))}/></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Slide EW</label><input className="mt-1 w-full text-sm font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" value={editForm.ewSlide??''} onChange={e=>setEditForm(f=>({...f,ewSlide:e.target.value}))}/></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ícono</label>
                    <select className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" value={editForm.iconKey??'video'} onChange={e=>setEditForm(f=>({...f,iconKey:e.target.value as IconKey}))}>
                      {ICON_OPTIONS.map(k=><option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Roles <span className="normal-case font-normal">(uno por línea)</span></label><textarea rows={3} className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400 resize-none" value={editForm.rolesStr??''} onChange={e=>setEditForm(f=>({...f,rolesStr:e.target.value}))}/></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Novedad / pendiente</label><input className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" placeholder="Dejar vacío si está listo" value={editForm.novedad??''} onChange={e=>setEditForm(f=>({...f,novedad:e.target.value}))}/></div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEditItem} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"><Check size={12}/> Guardar</button>
                  <button onClick={()=>{setEditingId(null);setEditForm({});}} className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 hover:bg-white px-3 py-1.5 rounded-lg transition-colors"><X size={12}/> Cancelar</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {canEdit && (
        <button onClick={addItem} className="w-full mt-2 flex items-center justify-center gap-2 border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-sm py-2.5 rounded-xl transition-all">
          <Plus size={14}/> Agregar elemento
        </button>
      )}
    </div>
  );

  // ── Equipo section ─────────────────────────────────────────────────────────

  const renderEquipoSection = (equipo: EquipoMiembro[]) => (
    <div className="space-y-3">
      {(['medios','alabanza','pastoral'] as GrupoEquipo[]).map(grupo => (
        <div key={grupo} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{GRUPO_LABELS[grupo]}</h4>
            {canEdit && addingEqGrupo !== grupo && (
              <button onClick={()=>{ setAddingEqGrupo(grupo); setNewEquipo({name:'',role:''}); setEditEquipoId(null); }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Plus size={11}/> Agregar
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {equipo.filter(m=>m.grupo===grupo).map(m =>
              editEquipoId===m.id ? (
                <div key={m.id} className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <input autoFocus className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" placeholder="Nombre" value={equipoForm.name} onChange={e=>setEquipoForm(f=>({...f,name:e.target.value}))}/>
                  <input className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" placeholder="Rol" value={equipoForm.role} onChange={e=>setEquipoForm(f=>({...f,role:e.target.value}))}/>
                  <div className="flex gap-1.5">
                    <button onClick={saveEquipo} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-xs font-semibold py-1.5 rounded-lg"><Check size={11}/> Guardar</button>
                    <button onClick={()=>setEditEquipoId(null)} className="flex-1 border border-slate-200 bg-white text-slate-600 text-xs py-1.5 rounded-lg">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="p-3 border border-slate-200 rounded-xl flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5"><User size={13} className="text-slate-500"/></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p><p className="text-xs text-slate-500 mt-0.5">{m.role}</p></div>
                  {canEdit && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={e=>{e.stopPropagation();setEditEquipoId(m.id);setEquipoForm({name:m.name,role:m.role});}} className="text-slate-300 hover:text-blue-500 p-1 rounded hover:bg-blue-50 transition-colors"><Pencil size={12}/></button>
                      <button onClick={()=>deleteEquipo(m.id)} className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"><Trash2 size={12}/></button>
                    </div>
                  )}
                </div>
              )
            )}
            {addingEqGrupo===grupo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <input autoFocus className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" placeholder="Nombre del miembro" value={newEquipo.name} onChange={e=>setNewEquipo(f=>({...f,name:e.target.value}))} onKeyDown={e=>{if(e.key==='Enter')addEquipoMember(grupo);if(e.key==='Escape')setAddingEqGrupo(null);}}/>
                <input className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400" placeholder="Rol o función" value={newEquipo.role} onChange={e=>setNewEquipo(f=>({...f,role:e.target.value}))} onKeyDown={e=>{if(e.key==='Enter')addEquipoMember(grupo);if(e.key==='Escape')setAddingEqGrupo(null);}}/>
                <div className="flex gap-1.5">
                  <button onClick={()=>addEquipoMember(grupo)} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"><Check size={11}/> Guardar</button>
                  <button onClick={()=>setAddingEqGrupo(null)} className="flex-1 border border-slate-200 bg-white text-slate-600 text-xs py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
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
      {novedades.length===0 && !showNovedadForm && (
        <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Bell size={28} className="mx-auto mb-2 opacity-20"/><p className="text-sm">Sin novedades para este servicio</p>
        </div>
      )}
      {novedades.map(n => {
        const s = novStyle[n.tipo];
        return (
          <div key={n.id} className={`p-4 rounded-xl border ${s.card} mb-2`}>
            <div className="flex items-start justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 ${s.badge} text-xs font-semibold px-2.5 py-1 rounded-full`}>{s.icon} {n.titulo}</span>
              {canEdit && <button onClick={()=>deleteNovedad(n.id)} className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors flex-shrink-0"><Trash2 size={13}/></button>}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mt-2">{n.texto}</p>
          </div>
        );
      })}
      {canEdit && (showNovedadForm ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex gap-3">
            <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Título</label><input className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white" placeholder="Título de la novedad" value={novedadForm.titulo} onChange={e=>setNovedadForm(f=>({...f,titulo:e.target.value}))}/></div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</label><select className="mt-1 text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400" value={novedadForm.tipo} onChange={e=>setNovedadForm(f=>({...f,tipo:e.target.value as TipoNovedad}))}><option value="info">Info</option><option value="warn">Alerta</option><option value="ok">Ok</option></select></div>
          </div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detalle</label><textarea rows={3} className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white resize-none" placeholder="Descripción..." value={novedadForm.texto} onChange={e=>setNovedadForm(f=>({...f,texto:e.target.value}))}/></div>
          <div className="flex gap-2">
            <button onClick={addNovedad} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"><Check size={13}/> Registrar</button>
            <button onClick={()=>setShowNovedadForm(false)} className="text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">Cancelar</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShowNovedadForm(true)} className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-sm py-3 rounded-xl transition-all mt-1">
          <Plus size={14}/> Registrar novedad
        </button>
      ))}
    </div>
  );

  // ── Programa section renderer ──────────────────────────────────────────────

  const renderPrograSection = (sectionKey: PrograSection, sectionLabel: string, data: Record<string,string>[]) => {
    const fields = PROGRA_FIELDS[sectionKey];
    const isAdding = addingPrograSection === sectionKey;
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{sectionLabel}</h3>
          {canEdit && !isAdding && (
            <button onClick={()=>{ setAddingPrograSection(sectionKey); setNewPrograForm({}); setEditingPrograId(null); }}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Plus size={11}/> Agregar
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {fields.map(f=><th key={f.key} className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{f.label}</th>)}
              {canEdit && <th className="w-16 px-2"/>}
            </tr></thead>
            <tbody>
              {data.map((row:any, rowIdx: number) =>
                editingPrograId===row.id ? (
                  <tr key={row.id} className="bg-blue-50">
                    {fields.map(f=>(
                      <td key={f.key} className="px-3 py-1.5">
                        <input className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-blue-400 min-w-[90px]"
                          value={editPrograForm[f.key]??row[f.key]??''} onChange={e=>setEditPrograForm(p=>({...p,[f.key]:e.target.value}))}/>
                      </td>
                    ))}
                    <td className="px-2 py-1.5"><div className="flex gap-1">
                      <button onClick={()=>{ updatePrograRow(sectionKey,row.id,editPrograForm); setEditingPrograId(null); }} className="p-1 text-emerald-600 hover:text-emerald-800"><Check size={13}/></button>
                      <button onClick={()=>setEditingPrograId(null)} className="p-1 text-slate-400 hover:text-slate-600"><X size={13}/></button>
                    </div></td>
                  </tr>
                ) : (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    {fields.map(f=><td key={f.key} className="px-4 py-2.5 text-slate-700">{row[f.key]||'—'}</td>)}
                    {canEdit && (
                      <td className="px-2 py-2.5"><div className="flex gap-0.5">
                        <button onClick={()=>movePrograRow(sectionKey,row.id,'up')} disabled={rowIdx===0} className="p-1 text-slate-300 hover:text-slate-600 rounded hover:bg-slate-100 disabled:opacity-20 transition-colors"><ChevronUp size={11}/></button>
                        <button onClick={()=>movePrograRow(sectionKey,row.id,'down')} disabled={rowIdx===data.length-1} className="p-1 text-slate-300 hover:text-slate-600 rounded hover:bg-slate-100 disabled:opacity-20 transition-colors"><ChevronDown size={11}/></button>
                        <button onClick={()=>{ setEditingPrograId(row.id); setEditPrograForm({}); setAddingPrograSection(null); }} className="p-1 text-slate-300 hover:text-blue-500 rounded hover:bg-blue-50 transition-colors"><Pencil size={11}/></button>
                        <button onClick={()=>deletePrograRow(sectionKey,row.id)} className="p-1 text-slate-300 hover:text-red-500 rounded hover:bg-red-50 transition-colors"><Trash2 size={11}/></button>
                      </div></td>
                    )}
                  </tr>
                )
              )}
              {data.length===0 && <tr><td colSpan={fields.length+1} className="px-4 py-4 text-xs text-slate-400 text-center">Sin registros</td></tr>}
            </tbody>
          </table>
        </div>
        {isAdding && (
          <div className="px-5 py-4 border-t border-blue-100 bg-blue-50 space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nuevo registro</p>
            <div className="grid grid-cols-2 gap-2">
              {fields.map(f=>(
                <div key={f.key}>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{f.label}</label>
                  <input className="mt-0.5 w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400"
                    placeholder={f.placeholder} value={newPrograForm[f.key]??''} onChange={e=>setNewPrograForm(p=>({...p,[f.key]:e.target.value}))}/>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={()=>{ addPrograRow(sectionKey,newPrograForm); setAddingPrograSection(null); setNewPrograForm({}); }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <Check size={12}/> Guardar
              </button>
              <button onClick={()=>setAddingPrograSection(null)} className="text-xs text-slate-600 border border-slate-200 hover:bg-white px-3 py-1.5 rounded-lg transition-colors">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Service view ───────────────────────────────────────────────────────────

  const renderServicioView = () => {
    if (!activeSvcMeta || !activeDetalle) return null;
    const { tipo, fechaLabel, nombre } = activeSvcMeta;
    const progV = tipo==='viernes'  ? activeMes?.viernes.find(v=>v.id===activeSvcMeta.id)  : null;
    const progD = tipo==='domingo'  ? activeMes?.domingos.find(d=>d.id===activeSvcMeta.id) : null;
    const progE = tipo==='especial' ? (activeMes?.especiales??[]).find(e=>e.id===activeSvcMeta.id) : null;
    const headerBg = svcHeaderBg(tipo);

    return (
      <div className="space-y-5">
        <div className={`rounded-2xl border p-4 ${headerBg}`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipo==='viernes'?'bg-emerald-200 text-emerald-800':tipo==='domingo'?'bg-amber-200 text-amber-800':'bg-purple-200 text-purple-800'}`}>
                  {tipo==='viernes'?'Viernes de Adoración':tipo==='domingo'?'Servicio Dominical':'Servicio Especial'}
                </span>
                <span className="text-slate-400 text-xs">{activeMes?.mesLabel}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                {tipo==='especial' && progE ? `${progE.nombre} · ${fechaLabel}` : `Servicio ${fechaLabel}`}
              </h3>
              {progV && <div className="mt-1.5 text-xs text-slate-600 space-y-0.5"><div>Ministro: <strong className="text-slate-800">{progV.ministro}</strong></div><div>Tema: <strong className="text-slate-800">{progV.tema}</strong></div><div>Oración / Cierre: <strong className="text-slate-800">{progV.oracion}</strong></div></div>}
              {progD && <div className="mt-1.5 text-xs text-slate-600 space-y-0.5"><div>1er servicio 08:00: <strong className="text-slate-800">{progD.primerServicio}</strong></div><div>2do servicio 10:00: <strong className="text-slate-800">{progD.segundoServicio}</strong></div><div>Tema: <strong className="text-slate-800">{progD.tema}</strong></div></div>}
            </div>
            <button onClick={exportEW} className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm flex-shrink-0">
              {copied ? <><Check size={14} className="text-emerald-500"/> Copiado</> : <><Copy size={14}/> Copiar secuencia EW</>}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Orden del servicio</p>
          {renderTimeline(activeDetalle.ordenItems)}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Secuencia Easy Worship</p>
          <div className="space-y-0.5">
            {activeDetalle.ordenItems.map((it,i) => (
              <div key={it.id} className="flex gap-3 items-center py-1 border-b border-slate-100 last:border-0">
                <span className="text-xs font-mono text-slate-400 w-5 flex-shrink-0 text-right">{i+1}</span>
                <span className="text-sm text-slate-700">{it.ewSlide}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2"><Users size={11}/> Equipo para este servicio</p>
          {renderEquipoSection(activeDetalle.equipo)}
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2"><Bell size={11}/> Novedades de este servicio</p>
          {renderNovedadesSection(activeDetalle.novedades)}
        </div>
      </div>
    );
  };

  // ── Calendar view ──────────────────────────────────────────────────────────

  const renderCalendarioMes = () => {
    if (!activeMes) return null;
    const info = parseMesInfo(activeMes.mesLabel);
    if (!info) return null;
    const { year, month } = info;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow    = new Date(year, month, 1).getDay();

    const today    = new Date();
    const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1;

    const saturdays: number[] = [];
    for (let d = 1; d <= daysInMonth; d++)
      if (new Date(year, month, d).getDay() === 6) saturdays.push(d);
    const ayunoSet   = new Set<number>([saturdays[1], saturdays[3]].filter((n): n is number => n !== undefined));
    const evangelSet = new Set<number>([saturdays[2]].filter((n): n is number => n !== undefined));

    const dayMap: Record<number, { type: string; label?: string }[]> = {};
    const push = (d: number, ev: { type: string; label?: string }) => {
      if (!dayMap[d]) dayMap[d] = [];
      dayMap[d].push(ev);
    };

    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, month, d).getDay();
      if (dow === 5) push(d, { type: 'viernes' });
      if (dow === 0) push(d, { type: 'domingo' });
    }
    ayunoSet.forEach(d   => push(d, { type: 'ayuno' }));
    evangelSet.forEach(d => push(d, { type: 'evangelismo' }));

    activeMes.viernes.forEach((v: ServicioViernes)              => { const d = extractDay(v.fechaLabel); const ev = dayMap[d]?.find(e => e.type==='viernes'); if (ev && v.ministro) ev.label = v.ministro; });
    activeMes.domingos.forEach((dm: ServicioDomingo)            => { const d = extractDay(dm.fechaLabel); const ev = dayMap[d]?.find(e => e.type==='domingo'); if (ev && dm.tema) ev.label = dm.tema; });
    activeMes.ayunos.forEach((a: Ayuno)                         => { const d = extractDay(a.fechaLabel); const ev = dayMap[d]?.find(e => e.type==='ayuno'); if (ev && a.ministerio) ev.label = a.ministerio; });
    activeMes.especiales.forEach((e: EspecialServicio)          => { const d = extractDay(e.fechaLabel); if (d) push(d, { type: 'especial', label: e.nombre }); });
    activeMes.eventos.forEach((evn: EventoMes)                  => { const d = extractDay(evn.fechaLabel); if (d) push(d, { type: 'evento', label: evn.nombre }); });
    (activeMes.evangelismos ?? []).forEach((je: JornadaEvangelismo) => {
      const d = extractDay(je.fechaLabel);
      const marker = dayMap[d]?.find(e => e.type === 'evangelismo');
      if (marker) {
        marker.label = [je.barrio, je.hora].filter(Boolean).join(' · ');
      }
    });

    const EV_COLOR: Record<string, string> = {
      viernes: 'bg-emerald-100 text-emerald-700', domingo: 'bg-amber-100 text-amber-700',
      ayuno: 'bg-indigo-100 text-indigo-700',     evangelismo: 'bg-orange-100 text-orange-700',
      especial: 'bg-purple-100 text-purple-700',  evento: 'bg-rose-100 text-rose-700',
    };
    const EV_SHORT: Record<string, string> = {
      viernes: 'VIE', domingo: 'DOM', ayuno: 'AYUNO', evangelismo: 'EVAN', especial: 'ESP', evento: 'EV',
    };
    const LEGEND = [
      { type:'viernes',     label:'Serv. Viernes' },
      { type:'domingo',     label:'Serv. Dominical' },
      { type:'ayuno',       label:'Ayuno (2do/4to Sáb)' },
      { type:'evangelismo', label:'Evangelismo (3er Sáb)' },
      { type:'especial',    label:'Serv. Especial' },
      { type:'evento',      label:'Evento' },
    ];

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const DOW = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <CalendarDays size={11}/> Vista de Calendario — {activeMes.mesLabel}
        </h4>
        <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden">
          {DOW.map(h => (
            <div key={h} className="bg-slate-50 text-center text-[10px] font-bold text-slate-400 uppercase py-1.5">{h}</div>
          ))}
          {cells.map((day, idx) => {
            if (day === null) return <div key={`x${idx}`} className="min-h-[64px] bg-slate-50/40"/>;
            const evs     = dayMap[day] ?? [];
            const isToday = day === todayDay;
            const isPast  = todayDay > 0 && day < todayDay;
            const col     = idx % 7;
            return (
              <div key={day} className={`min-h-[64px] p-1.5 ${isPast ? 'bg-slate-50' : 'bg-white'}`}>
                <div className={`text-[11px] font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-slate-800 text-white'
                  : isPast ? 'text-slate-300'
                  : col === 0 ? 'text-rose-500'
                  : col === 6 ? 'text-indigo-500'
                  : 'text-slate-600'
                }`}>{day}</div>
                <div className="space-y-0.5">
                  {evs.map((ev, ei) => (
                    <div key={ei} title={ev.label ?? ''} className={`text-[8px] font-bold px-1 py-0.5 rounded truncate leading-tight ${EV_COLOR[ev.type] ?? ''} ${isPast ? 'opacity-40' : ''}`}>
                      {EV_SHORT[ev.type] ?? ev.type}{ev.label ? ` ${ev.label}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {LEGEND.map(({ type, label }) => (
            <span key={type} className={`text-[9px] font-semibold px-2 py-0.5 rounded ${EV_COLOR[type]}`}>
              {EV_SHORT[type]} — {label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // ── Mes view ───────────────────────────────────────────────────────────────

  const renderMesView = () => {
    if (!activeMes) return null;
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div>
            {editingMeta==='mes' ? (
              <div className="flex gap-2 items-center">
                <input autoFocus className="text-lg font-bold border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-400" value={metaForm} onChange={e=>setMetaForm(e.target.value)}/>
                <button onClick={()=>{ updateActiveMes(m=>({...m,mesLabel:metaForm})); setEditingMeta(null); }} className="p-1.5 bg-blue-600 text-white rounded-lg"><Check size={13}/></button>
                <button onClick={()=>setEditingMeta(null)} className="p-1.5 border border-slate-200 rounded-lg text-slate-500"><X size={13}/></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">Programación de Actividades · {activeMes.mesLabel}</h3>
                {canEdit && <button onClick={()=>{ setEditingMeta('mes'); setMetaForm(activeMes.mesLabel); }} className="text-slate-300 hover:text-blue-500 p-1 rounded transition-colors"><Pencil size={13}/></button>}
              </div>
            )}
            {editingMeta==='lider' ? (
              <div className="flex gap-2 items-center mt-1">
                <input autoFocus className="text-sm border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-400" value={metaForm} onChange={e=>setMetaForm(e.target.value)}/>
                <button onClick={()=>{ updateActiveMes(m=>({...m,liderCargo:metaForm})); setEditingMeta(null); }} className="p-1.5 bg-blue-600 text-white rounded-lg"><Check size={13}/></button>
                <button onClick={()=>setEditingMeta(null)} className="p-1.5 border border-slate-200 rounded-lg text-slate-500"><X size={13}/></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-slate-500">Líder a cargo: <strong className="text-slate-700">{activeMes.liderCargo}</strong></p>
                {canEdit && <button onClick={()=>{ setEditingMeta('lider'); setMetaForm(activeMes.liderCargo); }} className="text-slate-300 hover:text-blue-500 p-0.5 rounded transition-colors"><Pencil size={11}/></button>}
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temas a tratar en prédicas del mes</p>
              {canEdit && !showAddTema && <button onClick={()=>setShowAddTema(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Plus size={11}/> Agregar</button>}
            </div>
            <div className="space-y-1">
              {activeMes.temasMes.map((t,i) =>
                editingTemaIdx===i ? (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-xs font-bold text-slate-400 w-5 text-right">{i+1}.</span>
                    <input autoFocus className="flex-1 text-sm border border-slate-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:border-blue-400" value={editTema} onChange={e=>setEditTema(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') saveTema(i); if(e.key==='Escape') setEditingTemaIdx(null); }}/>
                    <button onClick={()=>saveTema(i)} className="p-1.5 bg-blue-600 text-white rounded-lg"><Check size={12}/></button>
                    <button onClick={()=>setEditingTemaIdx(null)} className="p-1.5 border border-slate-200 rounded-lg text-slate-500"><X size={12}/></button>
                  </div>
                ) : (
                  <div key={i} className="flex items-center gap-2 group py-0.5">
                    <span className="text-xs font-bold text-slate-400 w-5 text-right">{i+1}.</span>
                    <span className="text-sm text-slate-700 flex-1">{t}</span>
                    {canEdit && <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={()=>{ setEditingTemaIdx(i); setEditTema(t); }} className="p-1 text-slate-300 hover:text-blue-500 rounded"><Pencil size={11}/></button>
                      <button onClick={()=>deleteTema(i)} className="p-1 text-slate-300 hover:text-red-500 rounded"><Trash2 size={11}/></button>
                    </div>}
                  </div>
                )
              )}
              {showAddTema && (
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right">{activeMes.temasMes.length+1}.</span>
                  <input autoFocus className="flex-1 text-sm border border-slate-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:border-blue-400" placeholder="Nuevo tema" value={newTema} onChange={e=>setNewTema(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') addTema(); if(e.key==='Escape') setShowAddTema(false); }}/>
                  <button onClick={addTema} className="p-1.5 bg-blue-600 text-white rounded-lg"><Check size={12}/></button>
                  <button onClick={()=>setShowAddTema(false)} className="p-1.5 border border-slate-200 rounded-lg text-slate-500"><X size={12}/></button>
                </div>
              )}
            </div>
          </div>
        </div>
        {renderCalendarioMes()}
        {renderPrograSection('viernes',   'Viernes de Ministración y Oración',        activeMes.viernes    as unknown as Record<string,string>[])}
        {renderPrograSection('domingos',  'Servicio Dominical — Oración de Apertura', activeMes.domingos   as unknown as Record<string,string>[])}
        {renderPrograSection('especiales','Servicios Especiales / Ad-hoc',            (activeMes.especiales??[]) as unknown as Record<string,string>[])}
        {renderPrograSection('evangelismos','Jornadas de Evangelismo',                 (activeMes.evangelismos ?? []) as unknown as Record<string,string>[])}
        {renderPrograSection('ayunos',    'Ayunos',                                   activeMes.ayunos     as unknown as Record<string,string>[])}
        {renderPrograSection('eventos',   'Eventos del Mes',                          activeMes.eventos    as unknown as Record<string,string>[])}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Programa del Mes — Servicios TAFE</h2>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            Plantilla base para Easy Worship · visible para todo el equipo
            {!canEdit && <span className="inline-flex items-center gap-1 text-slate-400 text-xs"><Lock size={11}/> Solo lectura</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncStatus === 'loading' && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg">
              <Loader2 size={11} className="animate-spin"/> Cargando...
            </span>
          )}
          {syncStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
              <Loader2 size={11} className="animate-spin"/> Guardando...
            </span>
          )}
          {syncStatus === 'synced' && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
              <RefreshCw size={11}/> Sincronizado
            </span>
          )}
          {syncStatus === 'local' && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg" title="Sin conexión a Airtable — los cambios se guardan solo en este dispositivo">
              <Lock size={11}/> Solo local
            </span>
          )}
        </div>
      </div>
      {renderMonthSwitcher()}
      {renderDateSelector()}
      {activeView === 'mes' ? renderMesView() : renderServicioView()}
    </div>
  );
};

export default OrdenDelDia;
