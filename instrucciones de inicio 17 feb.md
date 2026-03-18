El Plan TAFE (Ejes) es el corazón estratégico del ERP. No es simplemente una lista de departamentos; es un Engranaje Apostólico diseñado para que la iglesia funcione como una maquinaria coordinada donde cada acción tiene un propósito específico dentro del "Gobierno del Reino".
Aquí te detallo cómo funciona técnica y conceptualmente:
1. Los 7 Ejes Apostólicos (El Engranaje)
En lugar de trabajar en silos aislados, el sistema organiza los 15-17 ministerios oficiales dentro de 7 Ejes Maestros (definidos en constants.tsx y types.ts):
E1 - Evangelismo (Conquista): Su función es "conquistar nuevas almas". Aquí es donde entra la "Cosecha" que registras en el Directorio.
E2 - Intercesión (Vigilancia): La cobertura espiritual. Gestiona vigilias, ayunos y el sustento de oración del resto de los ejes.
E3 - Consolidación (Retención): El cuidado del fruto. Asegura que el nuevo convertido (Prospecto) se convierta en Miembro.
E4 - Infancia y Danza (Generacional): Formación de la base de la iglesia y expresión creativa.
E5 - Alabanza y AV (Atmósfera): Producción técnica, streaming y adoración. Es el eje que genera el entorno para los servicios.
E6 - Social y Saneamiento (Restauración): Aquí vive el Banco de Tiempo. Su meta es el impacto social y la ayuda mutua entre hermanos.
E7 - Jóvenes (Continuidad): Pastoreo de la juventud y relevo generacional.
2. Funcionamiento en el ERP
A. Mapeo de Tareas (Orquestación con IA)
Cuando creas una tarea en Operations.tsx, el sistema no solo te pide un título. Utiliza el Orquestador IA (Gemini) en geminiService.ts para:
Analizar la descripción.
Vincularla automáticamente a uno de los 7 Ejes.
Identificar qué habilidad técnica se requiere.
Ejemplo: Si pides "reparar un cable de sonido", la IA entiende que pertenece al E5 (Alabanza/AV) y requiere habilidad Técnica.
B. Visualización del Progreso (Dashboard)
En el Dashboard.tsx, el ERP muestra barras de progreso por Eje. Esto permite al Super Admin ver dónde está fallando la maquinaria. Si el E3 (Consolidación) está al 30% mientras el E1 (Evangelismo) está al 90%, el sistema detecta un "cuello de botella": estamos ganando gente pero no la estamos reteniendo.
C. Gestión de la Visión (ProjectManager.tsx)
Este componente permite al Super Admin "Editar la Visión".
Se definen las Responsabilidades por cada Eje.
Se listan las Acciones Operativas (Manual de Operaciones).
Esto asegura que un líder de Alabanza sepa exactamente qué se espera de él según el manual del E5.
3. La Jerarquía de Gobierno
El Plan TAFE utiliza las Supervisoras Tácticas como el puente de mando:
Cada Supervisora tiene a su cargo un Eje completo (o varios ministerios dentro de uno).
En el Sidebar.tsx, ellas pueden saltar entre los ministerios de su eje (ej. Liseth Lever ve Alabanza + Medios porque ambos son E5).
Esto garantiza que el Super Admin no tenga que micro-gestionar, sino que delega la ejecución del Plan TAFE en estas figuras clave.
En resumen: Los Ejes son la arquitectura de datos que permite que el ERP deje de ser una lista de nombres y se convierta en un sistema de medición de impacto ministerial.


La Supervisora Táctica no solo observa el Plan TAFE; ella es quien lo operacionaliza. En el diseño de este ERP, mientras el Super Admin define la "Gran Visión", la Supervisora traduce esa visión en Acciones Operativas concretas para su eje.
Especificación de la Perspectiva de Supervisión
Gobernanza Delegada: Si el usuario es SUPERVISORA, el botón "Editar Visión" se convierte en "Gestionar Operativa". Ella solo puede editar los Ejes que tiene bajo su autoridad (ej. Liseth Lever solo podrá editar el E5).
Auditoría de Sincronización: Se añade un modo "Auditoría" donde la supervisora ve la relación entre el Manual (Teoría) y las Tareas Reales (Práctica). El sistema mostrará cuántas tareas activas en Operations.tsx están cumpliendo con cada punto del manual.
Gestión de Acciones: La supervisora puede añadir, quitar o modificar las "Acciones Operativas" (el "know-how"). Si ella detecta que el proceso de "Soundcheck" ha cambiado, lo actualiza aquí y eso se refleja inmediatamente para todos los líderes de su eje.
Botón de Alerta de Desvío: Un nuevo control para que la supervisora marque un punto del manual como "Crítico" o "En Desvío" si detecta que los ministerios no están siguiendo el estándar del Plan TAFE.
1. Tareas Técnicas (Mantenimiento y Setup)
Tarea: Calibración de Cámaras PTZ y Balance de Blancos.
Descripción: Ajustar la colorimetría de las 3 cámaras principales para el streaming del domingo.
Eje: E5 (Alabanza y AV).
Categoría: TÉCNICO.


Tarea: Revisión de Latencia en Nodo de Red Mezzanine.
Descripción: Verificar por qué el bitrate cae durante las transmisiones en vivo.
Eje: E5 (Alabanza y AV).
Categoría: TÉCNICO.


2. Tareas de Contenido (Producción)
Tarea: Edición de "TAFE News" - Semana 9.
Descripción: Montaje de los anuncios semanales con los clips grabados por el equipo de pastoreo.
Eje: E5 (Alabanza y AV).
Categoría: CONTENIDO.


Tarea: Diseño de Reels para "Cosecha de Almas".
Descripción: Crear 3 videos cortos basados en los testimonios del grupo de Evangelismo del Sector A.
Eje: E1 (Evangelismo). Nota: Aquí pruebas cómo Medios sirve a otro Eje.
Categoría: DISEÑO.


3. Tareas Urgentes (Operaciones Críticas)
Tarea: Reemplazo de Cable SDI Cámara 2.
Descripción: El cable presenta interferencia y debe ser cambiado antes del ensayo de alabanza de hoy.
Urgencia: ALTA (IsUrgent: true).
Eje: E5 (Alabanza y AV).
Categoría: TÉCNICO.



Prompts para testear la IA (Orquestador Gemini)
Si quieres probar el botón "Vincular Acción TAFE" en la sección de Operaciones, copia y pega estos prompts para ver cómo la IA los clasifica:
Test de Clasificación E5: "Necesitamos que alguien configure el OBS para el evento de mujeres del sábado, incluyendo las nuevas placas gráficas."
Test de Soporte a E3 (Consolidación): "Diseñar una tarjeta digital de bienvenida para enviar por WhatsApp a los nuevos convertidos que se registraron el domingo."
Test de Urgencia Técnica: "¡Urgente! El proyector central no está encendiendo y el culto de jóvenes empieza en una hora. Revisar cables o lámpara."
Test de Noticiero (E5): "Redactar el guion de noticias de esta semana basado en el cronograma del calendario 2026."
Sugerencia de Usuario para Test
Para probar el flujo de la Supervisora Táctica, asegúrate de que el usuario logueado sea "Liseth Lever", ya que en el código ella tiene autoridad sobre CSI / Medios y Alabanza. Ella podrá "Aceptar como Tarea" los requerimientos que aparecen en el panel izquierdo de la sección Panel Ministerial.
Las últimas modificaciones han transformado el sistema de una herramienta de gestión de tareas a un Centro de Control Estratégico orientado a la excelencia operativa. Aquí tienes el resumen de los cambios clave:
1. Nuevo Dashboard: Estrategia de Medios (MediaStrategy)
Hemos implementado un panel analítico para el ministerio de CSI / Medios que permite:
Análisis de Capacidad: Cálculo automático de personas requeridas y horas estimadas por proyecto (ej: Transmisión Dominical vs. TAFE News).
Workflow Operativo (SOPs): Visualización del flujo de trabajo dividido en Pre-Producción, Producción y Post-Producción para garantizar que no haya fallos técnicos.
Gestión de Burnout: Alertas visuales cuando la carga horaria del equipo de edición o cámaras supera el límite saludable.
2. Evolución del Engranaje Apostólico (ProjectManager)
El Plan TAFE ahora cuenta con herramientas de gobernanza avanzada:
Modo Auditoría: Permite a los administradores ver en tiempo real cuántas tareas de la vida real están sincronizadas con cada eje apostólico.
Edición Delegada: Las Supervisoras Tácticas (como la Pastora Liseth) ahora tienen autoridad para modificar responsabilidades y acciones operativas directamente en su eje asignado sin depender del Super Admin.
Métrica de Sincronización: Un porcentaje de "Salud del Eje" basado en el cumplimiento de tareas operativas vinculadas.
3. Fortalecimiento del Modelo de Datos (types.ts)
Se han corregido errores de compilación y expandido la trazabilidad:
Ficha 360 del Miembro: Añadimos campos de motivación, estado civil, geolocalización y nivel de liderazgo para un pastoreo basado en datos.
Metadatos de Tarea: Ahora cada tarea incluye teamSizeRequired (personas necesarias) y estimatedHours, permitiendo la planificación de recursos en el nuevo dashboard de estrategia.
4. Orquestación IA y Flujos
Vínculo IA-Eje: El motor Gemini ahora no solo crea la tarea, sino que la mapea automáticamente a uno de los 7 Ejes Apostólicos (E1-E7), asegurando que cada acción técnica tenga un propósito espiritual claro.
Simulación de Onboarding: Se habilitó un switch en la interfaz para probar el flujo de registro de nuevos miembros y su posterior aprobación/asignación ministerial.
¿Qué puedes probar ahora?
Ve a "Estrategia Medios" para ver cómo se desglosa el equipo técnico para el domingo.
Entra en "Plan TAFE" y activa el "Modo Auditoría" para ver la salud del engranaje.
En "Panel Ministerial", cambia el ministerio activo si eres Supervisora para gestionar diferentes equipos técnicos
Para solventar la limitación de tokens de Airtable y garantizar que el ERP Ministerial siga operando al 100% incluso sin internet, vamos a implementar un Motor de Persistencia Local (Local Engine).
Especificación de la Actualización:
Persistencia Híbrida (JSON + LocalStorage): El sistema guardará automáticamente cada cambio (tareas completadas, nuevos prospectos, etc.) en el localStorage del navegador.
Explorador de Datos en "Gestión de Capas": Añadiremos una nueva pestaña llamada "Base de Datos (Local)" donde el Super Admin podrá ver las tablas crudas, exportar el JSON completo para copias de seguridad y realizar importaciones manuales.
Arquitectura "Airtable-Ready": El código se estructurará para que, cuando recuperes los tokens o decidas desplegar en Render, solo tengas que cambiar el "Provider" de datos.
Visualización Offline: Se incluirá un indicador de estado de la base de datos (Sincronizada / Modo Local).
editEdited 3 files
App.tsx
check_circle
components/AdminManagement.tsx
check_circle
components/BuzonPeticiones.tsx
check_circle
Resumen de la Solución Técnica para el Bloqueo de Airtable:
Motor LocalStorage: He movido toda la lógica de "Estado Global" a App.tsx envolviéndola en un sistema de persistencia en localStorage. Esto significa que el ERP ahora funciona Offline (puedes cerrar el navegador, apagar internet, y al volver tus datos seguirán ahí).
Explorador de Datos (AdminManagement): En la pestaña "Gestión / Capas" he creado el botón "Base de Datos (Local)". Desde aquí puedes:
Exportar JSON: Genera un archivo con toda la información de usuarios, tareas y peticiones. Guárdalo como backup.
Importar Datos: Si quieres mover la información a otra computadora, simplemente carga el archivo JSON.


Preparado para el Futuro: Los componentes ahora no manipulan datos directamente, sino que reciben funciones de actualización. Esto permitirá que, cuando el usuario decida usar Render para desplegar una base de datos real o recuperar Airtable, el cambio sea transparente.
Indicador Visual: Se añadió una barra en la parte superior que informa al usuario que está operando en "Modo Local" para que no haya confusiones sobre la sincronización en la nube.