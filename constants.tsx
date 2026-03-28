
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
  Flame,
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
      { id: 'grupos', label: 'Grupos & Células', icon: <Flame size={18} /> },
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
    label: 'E1: Evangelismo y Células',
    status: 'Activo - Conquista',
    progress: 85,
    color: 'bg-turqui',
    function: 'Conquistar nuevas almas para el Reino y formarlas en células',
    responsibilities: [
      { name: 'Brigadas de Impacto', actions: ['Mapeo de zonas', 'Evangelismo callejero'] },
      { name: 'Células', actions: ['Reuniones semanales', 'Seguimiento de nuevos'] }
    ]
  },
  E2_INTERCESION: {
    label: 'E2: Intercesión y Formación Bíblica',
    status: 'Sosteniendo - Ayuno',
    progress: 100,
    color: 'bg-navy-tafe',
    function: 'Cobertura espiritual de la iglesia y formación en la Palabra',
    responsibilities: [
      { name: 'Vigilias', actions: ['Organización de turnos', 'Temas de oración'] },
      { name: 'Formación Bíblica', actions: ['Estudios bíblicos', 'Escuelas de la Palabra'] }
    ]
  },
  E3_CONSOLIDACION: {
    label: 'E3: Consolidación, Anfitriones y Guardianes',
    status: 'Reteniendo Fruto',
    progress: 40,
    color: 'bg-emerald-500',
    function: 'Cuidado, retención y protección del nuevo creyente',
    responsibilities: [
      { name: 'Consolidación', actions: ['Llamadas de bienvenida', 'Visitas pastorales'] },
      { name: 'Anfitriones', actions: ['Recepción en cultos', 'Atención al visitante'] },
      { name: 'Guardianes', actions: ['Seguridad y orden', 'Protección del templo'] }
    ]
  },
  E4_INFANCIA_DANZA: {
    label: 'E4: Danza y Escuela Infantil AMO',
    status: 'Generacional',
    progress: 60,
    color: 'bg-pink-500',
    function: 'Formación espiritual de niños y expresión artística para Dios',
    responsibilities: [
      { name: 'Escuela Infantil AMO', actions: ['Clases dominicales', 'Material didáctico'] },
      { name: 'Danza', actions: ['Ensayos semanales', 'Presentaciones en cultos'] }
    ]
  },
  E5_ALABANZA_AV: {
    label: 'E5: Medios y Alabanza',
    status: 'Atmósfera Espiritual',
    progress: 90,
    color: 'bg-blue-500',
    function: 'Comunicaciones, producción audiovisual y adoración',
    responsibilities: [
      { name: 'CSI / Medios', actions: ['Setup de sonido', 'Streaming', 'Diseño', 'Redes sociales'] },
      { name: 'Alabanza', actions: ['Dirección de adoración', 'Ensayos', 'Producción musical'] }
    ]
  },
  E6_SOCIAL_CUIDADO: {
    label: 'E6: Atención Social y Cuidado Pastoral',
    status: 'Restauración',
    progress: 30,
    color: 'bg-amber-500',
    function: 'Impacto social, ayuda al necesitado y cuidado de la congregación',
    responsibilities: [
      { name: 'Atención Social', actions: ['Gestión de ayudas', 'Banco de Tiempo'] },
      { name: 'Cuidado Pastoral', actions: ['Visitas a enfermos', 'Acompañamiento familiar'] }
    ]
  },
  E7_JOVENES: {
    label: 'E7: Adolescentes Oasis y Adultos Jóvenes Generación de Joel',
    status: 'Continuidad',
    progress: 55,
    color: 'bg-indigo-500',
    function: 'Pastoreo integral de adolescentes y jóvenes adultos',
    responsibilities: [
      { name: 'Adolescentes Oasis', actions: ['Reunión semanal sábados', 'Discipulado adolescente'] },
      { name: 'Generación de Joel', actions: ['Jóvenes adultos', 'Liderazgo emergente'] }
    ]
  },
};

export const SERVICE_CATEGORIES = [
  { id: 'TECNICO', label: 'Técnico', icon: '🛠️' },
  { id: 'LEGAL', label: 'Legal/Contable', icon: '⚖️' },
  { id: 'EDUCACION', label: 'Educación', icon: '📚' },
  { id: 'SALUD', label: 'Salud', icon: '🩺' },
];
