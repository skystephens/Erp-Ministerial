/**
 * Servicio Airtable - Persistencia en la Nube para ERP Ministerial TAFE
 *
 * Tablas reales en la base appB689oQuHCzcgXH:
 *   [DB] Miembros        → ID_Miembro, Nombre_Completo, Rol, Estatus_Espiritual, Ministerio_ID, Eje_ID, Telefono
 *   [DB] Ministerios     → Nombre_Ministerio, Eje_Vinculado, Lider_Responsable
 *   [OP] Tareas          → Tarea_ID, Descripcion, Estatus, Asignado_A, Ministerio_ID, Semana_Ciclo, Creditos_Valor
 *   [TEMP] Cronograma_2026 → Semana_Num, Fase, Hito_Principal
 *   [FIN] Banco_Tiempo   → Transaccion_ID, Tipo, Miembro, Cantidad_Horas, Tarea_Ref, Estatus_Validacion
 *   [DB] Ejes_Apostolicos → Codigo_Eje, Nombre_Eje, Pastora_Responsable
 */

const BASE_URL = 'https://api.airtable.com/v0';
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID as string;

const getHeaders = () => ({
  Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
});

const isConfigured = (): boolean => {
  const key = import.meta.env.VITE_AIRTABLE_API_KEY as string;
  const base = import.meta.env.VITE_AIRTABLE_BASE_ID as string;
  return !!(key && base && !key.startsWith('tu_') && !base.startsWith('tu_'));
};

// ─── Tipos de respuesta ──────────────────────────────────────────────────────

interface AirtableRecord<T> {
  id: string;
  fields: T;
  createdTime: string;
}

interface AirtableResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

// ─── Tipos de campos por tabla ───────────────────────────────────────────────

export type MiembroFields = {
  ID_Miembro: string;
  Nombre_Completo: string;
  Rol: string;
  Estatus_Espiritual: string;
  Ministerio_ID?: string;
  Eje_ID?: string;
  Telefono?: number;
};

export type MinisterioFields = {
  Nombre_Ministerio: string;
  Eje_Vinculado: string;
  Lider_Responsable?: string;
};

export type TareaFields = {
  Tarea_ID?: string;
  Descripcion: string;
  Estatus: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
  Asignado_A?: string;
  Ministerio_ID?: string;
  Semana_Ciclo?: string;
  Creditos_Valor?: number;
};

export type CronogramaFields = {
  Semana_Num: string;
  Fase: string;
  Hito_Principal?: string;
};

export type BancoTiempoFields = {
  Transaccion_ID?: string;
  Tipo: 'APORTE' | 'RETIRO';
  Miembro: string;
  Cantidad_Horas: number;
  Tarea_Ref?: string;
  Estatus_Validacion?: string;
};

export type EjeApostolicoFields = {
  Codigo_Eje: string;
  Nombre_Eje: string;
  Pastora_Responsable?: string;
};

// ─── Utilidades CRUD ─────────────────────────────────────────────────────────

async function fetchTable<T>(tableName: string, filterFormula?: string): Promise<AirtableRecord<T>[]> {
  if (!isConfigured()) {
    console.warn(`Airtable no configurado. Tabla "${tableName}" en modo local.`);
    return [];
  }

  const params = new URLSearchParams();
  if (filterFormula) params.set('filterByFormula', filterFormula);

  const url = `${BASE_URL}/${BASE_ID}/${encodeURIComponent(tableName)}?${params.toString()}`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable [${tableName}] GET ${res.status}: ${err}`);
  }

  const data: AirtableResponse<T> = await res.json();
  return data.records;
}

// Fetches ALL pages from any base (for tables with >100 records)
async function fetchAllPages<T>(
  baseId: string,
  tableName: string,
  filterFormula?: string,
  onProgress?: (loaded: number) => void
): Promise<AirtableRecord<T>[]> {
  const key = import.meta.env.VITE_AIRTABLE_API_KEY as string;
  if (!key || key.startsWith('tu_') || !baseId || baseId.startsWith('tu_')) {
    console.warn(`fetchAllPages: credenciales no configuradas para base "${baseId}".`);
    return [];
  }

  const allRecords: AirtableRecord<T>[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams();
    params.set('pageSize', '100');
    if (filterFormula) params.set('filterByFormula', filterFormula);
    if (offset) params.set('offset', offset);

    const url = `${BASE_URL}/${baseId}/${encodeURIComponent(tableName)}?${params.toString()}`;
    const res = await fetch(url, { headers: getHeaders() });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Airtable [${tableName}] GET ${res.status}: ${err}`);
    }

    const data: AirtableResponse<T> = await res.json();
    allRecords.push(...data.records);
    offset = data.offset;
    if (onProgress) onProgress(allRecords.length);
  } while (offset);

  return allRecords;
}

async function createRecord<T>(tableName: string, fields: T): Promise<AirtableRecord<T>> {
  if (!isConfigured()) throw new Error('Airtable no configurado.');

  const res = await fetch(`${BASE_URL}/${BASE_ID}/${encodeURIComponent(tableName)}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable [${tableName}] POST ${res.status}: ${err}`);
  }

  return res.json();
}

async function updateRecord<T>(tableName: string, recordId: string, fields: Partial<T>): Promise<AirtableRecord<T>> {
  if (!isConfigured()) throw new Error('Airtable no configurado.');

  const res = await fetch(`${BASE_URL}/${BASE_ID}/${encodeURIComponent(tableName)}/${recordId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable [${tableName}] PATCH ${res.status}: ${err}`);
  }

  return res.json();
}

async function updateRecordInBase<T>(baseId: string, tableName: string, recordId: string, fields: Partial<T>): Promise<AirtableRecord<T>> {
  const key = import.meta.env.VITE_AIRTABLE_API_KEY as string;
  if (!key || key.startsWith('tu_')) throw new Error('API key no configurada.');

  const res = await fetch(`${BASE_URL}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable [${tableName}] PATCH ${res.status}: ${err}`);
  }

  return res.json();
}

async function deleteRecord(tableName: string, recordId: string): Promise<void> {
  if (!isConfigured()) throw new Error('Airtable no configurado.');
  const res = await fetch(`${BASE_URL}/${BASE_ID}/${encodeURIComponent(tableName)}/${recordId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable [${tableName}] DELETE ${res.status}: ${err}`);
  }
}

// ─── API Pública ─────────────────────────────────────────────────────────────

export const airtableIsActive = (): boolean => isConfigured();

// --- [DB] Miembros ---
export const getMiembros = () =>
  fetchTable<MiembroFields>('[DB] Miembros');

export const getMiembrosByMinisterio = (ministerio: string) =>
  fetchTable<MiembroFields>('[DB] Miembros', `{Ministerio_ID}="${ministerio}"`);

export const getMiembrosByEje = (eje: string) =>
  fetchTable<MiembroFields>('[DB] Miembros', `{Eje_ID}="${eje}"`);

export const createMiembro = (fields: MiembroFields) =>
  createRecord<MiembroFields>('[DB] Miembros', fields);

export const updateMiembro = (recordId: string, fields: Partial<MiembroFields>) =>
  updateRecord<MiembroFields>('[DB] Miembros', recordId, fields);

// --- [DB] Ministerios ---
export const getMinisterios = () =>
  fetchTable<MinisterioFields>('[DB] Ministerios');

export const getMinisteriosByEje = (eje: string) =>
  fetchTable<MinisterioFields>('[DB] Ministerios', `{Eje_Vinculado}="${eje}"`);

// --- [OP] Tareas ---
export const getTareas = () =>
  fetchTable<TareaFields>('[OP] Tareas');

export const getTareasByMinisterio = (ministerio: string) =>
  fetchTable<TareaFields>('[OP] Tareas', `{Ministerio_ID}="${ministerio}"`);

export const getTareasByAsignado = (nombre: string) =>
  fetchTable<TareaFields>('[OP] Tareas', `{Asignado_A}="${nombre}"`);

export const getTareasPendientes = () =>
  fetchTable<TareaFields>('[OP] Tareas', `{Estatus}="PENDIENTE"`);

export const createTarea = (fields: TareaFields) =>
  createRecord<TareaFields>('[OP] Tareas', fields);

export const updateTarea = (recordId: string, fields: Partial<TareaFields>) =>
  updateRecord<TareaFields>('[OP] Tareas', recordId, fields);

// --- [TEMP] Cronograma_2026 ---
export const getCronograma = () =>
  fetchTable<CronogramaFields>('[TEMP] Cronograma_2026');

export const getCronogramaByFase = (fase: string) =>
  fetchTable<CronogramaFields>('[TEMP] Cronograma_2026', `{Fase}="${fase}"`);

// --- [FIN] Banco_Tiempo ---
export const getBancoTiempo = () =>
  fetchTable<BancoTiempoFields>('[FIN] Banco_Tiempo');

export const getBancoTiempoByMiembro = (nombre: string) =>
  fetchTable<BancoTiempoFields>('[FIN] Banco_Tiempo', `{Miembro}="${nombre}"`);

export const createTransaccion = (fields: BancoTiempoFields) =>
  createRecord<BancoTiempoFields>('[FIN] Banco_Tiempo', fields);

export const validarTransaccion = (recordId: string) =>
  updateRecord<BancoTiempoFields>('[FIN] Banco_Tiempo', recordId, { Estatus_Validacion: 'VALIDADO' });

// --- [DB] Ejes_Apostolicos ---
export const getEjesApostolicos = () =>
  fetchTable<EjeApostolicoFields>('[DB] Ejes_Apostolicos');

// --- Horario de Servicios CSI Medios ---
export type HorarioCSIFields = {
  Fecha: string;
  Servicio: string;
  'Rol Asignado': string;
  'Persona a cargo': string[];
  Notas?: string;
};

export const getHorarioCSI = (filterFormula?: string) =>
  fetchTable<HorarioCSIFields>('Horario de Servicios CSI Medios', filterFormula);

export const updateHorarioCSI = (recordId: string, fields: Partial<HorarioCSIFields>) =>
  updateRecord<HorarioCSIFields>('Horario de Servicios CSI Medios', recordId, fields);

export const createHorarioCSI = (fields: HorarioCSIFields) =>
  createRecord<HorarioCSIFields>('Horario de Servicios CSI Medios', fields);

// --- TAFE Base de Datos 2025 (base separada: appOhMA4UJPwKSGP2) ---
export type EstadoEspiritual = 'PROSPECTO' | 'VISITANTE' | 'NUEVO_CREYENTE' | 'CONSOLIDADO' | 'DISCIPULO' | 'LIDER';
export type NivelAtencionCRM = 'PROSPECTO' | 'PRIMER_CONTACTO' | 'BIENVENIDA' | 'INTEGRADO' | 'DISCIPULO' | 'LIDER';

export type DirectorioMiembroFields = {
  // ── Datos personales (existentes) ──────────────────────────────────────────
  'Nombre Completo': string;
  'Dirección / Barrio'?: string;
  Email?: string;
  Cedula?: number;
  Teléfono?: string;
  'Sede de Iglesia TAFE'?: string;
  'Fecha de Nacimiento'?: string;
  'Tipo de Sangre'?: string;
  Sexo?: string;
  Fuente?: string;

  // ── Crecimiento espiritual (nuevos) ────────────────────────────────────────
  Estado_Espiritual?: EstadoEspiritual;
  Bautizado?: boolean;
  Asistencia_Regular?: boolean;
  Curso_Afirmando_Pasos?: boolean;
  Escuela_NuevaVida_Cristo?: boolean;
  Escuela_Liderazgo?: boolean;

  // ── Célula y ministerio (nuevos) ───────────────────────────────────────────
  Celula_Actual?: string;
  Eje_Apostolico?: string;
  Ministerio_Activo?: string;

  // ── CRM / Seguimiento (nuevos) ─────────────────────────────────────────────
  Nivel_Atencion?: NivelAtencionCRM;
  Ultimo_Contacto?: string;
  Responsable_Seguimiento?: string;
  Notas_CRM?: string;

  // ── Geográfico (nuevos) ────────────────────────────────────────────────────
  Barrio?: string;
  Sector_Evangelismo?: string;

  // ── Pendientes (nuevos) ────────────────────────────────────────────────────
  Peticion_Oracion?: string;
  Pendiente_Ministerio?: string;
};

const DIRECTORIO_BASE_ID = () =>
  (import.meta.env.VITE_AIRTABLE_BASE_ID1 as string) || '';

export const directorioIsActive = (): boolean => {
  const id = DIRECTORIO_BASE_ID();
  return !!(id && !id.startsWith('tu_'));
};

export const getDirectorioMiembros = (onProgress?: (loaded: number) => void) =>
  fetchAllPages<DirectorioMiembroFields>(
    DIRECTORIO_BASE_ID(),
    'TAFE Base de Datos 2025',
    undefined,
    onProgress
  );

export const searchDirectorioMiembros = (term: string) =>
  fetchAllPages<DirectorioMiembroFields>(
    DIRECTORIO_BASE_ID(),
    'TAFE Base de Datos 2025',
    `OR(SEARCH("${term}", {Nombre Completo}), SEARCH("${term}", {Teléfono}))`
  );

export const updateDirectorioMiembro = (recordId: string, fields: Partial<DirectorioMiembroFields>) =>
  updateRecordInBase<DirectorioMiembroFields>(
    DIRECTORIO_BASE_ID(),
    'TAFE Base de Datos 2025',
    recordId,
    fields
  );

// --- [OP] Eventos_Calendario (tabla a crear en Airtable: Titulo, Fecha, Estado, Ministerio, Tipo, Eje, RecurrenciaGrupoId, RecurrenciaEtiqueta) ---
export type EventoCalendarioFields = {
  Titulo: string;
  Fecha: string;
  Estado: 'CONFIRMED' | 'TENTATIVE' | 'PENDING';
  Ministerio?: string;
  Tipo?: string;
  Eje?: string;
  RecurrenciaGrupoId?: string;
  RecurrenciaEtiqueta?: string;
};

export const getEventosCalendario = () =>
  fetchTable<EventoCalendarioFields>('[OP] Eventos_Calendario');

export const createEventoCalendario = (fields: EventoCalendarioFields) =>
  createRecord<EventoCalendarioFields>('[OP] Eventos_Calendario', fields);

export const updateEventoCalendario = (recordId: string, fields: Partial<EventoCalendarioFields>) =>
  updateRecord<EventoCalendarioFields>('[OP] Eventos_Calendario', recordId, fields);

export const deleteEventoCalendario = (recordId: string) =>
  deleteRecord('[OP] Eventos_Calendario', recordId);

// --- [OP] Asistencia (tabla existente en Airtable — campos reales verificados) ---
// Campos: Name, Ministerio, Tipo_Servicio, Fecha, Hora, Registrado_Por, Fuente, Miembros_Presentes, Notas
// Total_Presentes y Porcentaje_Asistencia son fórmulas de Airtable (no se envían)
export type AsistenciaFields = {
  Name: string;                  // Nombre del miembro presente (un registro por miembro)
  Ministerio?: string;           // CSI / Medios | Alabanza | etc.
  Tipo_Servicio?: string;        // Viernes 8 pm | Domingo 8 am | Domingo 10 am | etc.
  Fecha?: string;                // YYYY-MM-DD
  Hora?: string;                 // HH:MM
  Registrado_Por?: string;       // Nombre de quien registra
  Fuente?: string;               // 'APP' | 'FORMULARIO' | 'MANUAL'
  Miembros_Presentes?: string;   // Nombre del miembro (replica Name para fórmulas)
  Notas?: string;
};

export const getAsistencia = (filterFormula?: string) =>
  fetchTable<AsistenciaFields>('[OP] Asistencia', filterFormula);

export const getAsistenciaByMinisterio = (ministerio: string) =>
  fetchTable<AsistenciaFields>('[OP] Asistencia', `{Ministerio}="${ministerio}"`);

export const getAsistenciaByFecha = (fecha: string) =>
  fetchTable<AsistenciaFields>('[OP] Asistencia', `{Fecha}="${fecha}"`);

export const createAsistenciaRecord = (fields: AsistenciaFields) =>
  createRecord<AsistenciaFields>('[OP] Asistencia', fields);

// --- [CRM] Seguimiento (tabla a crear: Nombre_Miembro, Telefono, Nivel_Atencion, Responsable, Ultimo_Contacto, Proxima_Accion, Notas, Ministerio, Eje, Grupo_Origen) ---
export type CRMSeguimientoFields = {
  Nombre_Miembro: string;
  Telefono?: string;
  Email?: string;
  Edad?: number;
  Nivel_Atencion: string;
  Responsable?: string;
  Ultimo_Contacto?: string;
  Proxima_Accion?: string;
  Notas?: string;
  Ministerio?: string;
  Eje?: string;
  Grupo_Origen?: string;
};

export const getCRMSeguimientos = () =>
  fetchTable<CRMSeguimientoFields>('[CRM] Seguimiento');

export const createCRMSeguimiento = (fields: CRMSeguimientoFields) =>
  createRecord<CRMSeguimientoFields>('[CRM] Seguimiento', fields);

export const updateCRMSeguimiento = (recordId: string, fields: Partial<CRMSeguimientoFields>) =>
  updateRecord<CRMSeguimientoFields>('[CRM] Seguimiento', recordId, fields);

// --- Sync híbrido: crea tarea y registra aporte en Banco_Tiempo ---
export const syncTareaConBanco = async (
  tarea: TareaFields,
  miembro: string,
  horas: number
): Promise<{ tareaId: string | null; txId: string | null }> => {
  if (!isConfigured()) return { tareaId: null, txId: null };

  try {
    const tareaRecord = await createTarea(tarea);
    const txRecord = await createTransaccion({
      Tipo: 'APORTE',
      Miembro: miembro,
      Cantidad_Horas: horas,
      Tarea_Ref: tarea.Tarea_ID ?? tareaRecord.id,
      Estatus_Validacion: 'UNCHECKED',
    });
    return { tareaId: tareaRecord.id, txId: txRecord.id };
  } catch (err) {
    console.error('Sync Airtable falló:', err);
    return { tareaId: null, txId: null };
  }
};
