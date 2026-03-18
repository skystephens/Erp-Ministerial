
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPERVISORA = 'SUPERVISORA', 
  LIDER_MINISTERIO = 'LIDER_MINISTERIO',
  MIEMBRO = 'MIEMBRO',
  PROSPECTO = 'PROSPECTO'
}

export type ApostolicAxis = 
  | 'E1_EVANGELISMO' 
  | 'E2_INTERCESION' 
  | 'E3_CONSOLIDACION' 
  | 'E4_INFANCIA_DANZA' 
  | 'E5_ALABANZA_AV' 
  | 'E6_SOCIAL_CUIDADO' 
  | 'E7_JOVENES';

export type UserStatus = 'PENDING_ONBOARDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

/**
 * Fix for error in components/Directory.tsx: Module '"../types"' has no exported member 'RelationshipType'.
 */
export type RelationshipType = 'CONYUGE' | 'HIJO' | 'PADRE' | 'MADRE' | 'OTRO';

export interface Relationship {
  targetId: string;
  targetName: string;
  type: RelationshipType | string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  ministry?: string;
  pastorInCharge?: string;
  axis?: ApostolicAxis;
  skills: string[];
  contact: string;
  joinedDate: string;
  complianceRate: number;
  timeBankBalance: number;
  socialValueGenerated: number; 
  authorizedMinistries?: string[]; 
  assignedMinistries?: string[];
  accessLevel: 'MINISTERIAL' | 'AXIS' | 'GLOBAL';
  relationships: Relationship[];
  dataDepth: 'INITIAL' | 'DEEP';
  isBaptized: boolean;
  isRegularAttendee: boolean;
  completedBasicStudies: boolean;
  leadershipLevel: number;
  spiritualStatus?: 'CONSOLIDADO' | 'DISCIPULO' | 'NUEVO_CREYENTE' | 'PROSPECTO';
  phone?: string;
  address?: string;
  age?: number;
  originGroup?: string;
  hasChildren?: boolean;
  prayerRequests?: string;
  /**
   * Fix for error in App.tsx: 'motivation' does not exist in type 'User'.
   */
  motivation?: string;
  /**
   * Fix for error in components/Directory.tsx: 'gender' does not exist in type 'User'.
   */
  gender?: string;
  employmentStatus?: string;
  geoPosition?: { lat: number; lng: number };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  ministry: string;
  assignedTo: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'INVITED';
  category: 'DISEÑO' | 'TECNICO' | 'CONTENIDO' | 'LOGISTICA' | 'MENSAJE' | 'TAFE_NEWS';
  isUrgent?: boolean;
  axis?: ApostolicAxis;
  requiredSkill?: string;
  
  // Metadatos de Estrategia
  teamSizeRequired?: number;
  estimatedHours?: number;
  priority?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}

export interface PrayerRequest {
  id: string;
  authorId: string;
  authorName: string;
  category: 'ESPIRITUAL' | 'SALUD' | 'FAMILIAR' | 'FINANCIERO' | 'CONFESION';
  urgency: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  content: string;
  date: string;
  status: 'PENDING' | 'UNDER_PRAYER' | 'INTERVENTION_REQUIRED' | 'RESOLVED';
}

/**
 * Fix for error in components/TimeBank.tsx: Module '"../types"' has no exported member 'TimeBankOffer'.
 */
export interface TimeBankOffer {
  id: string;
  userId: string;
  userName: string;
  talent: string;
  description: string;
  availability: string;
  category: string;
}

/**
 * Fix for error in components/CalendarView.tsx: Module '"../types"' has no exported member 'CalendarEvent'.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  status: 'CONFIRMED' | 'TENTATIVE' | 'PENDING';
  ministry: string;
  type: string;
  axis: ApostolicAxis;
}
