
import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  HeartHandshake,
  ShieldCheck,
  CalendarDays,
  Layers,
  Inbox,
  MonitorPlay,
  BarChart3,
  Newspaper,
  MonitorSpeaker,
  Building2,
  UsersRound,
} from 'lucide-react';
import { ApostolicAxis, UserRole } from './types';

export const COLORS = {
  navy: '#004182',
  turqui: '#49D1C5',
  white: '#FFFFFF',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
};

export const SERVICE_SCHEDULES = [
  { id: 'v_pm', day: 'Viernes', time: '19:30', label: 'Servicio de Enseñanza', ministry: 'Medios' },
  { id: 'd_am1', day: 'Domingo', time: '07:30', label: '1er Servicio (Setup)', ministry: 'Medios' },
  { id: 'd_am2', day: 'Domingo', time: '10:30', label: '2do Servicio (Operación)', ministry: 'Medios' }
];

export const MEDIA_STRATEGY_PROJECTS = [
  {
    id: 'p_evangelismo_field',
    name: 'Cobertura de Campo: E1',
    description: 'Captura de testimonios y fotos en la jornada de evangelismo.',
    roles: ['Fotógrafo', 'Videógrafo', 'Asistente de campo'],
    impactAxis: 'E1_EVANGELISMO'
  },
  {
    id: 'p_social_impact',
    name: 'Diseño Impacto Redes',
    description: 'Creación de la pieza visual de la cosecha de la semana.',
    roles: ['Diseñador Gráfico', 'Copywriter'],
    impactAxis: 'E5_ALABANZA_AV'
  },
  {
    id: 'p_data_bridge',
    name: 'Mapeo y Puente de Datos',
    description: 'Digitalización de prospectos para Consolidación (E3).',
    roles: ['Data Entry', 'Supervisor de Datos'],
    impactAxis: 'E3_CONSOLIDACION'
  }
];

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

export interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'sec_medios',
    label: 'Medios & Comunicaciones',
    icon: <MonitorSpeaker size={16} />,
    items: [
      { id: 'media_strategy', label: 'Estrategia Medios', icon: <BarChart3 size={18} />, roles: [UserRole.SUPER_ADMIN, UserRole.SUPERVISORA, UserRole.LIDER_MINISTERIO] },
      { id: 'content_manager', label: 'Gestor Contenidos', icon: <Newspaper size={18} /> },
      { id: 'operations', label: 'Tareas de Medios', icon: <Briefcase size={18} /> },
    ],
  },
  {
    id: 'sec_ministerial',
    label: 'Gestión Ministerial',
    icon: <Building2 size={16} />,
    items: [
      { id: 'ministry_panel', label: 'Panel Ministerial', icon: <MonitorPlay size={18} />, roles: [UserRole.SUPER_ADMIN, UserRole.SUPERVISORA, UserRole.LIDER_MINISTERIO] },
      { id: 'projects', label: 'Plan TAFE (Ejes)', icon: <Layers size={18} /> },
      { id: 'timebank', label: 'Banco de Tiempo', icon: <HeartHandshake size={18} /> },
      { id: 'calendar', label: 'Calendario 2026', icon: <CalendarDays size={18} /> },
    ],
  },
  {
    id: 'sec_personas',
    label: 'Personas',
    icon: <UsersRound size={16} />,
    items: [
      { id: 'directory', label: 'Directorio', icon: <Users size={18} />, roles: [UserRole.SUPER_ADMIN, UserRole.SUPERVISORA, UserRole.LIDER_MINISTERIO] },
      { id: 'pastoral_inbox', label: 'Buzón Pastoral', icon: <Inbox size={18} /> },
    ],
  },
  {
    id: 'sec_admin',
    label: 'Administración',
    icon: <ShieldCheck size={16} />,
    roles: [UserRole.SUPER_ADMIN],
    items: [
      { id: 'admin_mgmt', label: 'Gestión / Capas', icon: <ShieldCheck size={18} /> },
    ],
  },
];

// Kept for backward compatibility — flat list derived from sections
export const NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

export const MINISTRIES = [
  "CSI / Medios",
  "Alabanza",
  "Consolidación",
  "Anfitriones",
  "Evangelismo",
  "Células",
  "Intercesión"
];

export const MINISTRY_DETAILS: Record<string, { specialties: string[], checklists: string[] }> = {
  "CSI / Medios": {
    specialties: ["Diseño Gráfico", "Edición Video", "Sonido Live", "Iluminación DMX", "Streaming", "Copywriting"],
    checklists: [
      "Soundcheck 60min antes",
      "Prueba de latencia Streaming",
      "Setup de letras en pantallas",
      "Verificación de micrófonos inalámbricos",
      "Grabación de TAFE News",
      "Backup de diapositivas de mensaje"
    ]
  },
  "Alabanza": {
    specialties: ["Vocal", "Instrumental", "Arreglos"],
    checklists: ["Ensayo general", "Afinación", "Momento de oración previo"]
  }
};

export const MINISTRY_HIERARCHY = [
  { 
    pastora: "Guillermina Martinez", 
    axis: "E3_CONSOLIDACION" as const,
    role: "SUPERVISORA",
    ministries: [
      { name: "Consolidación", leader: "Dario muñoz" },
      { name: "Anfitriones", leader: "yinis rodriguez" }
    ] 
  },
  { 
    pastora: "Liseth Lever", 
    axis: "E5_ALABANZA_AV" as const,
    role: "SUPERVISORA",
    ministries: [
      { name: "CSI / Medios", leader: "Sky Stephens" },
      { name: "Alabanza", leader: "Liseth lever" }
    ] 
  }
];

export const AXIS_SCHEMA: Record<ApostolicAxis, any> = {
  E1_EVANGELISMO: { 
    label: 'E1: Evangelismo', 
    status: 'Activo - Conquista', 
    progress: 85, 
    color: 'bg-turqui',
    function: 'Conquistar nuevas almas para el Reino',
    responsibilities: [
      { name: 'Brigadas de Impacto', actions: ['Mapeo de zonas', 'Evangelismo callejero'] }
    ]
  },
  E2_INTERCESION: { 
    label: 'E2: Intercesión', 
    status: 'Sosteniendo - Ayuno', 
    progress: 100, 
    color: 'bg-navy-tafe',
    function: 'Cobertura espiritual de la iglesia',
    responsibilities: [
      { name: 'Vigilias', actions: ['Organización de turnos', 'Temas de oración'] }
    ]
  },
  E3_CONSOLIDACION: { 
    label: 'E3: Consolidación', 
    status: 'Reteniendo Fruto', 
    progress: 40, 
    color: 'bg-emerald-500',
    function: 'Cuidado y retención del nuevo creyente',
    responsibilities: [
      { name: 'Seguimiento', actions: ['Llamadas de bienvenida', 'Visitas'] }
    ]
  },
  E4_INFANCIA_DANZA: { 
    label: 'E4: Danza & Niños', 
    status: 'Generacional', 
    progress: 60, 
    color: 'bg-pink-500',
    function: 'Formación de la nueva generación',
    responsibilities: [
      { name: 'Escuela Dominical', actions: ['Material didáctico', 'Ensayos de danza'] }
    ]
  },
  E5_ALABANZA_AV: { 
    label: 'E5: Alabanza & AV', 
    status: 'Atmósfera Espiritual', 
    progress: 90, 
    color: 'bg-blue-500',
    function: 'Creación de atmósferas de adoración',
    responsibilities: [
      { name: 'Producción Técnica', actions: ['Setup de sonido', 'Streaming'] }
    ]
  },
  E6_SOCIAL_CUIDADO: { 
    label: 'E6: Social & Saneamiento', 
    status: 'Restauración', 
    progress: 30, 
    color: 'bg-amber-500',
    function: 'Impacto social y ayuda al necesitado',
    responsibilities: [
      { name: 'Banco de Tiempo', actions: ['Gestión de talentos', 'Ayuda social'] }
    ]
  },
  E7_JOVENES: { 
    label: 'E7: Jóvenes', 
    status: 'Continuidad', 
    progress: 55, 
    color: 'bg-indigo-500',
    function: 'Pastoreo de la juventud',
    responsibilities: [
      { name: 'Eventos Elohim', actions: ['Planificación de campamentos', 'Vigilias jóvenes'] }
    ]
  },
};

export const SERVICE_CATEGORIES = [
  { id: 'TECNICO', label: 'Técnico', icon: '🛠️' },
  { id: 'LEGAL', label: 'Legal/Contable', icon: '⚖️' },
  { id: 'EDUCACION', label: 'Educación', icon: '📚' },
  { id: 'SALUD', label: 'Salud', icon: '🩺' },
];
