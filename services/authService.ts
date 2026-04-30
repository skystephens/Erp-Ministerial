import { UserRole, ApostolicAxis, User } from '../types';

export interface AuthSession {
  userId: string;
  name: string;
  role: UserRole;
  ministry?: string;
  axis?: ApostolicAxis;
  loginTime: string;
}

const SESSION_KEY = 'tafe_session';

// Cuentas demo — funcionan sin Airtable (para desarrollo y pruebas)
const DEMO_ACCOUNTS: (Omit<AuthSession, 'loginTime'> & { username: string; password: string })[] = [
  {
    username: 'pastor',
    password: 'tafe2026',
    userId: 'u_pastor',
    name: 'Pr. David Lever',
    role: UserRole.SUPER_ADMIN,
  },
  {
    username: 'david',
    password: 'tafe2026',
    userId: 'u_pastor',
    name: 'Pr. David Lever',
    role: UserRole.SUPER_ADMIN,
  },
  {
    username: 'liseth',
    password: 'tafe2026',
    userId: 'u_liseth',
    name: 'Liseth Lever',
    role: UserRole.SUPERVISORA,
    axis: 'E5_ALABANZA_AV',
  },
  {
    username: 'martha',
    password: 'tafe2026',
    userId: 'u_martha',
    name: 'Martha Porras',
    role: UserRole.SUPERVISORA,
    axis: 'E1_EVANGELISMO',
  },
  {
    username: 'sky',
    password: 'tafe2026',
    userId: 'u_sky',
    name: 'Sky Stephens',
    role: UserRole.LIDER_MINISTERIO,
    ministry: 'CSI / Medios',
    axis: 'E5_ALABANZA_AV',
  },
  {
    username: 'dario',
    password: 'tafe2026',
    userId: 'u_dario',
    name: 'Dario Muñoz',
    role: UserRole.LIDER_MINISTERIO,
    ministry: 'Consolidación',
    axis: 'E3_CONSOLIDACION',
  },
  {
    username: 'miembro',
    password: 'tafe2026',
    userId: 'u_miembro',
    name: 'Miembro Demo',
    role: UserRole.MIEMBRO,
    ministry: 'CSI / Medios',
  },
];

export const attemptLogin = (username: string, password: string): AuthSession | null => {
  const account = DEMO_ACCOUNTS.find(
    a =>
      a.username.toLowerCase() === username.toLowerCase().trim() &&
      a.password === password.trim()
  );
  if (!account) return null;

  const session: AuthSession = {
    userId: account.userId,
    name: account.name,
    role: account.role,
    ministry: account.ministry,
    axis: account.axis,
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const quickLogin = (role: UserRole): AuthSession => {
  const defaults: Record<string, Omit<AuthSession, 'loginTime'>> = {
    [UserRole.SUPER_ADMIN]: {
      userId: 'u_pastor',
      name: 'Pr. David Lever',
      role: UserRole.SUPER_ADMIN,
    },
    [UserRole.SUPERVISORA]: {
      userId: 'u_liseth',
      name: 'Liseth Lever',
      role: UserRole.SUPERVISORA,
      axis: 'E5_ALABANZA_AV' as ApostolicAxis,
    },
    [UserRole.LIDER_MINISTERIO]: {
      userId: 'u_sky',
      name: 'Sky Stephens',
      role: UserRole.LIDER_MINISTERIO,
      ministry: 'CSI / Medios',
      axis: 'E5_ALABANZA_AV' as ApostolicAxis,
    },
    [UserRole.MIEMBRO]: {
      userId: 'u_miembro',
      name: 'Miembro Demo',
      role: UserRole.MIEMBRO,
      ministry: 'CSI / Medios',
    },
  };

  const base = defaults[role as string] ?? defaults[UserRole.MIEMBRO];
  const session: AuthSession = { ...base, loginTime: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const getStoredSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const sessionToUser = (session: AuthSession): User => ({
  id: session.userId,
  name: session.name,
  role: session.role,
  status: 'APPROVED',
  ministry: session.ministry,
  axis: session.axis,
  skills: [],
  contact: '',
  joinedDate: '',
  complianceRate: 100,
  timeBankBalance: 0,
  socialValueGenerated: 0,
  relationships: [],
  dataDepth: 'DEEP',
  isBaptized: true,
  isRegularAttendee: true,
  completedBasicStudies: true,
  leadershipLevel:
    session.role === UserRole.SUPER_ADMIN ? 4 :
    session.role === UserRole.SUPERVISORA ? 3 :
    session.role === UserRole.LIDER_MINISTERIO ? 2 : 1,
  accessLevel:
    session.role === UserRole.SUPER_ADMIN ? 'GLOBAL' :
    session.role === UserRole.SUPERVISORA ? 'AXIS' : 'MINISTERIAL',
});
