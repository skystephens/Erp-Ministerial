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

// --- Tabla 2: Ministros y Equipos (base: appOhMA4UJPwKSGP2) ---
export type MinisterioEquipoFields = {
  Nombre: string;
  ID?: string;
  Rol?: string;
  'Servicio Asignado'?: string;
  Ministerio?: string;
};

const ASISTENCIA_BASE_ID = 'appOhMA4UJPwKSGP2';

const airtableHeaders = () => ({
  Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY as string}`,
  'Content-Type': 'application/json',
});

async function fetchFromBase<T>(baseId: string, tableName: string, filterFormula?: string): Promise<AirtableRecord<T>[]> {
  const key = import.meta.env.VITE_AIRTABLE_API_KEY as string;
  if (!key || key.startsWith('tu_')) return [];

  const params = new URLSearchParams();
  if (filterFormula) params.set('filterByFormula', filterFormula);

  const url = `${BASE_URL}/${baseId}/${encodeURIComponent(tableName)}?${params.toString()}`;
  const res = await fetch(url, { headers: airtableHeaders() });
  if (!res.ok) throw new Error(`[${tableName}] GET ${res.status}: ${await res.text()}`);

  const data: AirtableResponse<T> = await res.json();
  return data.records;
}

async function createInBase<T>(baseId: string, tableName: string, fields: T): Promise<AirtableRecord<T>> {
  const key = import.meta.env.VITE_AIRTABLE_API_KEY as string;
  if (!key || key.startsWith('tu_')) throw new Error('API key no configurada.');

  const res = await fetch(`${BASE_URL}/${baseId}/${encodeURIComponent(tableName)}`, {
    method: 'POST',
    headers: airtableHeaders(),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`[${tableName}] POST ${res.status}: ${await res.text()}`);
  return res.json();
}

export const getMinistrioEquipoMembers = (ministerio?: string) =>
  fetchFromBase<MinisterioEquipoFields>(
    ASISTENCIA_BASE_ID,
    'Tabla 2: Ministros y Equipos',
    ministerio ? `{Ministerio}="${ministerio}"` : undefined
  );

// --- Tabla 3: Asistencia (base: appOhMA4UJPwKSGP2) ---
export type AsistenciaMinisterioFields = {
  Nombre_Miembro: string;
  Ministerio?: string;
  Tipo_Servicio?: string;
  Fecha?: string;
  Estado?: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO';
  Notas?: string;
  Registrado_Por?: string;
  Fuente?: string;
};

export const createAsistenciaMinisterio = (fields: AsistenciaMinisterioFields) =>
  createInBase<AsistenciaMinisterioFields>(ASISTENCIA_BASE_ID, 'Tabla 3: Asistencia', fields);

export const getAsistenciaMinisterio = (ministerio?: string, fecha?: string) => {
  const filters: string[] = [];
  if (ministerio) filters.push(`{Ministerio}="${ministerio}"`);
  if (fecha) filters.push(`{Fecha}="${fecha}"`);
  const formula = filters.length > 1 ? `AND(${filters.join(',')})` : filters[0];
  return fetchFromBase<AsistenciaMinisterioFields>(ASISTENCIA_BASE_ID, 'Tabla 3: Asistencia', formula);
};

// --- Base de datos evangelismos ---
export type EvangelizadoFields = {
  Nombre: string;
  Telefono?: string;
  Fecha_Evangelismo?: string;
  Zona?: string;
  Eje_Interes?: string;
  Estado_Pastoreo?: string;
  Asignado_A?: string;
  Notas?: string;
  Ministerio_Destino?: string;
  Edad?: number;
  Creado_Por?: string;
};

const EVANGELIZADOS_TABLE = 'Base de datos evangelismos';

export const getEvangelizados = () =>
  fetchTable<EvangelizadoFields>(EVANGELIZADOS_TABLE);

export const createEvangelizado = (fields: EvangelizadoFields) =>
  createRecord<EvangelizadoFields>(EVANGELIZADOS_TABLE, fields);

export const updateEvangelizado = (recordId: string, fields: Partial<EvangelizadoFields>) =>
  updateRecord<EvangelizadoFields>(EVANGELIZADOS_TABLE, recordId, fields);

export const deleteEvangelizado = (recordId: string) =>
  deleteRecord(EVANGELIZADOS_TABLE, recordId);

// ─── Gestión de Prospectos (Firebase Auth → Airtable) ────────────────────────

const MIEMBROS_TABLE = encodeURIComponent('[DB] Miembros');

export type ProspectoAirtable = {
  recordId:   string;
  nombre:     string;
  email:      string;
  ministerio: string;
  eje:        string;
};

export async function getProspectos(): Promise<ProspectoAirtable[]> {
  if (!isConfigured()) return [];
  try {
    // Usuarios registrados por Firebase que aún no tienen Ministerio Y Eje asignados (pendientes de aprobación)
    const formula = encodeURIComponent(
      `AND(NOT(BLANK({Firebase_UID})), OR(BLANK({Ministerio_ID}), BLANK({Eje_ID})))`
    );
    const res  = await fetch(`${BASE_URL}/${BASE_ID}/${MIEMBROS_TABLE}?filterByFormula=${formula}`, { headers: getHeaders() });
    const data = await res.json();
    return ((data.records ?? []) as AirtableRecord<Record<string,string>>[]).map(r => ({
      recordId:   r.id,
      nombre:     r.fields['Nombre_Completo'] ?? '',
      email:      r.fields['Email']           ?? '',
      ministerio: r.fields['Ministerio_ID']   ?? '',
      eje:        r.fields['Eje_ID']          ?? '',
    }));
  } catch { return []; }
}

export async function aprobarProspecto(recordId: string, rol: string, ministerio: string, eje: string): Promise<void> {
  await fetch(`${BASE_URL}/${BASE_ID}/${MIEMBROS_TABLE}/${recordId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ fields: { Rol: rol, Ministerio_ID: ministerio, Eje_ID: eje } }),
  });
}

export async function rechazarProspecto(recordId: string): Promise<void> {
  await fetch(`${BASE_URL}/${BASE_ID}/${MIEMBROS_TABLE}/${recordId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
}

// --- Configuracion_App (tabla: key-value para estado de módulos) ---
// Campos necesarios en Airtable: Clave (text, primary), Valor (long text), Actualizado (text)
export type ConfigAppFields = {
  Clave: string;
  Valor: string;
  Actualizado?: string;
};

export const getConfigRecord = async (clave: string): Promise<{ id: string; valor: string } | null> => {
  if (!isConfigured()) return null;
  try {
    const records = await fetchTable<ConfigAppFields>('Configuracion_App', `{Clave}="${clave}"`);
    if (!records[0]) return null;
    return { id: records[0].id, valor: records[0].fields.Valor };
  } catch { return null; }
};

export const upsertConfigRecord = async (
  clave: string,
  valor: string,
  existingRecordId?: string,
): Promise<string | undefined> => {
  if (!isConfigured()) return undefined;
  try {
    if (existingRecordId) {
      await updateRecord<ConfigAppFields>('Configuracion_App', existingRecordId, {
        Valor: valor,
        Actualizado: new Date().toISOString(),
      });
      return existingRecordId;
    } else {
      const rec = await createRecord<ConfigAppFields>('Configuracion_App', {
        Clave: clave,
        Valor: valor,
        Actualizado: new Date().toISOString(),
      });
      return rec.id;
    }
  } catch (e) {
    console.error('[Config] Error saving to Airtable:', e);
    return undefined;
  }
};

// ─── [BIE] Casos_Bienestar ───────────────────────────────────────────────────
// Tabla: tbl6RCKtjql67N8XL
export type CasoBienestarFields = {
  Caso_ID: string;
  Nombre_Solicitante: string;
  Telefono?: string;
  Barrio?: string;
  Tipo_Caso?: string;
  Descripcion?: string;
  Urgencia?: string;
  Tipo_Ayuda_Esperada?: string;
  Monto_Solicitado?: number;
  Eje_Solicitante?: string;
  Dependientes?: string;
  Estado?: string;
  Progreso?: number;
  Fecha_Solicitud?: string;
  Notas_Diaconia?: string;
};

const CASOS_TABLE = '[BIE] Casos_Bienestar';

export const getCasosBienestar = (filtro?: string) =>
  fetchTable<CasoBienestarFields>(CASOS_TABLE, filtro);

export const getCasosByEstado = (estado: string) =>
  fetchTable<CasoBienestarFields>(CASOS_TABLE, `{Estado}="${estado}"`);

export const createCasoBienestar = (fields: CasoBienestarFields) =>
  createRecord<CasoBienestarFields>(CASOS_TABLE, fields);

export const updateCasoBienestar = (recordId: string, fields: Partial<CasoBienestarFields>) =>
  updateRecord<CasoBienestarFields>(CASOS_TABLE, recordId, fields);

// ─── [FIN] Donaciones_Bienestar ──────────────────────────────────────────────
// Tabla: tblbQJjmYG09kkKLq
export type DonacionBienestarFields = {
  Donacion_ID: string;
  Nombre_Donante?: string;
  Monto_COP?: number;
  Tipo_Donacion?: string;
  Metodo_Pago?: string;
  Eje_ID_Donante?: string;
  Caso_ID_Ref?: string;
  Fecha_Donacion?: string;
  Notas?: string;
  Estado_Verificacion?: string;
  Anonima?: boolean;
};

const DONACIONES_TABLE = '[FIN] Donaciones_Bienestar';

export const getDonacionesBienestar = () =>
  fetchTable<DonacionBienestarFields>(DONACIONES_TABLE);

export const createDonacionBienestar = (fields: DonacionBienestarFields) =>
  createRecord<DonacionBienestarFields>(DONACIONES_TABLE, fields);

export const verificarDonacion = (recordId: string) =>
  updateRecord<DonacionBienestarFields>(DONACIONES_TABLE, recordId, { Estado_Verificacion: 'Verificado' });

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
