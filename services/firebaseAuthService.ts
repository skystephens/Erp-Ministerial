import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { UserRole, ApostolicAxis } from '../types';
import { AuthSession } from './authService';

// ─── Airtable helpers ─────────────────────────────────────────────────────────

const BASE_ID  = 'appB689oQuHCzcgXH';
const TABLE    = encodeURIComponent('[DB] Miembros');

const airtableHeaders = () => ({
  Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY as string}`,
  'Content-Type': 'application/json',
});

type AirtableMiembro = {
  ID_Miembro?: string;
  Nombre_Completo?: string;
  Rol?: string;
  Ministerio_ID?: string;
  Eje_ID?: string;
  Email?: string;
  Firebase_UID?: string;
};

type AirtableRecord = { id: string; fields: AirtableMiembro };

async function fetchMiembros(formula: string): Promise<AirtableRecord[]> {
  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE}?filterByFormula=${encodeURIComponent(formula)}`;
    const res  = await fetch(url, { headers: airtableHeaders() });
    const data = await res.json();
    if (data.error) console.warn('[Airtable] fetchMiembros error:', data.error, data.message);
    return (data.records ?? []) as AirtableRecord[];
  } catch (e) {
    console.error('[Airtable] fetchMiembros failed:', e);
    return [];
  }
}

async function patchMiembro(recordId: string, fields: Partial<AirtableMiembro>) {
  try {
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE}/${recordId}`, {
      method: 'PATCH',
      headers: airtableHeaders(),
      body: JSON.stringify({ fields }),
    });
    const data = await res.json();
    if (data.error) console.warn('[Airtable] patchMiembro error:', data.error, data.message);
  } catch (e) {
    console.error('[Airtable] patchMiembro failed:', e);
  }
}

async function createMiembro(fields: AirtableMiembro): Promise<AirtableRecord | null> {
  try {
    const res  = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE}`, {
      method: 'POST',
      headers: airtableHeaders(),
      body: JSON.stringify({ fields }),
    });
    const data = await res.json();
    if (data.error) {
      console.warn('[Airtable] createMiembro error:', data.error, data.message);
      return null;
    }
    return data as AirtableRecord;
  } catch (e) {
    console.error('[Airtable] createMiembro failed:', e);
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rolToUserRole(rol?: string): UserRole {
  switch (rol) {
    case 'SUPER_ADMIN':       return UserRole.SUPER_ADMIN;
    case 'SUPERVISORA':       return UserRole.SUPERVISORA;
    case 'LIDER_MINISTERIO':  return UserRole.LIDER_MINISTERIO;
    case 'MIEMBRO':           return UserRole.MIEMBRO;
    default:                  return UserRole.PROSPECTO;
  }
}

function buildSession(firebaseUser: FirebaseUser, record?: AirtableRecord): AuthSession {
  const f = record?.fields;
  return {
    userId:    firebaseUser.uid,
    name:      f?.Nombre_Completo ?? firebaseUser.displayName ?? firebaseUser.email ?? 'Usuario',
    role:      rolToUserRole(f?.Rol),
    ministry:  f?.Ministerio_ID  ?? undefined,
    axis:      f?.Eje_ID as ApostolicAxis | undefined,
    loginTime: new Date().toISOString(),
  };
}

export function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':     return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use': return 'Este correo ya tiene una cuenta registrada.';
    case 'auth/weak-password':      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/invalid-email':      return 'El correo no es válido.';
    case 'auth/too-many-requests':  return 'Demasiados intentos. Intenta más tarde.';
    case 'auth/network-request-failed': return 'Sin conexión a internet.';
    default:                        return 'Error de autenticación. Intenta de nuevo.';
  }
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function firebaseLogin(email: string, password: string): Promise<AuthSession> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);

  // Buscar por UID (ya vinculado), luego por email
  let records = await fetchMiembros(`{Firebase_UID}="${user.uid}"`);
  if (!records.length) {
    records = await fetchMiembros(`{Email}="${email}"`);
    if (records.length) {
      await patchMiembro(records[0].id, { Firebase_UID: user.uid });
    }
  }

  // Si no existe registro en Airtable, crear uno para que el admin lo asigne
  if (!records.length) {
    const created = await createMiembro({
      ID_Miembro:      `MBR_${Date.now()}`,
      Nombre_Completo: user.displayName ?? email,
      Email:           email,
      Firebase_UID:    user.uid,
      Rol:             'MIEMBRO',
    });
    records = created ? [created] : [];
  }

  const session = buildSession(user, records[0]);
  localStorage.setItem('tafe_session', JSON.stringify(session));
  return session;
}

export type MatchCandidate = {
  recordId:   string;
  nombre:     string;
  ministerio: string;
  rol:        string;
};

export async function searchCandidates(nombre: string): Promise<MatchCandidate[]> {
  const safe    = nombre.replace(/"/g, '').trim();
  const records = await fetchMiembros(
    `AND(SEARCH("${safe.toUpperCase()}", UPPER({Nombre_Completo}))>0, {Firebase_UID}="")`
  );
  return records.map(r => ({
    recordId:   r.id,
    nombre:     r.fields.Nombre_Completo ?? '',
    ministerio: r.fields.Ministerio_ID   ?? '',
    rol:        r.fields.Rol             ?? 'MIEMBRO',
  }));
}

export async function firebaseRegister(
  email:           string,
  password:        string,
  displayName:     string,
  linkedRecordId?: string,
): Promise<{ session: AuthSession; isPending: boolean }> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });

  let record: AirtableRecord | undefined;
  let isPending = false;

  if (linkedRecordId) {
    // El usuario reclamó un perfil existente
    await patchMiembro(linkedRecordId, { Email: email, Firebase_UID: user.uid });
    const records = await fetchMiembros(`{Firebase_UID}="${user.uid}"`);
    record = records[0];
  } else {
    // Buscar si el admin ya cargó el email
    const byEmail = await fetchMiembros(`{Email}="${email}"`);
    if (byEmail.length) {
      await patchMiembro(byEmail[0].id, { Firebase_UID: user.uid });
      record = byEmail[0];
    } else {
      // Crear como MIEMBRO (acceso inmediato, admin asigna ministerio después)
      const created = await createMiembro({
        ID_Miembro:      `MBR_${Date.now()}`,
        Nombre_Completo: displayName,
        Email:           email,
        Firebase_UID:    user.uid,
        Rol:             'MIEMBRO',
      });
      record    = created ?? undefined;
      isPending = true;
    }
  }

  const session = buildSession(user, record);
  localStorage.setItem('tafe_session', JSON.stringify(session));
  return { session, isPending };
}

export async function googleLogin(): Promise<{ session: AuthSession; isPending: boolean }> {
  const provider = new GoogleAuthProvider();
  const { user }  = await signInWithPopup(auth, provider);

  // Buscar por UID primero, luego por email de Google
  let records = await fetchMiembros(`{Firebase_UID}="${user.uid}"`);
  let isPending = false;

  if (!records.length && user.email) {
    records = await fetchMiembros(`{Email}="${user.email}"`);
    if (records.length) {
      await patchMiembro(records[0].id, { Firebase_UID: user.uid, Email: user.email });
    }
  }

  if (!records.length) {
    // Crear como MIEMBRO (acceso inmediato, admin asigna ministerio después)
    const created = await createMiembro({
      ID_Miembro:      `MBR_${Date.now()}`,
      Nombre_Completo: user.displayName ?? user.email ?? 'Usuario Google',
      Email:           user.email ?? '',
      Firebase_UID:    user.uid,
      Rol:             'MIEMBRO',
    });
    records   = created ? [created] : [];
    isPending = true;
  }

  const session = buildSession(user, records[0]);
  localStorage.setItem('tafe_session', JSON.stringify(session));
  return { session, isPending };
}

export async function firebaseLogout(): Promise<void> {
  await signOut(auth);
  localStorage.removeItem('tafe_session');
}

export function getFirebaseErrorCode(err: unknown): string {
  return (err as AuthError)?.code ?? 'unknown';
}
