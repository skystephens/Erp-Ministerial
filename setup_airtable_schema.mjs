/**
 * Setup único — crea los campos nuevos en "TAFE Base de Datos 2025"
 * Base: appOhMA4UJPwKSGP2
 *
 * Uso:
 *   AIRTABLE_KEY=patXXXXXX node setup_airtable_schema.mjs
 */

const API_KEY   = process.env.AIRTABLE_KEY;
const BASE_ID   = 'appOhMA4UJPwKSGP2';
const TABLE_NAME = 'TAFE Base de Datos 2025';

if (!API_KEY) {
  console.error('❌  Falta AIRTABLE_KEY. Usa: AIRTABLE_KEY=patXXX node setup_airtable_schema.mjs');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

// ── 1. Obtener el ID de la tabla ───────────────────────────────────────────
const schemaRes = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, { headers });
if (!schemaRes.ok) {
  const e = await schemaRes.text();
  console.error('❌  Error al leer schema:', schemaRes.status, e);
  process.exit(1);
}
const { tables } = await schemaRes.json();
const table = tables.find(t => t.name === TABLE_NAME);
if (!table) {
  console.error(`❌  No se encontró la tabla "${TABLE_NAME}" en la base ${BASE_ID}`);
  process.exit(1);
}
const TABLE_ID = table.id;
const existingFields = new Set(table.fields.map(f => f.name));
console.log(`✅  Tabla encontrada: ${TABLE_NAME} (${TABLE_ID})`);
console.log(`📋  Campos existentes: ${[...existingFields].join(', ')}\n`);

// ── 2. Definición de campos nuevos ─────────────────────────────────────────
const FIELDS_TO_CREATE = [
  {
    name: 'Estado_Espiritual',
    type: 'singleSelect',
    options: {
      choices: [
        { name: 'PROSPECTO',      color: 'grayLight2' },
        { name: 'VISITANTE',      color: 'yellowLight2' },
        { name: 'NUEVO_CREYENTE', color: 'blueLight2' },
        { name: 'CONSOLIDADO',    color: 'purpleLight2' },
        { name: 'DISCIPULO',      color: 'tealLight2' },
        { name: 'LIDER',          color: 'greenLight2' },
      ],
    },
  },
  {
    name: 'Nivel_Atencion',
    type: 'singleSelect',
    options: {
      choices: [
        { name: 'PROSPECTO',       color: 'grayLight2' },
        { name: 'PRIMER_CONTACTO', color: 'yellowLight2' },
        { name: 'BIENVENIDA',      color: 'blueLight2' },
        { name: 'INTEGRADO',       color: 'purpleLight2' },
        { name: 'DISCIPULO',       color: 'tealLight2' },
        { name: 'LIDER',           color: 'greenLight2' },
      ],
    },
  },
  {
    name: 'Eje_Apostolico',
    type: 'singleSelect',
    options: {
      choices: [
        { name: 'E1', color: 'redLight2' },
        { name: 'E2', color: 'orangeLight2' },
        { name: 'E3', color: 'yellowLight2' },
        { name: 'E4', color: 'greenLight2' },
        { name: 'E5', color: 'tealLight2' },
        { name: 'E6', color: 'blueLight2' },
        { name: 'E7', color: 'purpleLight2' },
      ],
    },
  },
  { name: 'Bautizado',             type: 'checkbox', options: { icon: 'check', color: 'tealBright' } },
  { name: 'Asistencia_Regular',    type: 'checkbox', options: { icon: 'check', color: 'tealBright' } },
  { name: 'Curso_Afirmando_Pasos', type: 'checkbox', options: { icon: 'check', color: 'blueBright' } },
  { name: 'Escuela_NuevaVida_Cristo', type: 'checkbox', options: { icon: 'check', color: 'blueBright' } },
  { name: 'Escuela_Liderazgo',     type: 'checkbox', options: { icon: 'check', color: 'purpleBright' } },
  { name: 'Celula_Actual',         type: 'singleLineText' },
  { name: 'Ministerio_Activo',     type: 'singleLineText' },
  { name: 'Ultimo_Contacto',       type: 'date', options: { dateFormat: { name: 'iso' } } },
  { name: 'Responsable_Seguimiento', type: 'singleLineText' },
  { name: 'Notas_CRM',             type: 'multilineText' },
  { name: 'Barrio',                type: 'singleLineText' },
  { name: 'Sector_Evangelismo',    type: 'singleLineText' },
  { name: 'Peticion_Oracion',      type: 'multilineText' },
  { name: 'Pendiente_Ministerio',  type: 'multilineText' },
];

// ── 3. Crear cada campo (saltando los que ya existen) ──────────────────────
const CREATE_URL = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${TABLE_ID}/fields`;

let created = 0;
let skipped = 0;

for (const field of FIELDS_TO_CREATE) {
  if (existingFields.has(field.name)) {
    console.log(`⏭️   Ya existe: ${field.name}`);
    skipped++;
    continue;
  }

  const res = await fetch(CREATE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(field),
  });

  if (res.ok) {
    const created_field = await res.json();
    console.log(`✅  Creado: ${field.name} (${created_field.id})`);
    created++;
  } else {
    const err = await res.text();
    console.error(`❌  Error en ${field.name}: ${res.status} — ${err}`);
  }

  await new Promise(r => setTimeout(r, 300));
}

console.log(`\n🎉  Listo. Creados: ${created} | Ya existían: ${skipped}`);
