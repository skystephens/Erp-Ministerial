# ERP Ministerial TAFE — Contexto del Proyecto

> Archivo vivo. Actualizar con cada decisión arquitectónica importante.
> Última actualización: 2026-03-17

## URLs de Producción

| Recurso | URL |
|---|---|
| **App en producción** | https://erp-ministerial.onrender.com |
| **Render Service ID** | `srv-d6sr1mf5gffc738pc820` |
| **Repo GitHub** | https://github.com/skystephens/Erp-Ministerial |

---

## Visión General

**ERP Ministerial TAFE** es una herramienta de gestión interna para **Iglesia TAFE** (`iglesiatafe.com`).
Su objetivo es convertir la operación diaria de la iglesia en un sistema medible, coordinado y orientado
al impacto del "Gobierno del Reino".

### Lo que hace
- Gestión de miembros, prospectos y liderazgo por roles (Super Admin → Prospecto)
- Organización de los **7 Ejes Apostólicos** (E1–E7) como unidad de medición de impacto
- Tareas operativas vinculadas a ejes y ministerios
- Dashboard para el Pastor y líderes
- Banco de Tiempo, Buzón Pastoral, Calendario 2026, Directorio
- Orquestador IA para mapear necesidades a ejes automáticamente

---

## Stack Tecnológico

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite | Activo |
| Estilos | Tailwind CSS (clases inline) | Activo |
| IA Orquestador | **Claude (Anthropic API)** | Configurando |
| Base de datos nube | **Airtable** | Configurando |
| Persistencia local | localStorage (modo offline) | Activo |
| Deploy frontend | Render (Static Site) | Pendiente |
| Backend proxy | Node.js/Express en Render | Planificado |
| Dominio | iglesiatafe.com/home-2 | Pendiente integración |

---

## Arquitectura de Datos

### Modo Local (actual)
```
Usuario → App.tsx → localStorage → Componentes
```
Los datos viven en el navegador. Se exportan/importan via JSON desde `AdminManagement.tsx`.

### Modo Híbrido (objetivo)
```
Usuario → App.tsx → localStorage (inmediato)
                 ↘ airtableService.ts → Airtable API (sincronización)
```
Si Airtable no está disponible, el sistema sigue funcionando en modo local.
y se sincronizan una vez vuelve a estar en linea, deja trazabilidad en airtable con informacion de lo que puede ir logrando la herramienta, tareas y procesos para medir impacto de los herramientas y explicar como continuar el proceso a los nuevos miembros del ministerio, definir normas y procesos para esto y mostar resultados, proyecciones y medir el avance.

---

## Integraciones

### Claude API (Orquestador IA)
- **Archivo:** `services/anthropicService.ts`
- **Función:** `processTaskRequest(prompt)` — analiza texto y retorna `{ministry, axis, taskTitle, requiredSkill, isUrgent}`
- **Modelo:** `claude-sonnet-4-6`
- **Variable de entorno:** `VITE_ANTHROPIC_API_KEY`
- **Usado en:** `components/Operations.tsx` (botón "Vincular Acción TAFE")

> ⚠️ **Para producción en Render:** La API key no debe exponerse al browser.
> Crear un endpoint proxy `/api/ai-orchestrate` en un backend Express:
> ```
> POST /api/ai-orchestrate  { prompt: string }
> → llama a Anthropic internamente con la key del servidor
> → retorna AITaskResult
> ```

### Airtable (Base de Datos)
- **Archivo:** `services/airtableService.ts`
- **Base ID:** `appB689oQuHCzcgXH`
- **Variables de entorno:** `VITE_AIRTABLE_API_KEY`, `VITE_AIRTABLE_BASE_ID`
- **Token:** Personal Access Token con scopes `data.records:read` + `data.records:write`

> ⚠️ Los nombres de tabla incluyen prefijos con corchetes (`[DB]`, `[OP]`, etc.). Siempre usar `encodeURIComponent()` en las URLs de fetch.

#### Tablas reales en Airtable (schema verificado 2026-03-17)

**[DB] Miembros**
| Campo | Tipo | Ejemplo |
|---|---|---|
| ID_Miembro | Texto | TAFE-001 |
| Nombre_Completo | Texto | Sky Stephens |
| Rol | Texto | LIDER_MINISTERIO, PASTORA_EJE |
| Estatus_Espiritual | Texto | CONSOLIDADO |
| Ministerio_ID | Texto | Medios y Comunicaciones |
| Eje_ID | Texto | E5 |
| Telefono | Número | 3000000001 |

**[DB] Ministerios**
| Campo | Tipo | Ejemplo |
|---|---|---|
| Nombre_Ministerio | Texto | Jovenes Joel |
| Eje_Vinculado | Texto | E7 |
| Lider_Responsable | Texto | Mirtha Diaz |

**[OP] Tareas**
| Campo | Tipo | Ejemplo |
|---|---|---|
| Tarea_ID | Texto | T-S1-001 |
| Descripcion | Texto | Lanzamiento cadena intercesión 24/7 |
| Estatus | Texto | PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA |
| Asignado_A | Texto | Sky Stephens |
| Ministerio_ID | Texto | Medios y Comunicaciones |
| Semana_Ciclo | Texto | Semana 1 |
| Creditos_Valor | Número | 10 |

**[TEMP] Cronograma_2026**
| Campo | Tipo | Ejemplo |
|---|---|---|
| Semana_Num | Texto | Semana 3 |
| Fase | Texto | PLANIFICACION |
| Hito_Principal | Texto | Diseño de Estrategia Territorial |

**[FIN] Banco_Tiempo**
| Campo | Tipo | Ejemplo |
|---|---|---|
| Transaccion_ID | Texto | TX-001 |
| Tipo | Texto | APORTE, RETIRO |
| Miembro | Texto | Sky Stephens |
| Cantidad_Horas | Número | 2 |
| Tarea_Ref | Texto | T-S1-002 |
| Estatus_Validacion | Texto | UNCHECKED, VALIDADO |

**[DB] Ejes_Apostolicos**
| Campo | Tipo | Ejemplo |
|---|---|---|
| Codigo_Eje | Texto | E5 |
| Nombre_Eje | Texto | Atmosfera (Alabanza/AV) |
| Pastora_Responsable | Texto | Liseth Lever |

---

## Deploy en Render

### Frontend (Static Site)
```
Build Command:   npm install && npm run build
Publish Dir:     dist
```

Variables de entorno en Render:
```
VITE_ANTHROPIC_API_KEY = [tu key real]
VITE_AIRTABLE_API_KEY  = [tu PAT de Airtable]
VITE_AIRTABLE_BASE_ID  = [tu Base ID]
```

### Backend Proxy (planificado)
Cuando se implemente el backend Node/Express en Render:
- `POST /api/ai-orchestrate` → proxy a Anthropic
- `GET/POST /api/airtable/:table` → proxy a Airtable (evita exponer tokens)
- El frontend cambiaría las llamadas a fetch relativas (`/api/...`) en vez de externas

---

## Usuarios y Jerarquía

| Rol | Acceso | Persona |
|---|---|---|
| SUPER_ADMIN | Todo el sistema | Pr. David Lever (`david@iglesiatafe.com`) |
| SUPERVISORA | Su eje asignado + ministerios bajo su cargo | Liseth Lever (E5), Guillermina Martinez (E3) |
| LIDER_MINISTERIO | Su ministerio | Sky Stephens (CSI/Medios), etc. |
| MIEMBRO | MyService, Banco de Tiempo, Buzón | Todos los miembros aprobados |
| PROSPECTO | Solo Onboarding | Nuevos registros sin aprobar |

---

## Ministerios Oficiales (17)

Organizados por Eje:
- **E1:** Evangelismo, Células
- **E2:** Intercesión
- **E3:** Consolidación, Anfitriones
- **E4:** Infancia, Danza
- **E5:** CSI/Medios, Alabanza
- **E6:** Social/Saneamiento, Banco de Tiempo
- **E7:** Jóvenes (Elohim)

---

## Conexión con iglesiatafe.com

### Opción A — Subdominio (recomendado)
```
erp.iglesiatafe.com  →  CNAME  →  erp-ministerial-tafe.onrender.com
```

### Opción B — Embed en home-2
```html
<iframe src="https://erp-ministerial-tafe.onrender.com"
        width="100%" height="800px" frameborder="0" />
```

---

## Roadmap

### Completado
- [x] Frontend funcional con localStorage
- [x] Migración IA: Gemini → Claude Sonnet 4.6 (`anthropicService.ts`)
- [x] `Operations.tsx` conectado al orquestador Claude
- [x] `airtableService.ts` reescrito con schema real verificado en Airtable
- [x] Credenciales reales configuradas en `.env.local` (Anthropic + Airtable)
- [x] Token Airtable verificado via PowerShell — conexión confirmada
- [x] Tipos TypeScript correctos por tabla (`MiembroFields`, `TareaFields`, etc.)
- [x] `vite-env.d.ts` creado → resuelve errores de `import.meta.env` en TypeScript
- [x] Función `syncTareaConBanco()` — crea tarea + transacción en una operación

### Próximas Tareas — Alta Prioridad
- [ ] **Conectar Dashboard** — reemplazar datos de ejemplo por `getMiembros()`, `getTareas()`, `getEjesApostolicos()`
- [ ] **Conectar TimeBank** — usar `getBancoTiempo()`, `createTransaccion()`, `validarTransaccion()`
- [ ] **Conectar Directorio** — listar miembros reales con filtros por eje y ministerio

### Próximas Tareas — Media Prioridad
- [ ] **Conectar CalendarView** — cargar desde `[TEMP] Cronograma_2026`
- [ ] **Conectar BuzonPeticiones** — crear tabla `[OP] Peticiones` en Airtable si no existe
- [ ] **Conectar AdminManagement** — gestión de miembros con `createMiembro()` y `updateMiembro()`
- [ ] **Conectar ProjectManager** — tareas desde `[OP] Tareas` con cambio de estatus

### Infraestructura
- [ ] Push a GitHub (`erp-ministerial-tafe`)
- [ ] Deploy en Render (Static Site)
- [ ] Indicador de conexión Airtable en Header usando `airtableIsActive()`
- [ ] Manejo de errores global — toast cuando Airtable falla, continúa en modo local
- [ ] Paginación — Airtable devuelve máx 100 registros; implementar `offset` para tablas grandes
- [ ] Backend proxy en Render — endpoints `/api/ai-orchestrate` y `/api/airtable/:table` para no exponer keys en browser
- [ ] Integrar con iglesiatafe.com (subdominio `erp.iglesiatafe.com` o iframe)
