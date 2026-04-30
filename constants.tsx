
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
  ClipboardList,
  UserCheck,
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
      { id: 'ministry_panel', label: 'Panel Medios', icon: <MonitorPlay size={18} />, roles: [UserRole.SUPER_ADMIN, UserRole.SUPERVISORA, UserRole.LIDER_MINISTERIO] },
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
      { id: 'timebank', label: 'Banco de Tiempo', icon: <HeartHandshake size={18} /> },
      { id: 'calendar', label: 'Calendario 2026', icon: <CalendarDays size={18} /> },
      { id: 'asistencia', label: 'Asistencia', icon: <ClipboardList size={18} /> },
    ],
  },
  {
    id: 'sec_personas',
    label: 'Personas',
    icon: <UsersRound size={16} />,
    items: [
      { id: 'grupos', label: 'Grupos & Células', icon: <Flame size={18} /> },
      { id: 'directory', label: 'Directorio', icon: <Users size={18} />, roles: [UserRole.SUPER_ADMIN, UserRole.SUPERVISORA, UserRole.LIDER_MINISTERIO] },
      { id: 'crm_seguimiento', label: 'CRM Seguimiento', icon: <UserCheck size={18} />, roles: [UserRole.SUPER_ADMIN, UserRole.SUPERVISORA, UserRole.LIDER_MINISTERIO] },
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
      { id: 'projects', label: 'Plan TAFE — 7 Ejes', icon: <Layers size={18} />, roles: [UserRole.SUPER_ADMIN] },
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

export const PASTORA_PRINCIPAL = {
  name: "Martha Porras",
  role: "COORDINADORA_GENERAL",
  note: "Coordinadora General del Proyecto Evangelístico. Supervisa los 7 ejes. También lidera E1.",
};

export const PASTOR_PRINCIPAL = {
  name: "Pr. Lancelot Lever",
  role: "PASTOR_PRINCIPAL",
};

export const MINISTRY_HIERARCHY = [
  {
    pastora: "Martha Porras",
    axis: "E1_EVANGELISMO" as const,
    role: "SUPERVISORA",
    ministries: [
      { name: "Evangelismo", leader: "Martha Porras" },
      { name: "Células", leader: "Por definir" },
    ]
  },
  {
    pastora: "María Mónica Bujato",
    axis: "E2_INTERCESION" as const,
    role: "SUPERVISORA",
    ministries: [
      { name: "Intercesión", leader: "María Mónica Bujato" },
      { name: "Formación Bíblica", leader: "Por definir" },
    ]
  },
  {
    pastora: "Guillermina Martínez",
    axis: "E3_CONSOLIDACION" as const,
    role: "SUPERVISORA",
    ministries: [
      { name: "Consolidación", leader: "Dario Muñoz" },
      { name: "Anfitriones", leader: "Yinis Rodriguez" },
      { name: "Guardianes", leader: "Por definir" },
    ]
  },
  {
    pastora: "Claudia de la Oz",
    axis: "E4_INFANCIA_DANZA" as const,
    role: "SUPERVISORA",
    ministries: [
      { name: "Danza", leader: "Por definir" },
      { name: "Escuela Infantil AMO", leader: "Por definir" },
    ]
  },
  {
    pastora: "Liseth Lever",
    axis: "E5_ALABANZA_AV" as const,
    role: "SUPERVISORA",
    ministries: [
      { name: "CSI / Medios", leader: "Sky Stephens" },
      { name: "Alabanza", leader: "Liseth Lever" },
    ]
  },
  {
    pastora: "Luz Elena Pretel",
    axis: "E6_SOCIAL_CUIDADO" as const,
    role: "SUPERVISORA",
    ministries: [
      { name: "Atención Social", leader: "Por definir" },
      { name: "Cuidado Pastoral", leader: "Por definir" },
    ]
  },
  {
    pastora: "Zuleima Sandoval",
    axis: "E7_JOVENES" as const,
    role: "SUPERVISORA",
    ministries: [
      { name: "Adolescentes Oasis", leader: "Por definir" },
      { name: "Generación de Joel", leader: "Por definir" },
    ]
  },
];

export const AXIS_SCHEMA: Record<ApostolicAxis, any> = {
  E1_EVANGELISMO: {
    label: 'E1: Evangelismo y Células',
    pastora: 'Martha Porras',
    status: 'Puerta de entrada al Reino',
    progress: 85,
    color: 'bg-turqui',
    function: 'Conquistar nuevas almas, integrarlas en células y acompañarlas hasta la consolidación',
    responsibilities: [
      { name: 'Brigadas de Evangelismo', actions: ['Salidas de campo semanales', 'Mapeo de zonas y sectores', 'Registro digital de prospectos', 'Coordinación con E3 para entrega de nuevos'] },
      { name: 'Grupos Celulares', actions: ['Reuniones semanales en hogares', 'Seguimiento de asistencia', 'Prédica semanal del líder', 'Reportes al eje'] },
    ]
  },
  E2_INTERCESION: {
    label: 'E2: Intercesión y Formación Bíblica',
    pastora: 'María Mónica Bujato',
    status: 'Motor espiritual del proyecto',
    progress: 100,
    color: 'bg-navy-tafe',
    function: 'Sostener espiritualmente toda la operación de la iglesia y formar a la congregación en la Palabra',
    responsibilities: [
      { name: 'Intercesión', actions: ['Vigilia semanal de madrugada', 'Cadenas de ayuno', 'Cobertura espiritual de eventos', 'Oración por ministerios y pastoras'] },
      { name: 'Formación Bíblica', actions: ['Escuela "Nueva Vida en Cristo"', 'Estudio "Afirmando los Pasos"', 'Escuela de Liderazgo (miércoles)', 'Seguimiento de matrículas y progreso'] },
    ]
  },
  E3_CONSOLIDACION: {
    label: 'E3: Consolidación, Anfitriones y Guardianes',
    pastora: 'Guillermina Martínez',
    status: 'Reteniendo el fruto',
    progress: 40,
    color: 'bg-emerald-500',
    function: 'Retener lo que el evangelismo alcanza: recibir, acompañar y proteger al nuevo creyente',
    responsibilities: [
      { name: 'Consolidación', actions: ['Llamadas de bienvenida (24–48h)', 'Visitas pastorales a hogares', 'Integración al grupo de nuevos (domingo)', 'Seguimiento hasta la célula'] },
      { name: 'Anfitriones', actions: ['Recepción en puerta cada culto', 'Atención al visitante y nuevo', 'Orientación en el templo', 'Reporte de asistencia'] },
      { name: 'Guardianes', actions: ['Seguridad y orden en el templo', 'Protección de eventos', 'Coordinación con liderazgo'] },
    ]
  },
  E4_INFANCIA_DANZA: {
    label: 'E4: Danza y Escuela Infantil AMO',
    pastora: 'Claudia de la Oz',
    status: 'Formación generacional',
    progress: 60,
    color: 'bg-pink-500',
    function: 'Ministrar a través de la danza profética y formar espiritualmente a la niñez',
    responsibilities: [
      { name: 'Danza Profética', actions: ['Ensayos semanales', 'Presentaciones en cultos dominicales', 'Coreografías para eventos especiales', 'Formación en adoración corporal'] },
      { name: 'Escuela Infantil AMO', actions: ['Clase dominical paralela al culto', 'Material didáctico por edades', 'Actividades de integración familiar', 'Registro de asistencia de niños'] },
    ]
  },
  E5_ALABANZA_AV: {
    label: 'E5: Medios y Alabanza',
    pastora: 'Liseth Lever',
    status: 'Atmósfera espiritual y amplificación',
    progress: 90,
    color: 'bg-blue-500',
    function: 'Establecer atmósfera de adoración y amplificar el mensaje de la iglesia hacia adentro y hacia afuera',
    responsibilities: [
      { name: 'CSI / Medios', actions: ['Setup de sonido e iluminación', 'Streaming en vivo', 'Diseño gráfico y comunicaciones', 'Redes sociales y contenido digital', 'TAFE News semanal'] },
      { name: 'Alabanza', actions: ['Dirección de adoración en cultos', 'Ensayos semanales', 'Producción musical', 'Preparación de letras y visuales'] },
    ]
  },
  E6_SOCIAL_CUIDADO: {
    label: 'E6: Atención Social y Cuidado Pastoral',
    pastora: 'Luz Elena Pretel',
    status: 'Sanando y sosteniendo familias',
    progress: 30,
    color: 'bg-amber-500',
    function: 'Sanar, acompañar y sostener a las familias alcanzadas por el evangelio',
    responsibilities: [
      { name: 'Atención Social', actions: ['Banco de Tiempo — gestión de talentos', 'Ayudas materiales a familias en necesidad', 'Coordinación con entidades externas', 'Registro de intervenciones'] },
      { name: 'Cuidado Pastoral', actions: ['Visitas a enfermos y hospitalizados', 'Acompañamiento en duelo y crisis familiar', 'Consejería pastoral', 'Seguimiento post-crisis'] },
    ]
  },
  E7_JOVENES: {
    label: 'E7: Adolescentes Oasis y Adultos Jóvenes Generación de Joel',
    pastora: 'Zuleima Sandoval',
    status: 'Continuidad generacional del Reino',
    progress: 55,
    color: 'bg-indigo-500',
    function: 'Pastorear integralmente a adolescentes y adultos jóvenes para que hereden y multipliquen el Reino',
    responsibilities: [
      { name: 'Adolescentes Oasis', actions: ['Reunión semanal sábados 14:00', 'Discipulado y mentoría', 'Actividades de integración juvenil', 'Seguimiento individual'] },
      { name: 'Adultos Jóvenes — Generación de Joel', actions: ['Reunión semanal sábados 16:00', 'Formación en liderazgo emergente', 'Activación en ministerios', 'Proyectos de impacto generacional'] },
    ]
  },
};

export const SERVICE_CATEGORIES = [
  { id: 'TECNICO', label: 'Técnico', icon: '🛠️' },
  { id: 'LEGAL', label: 'Legal/Contable', icon: '⚖️' },
  { id: 'EDUCACION', label: 'Educación', icon: '📚' },
  { id: 'SALUD', label: 'Salud', icon: '🩺' },
];
