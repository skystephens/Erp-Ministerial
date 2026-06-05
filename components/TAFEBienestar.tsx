import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../types';
import {
  airtableIsActive,
  getCasosBienestar, createCasoBienestar, updateCasoBienestar,
  getDonacionesBienestar, createDonacionBienestar,
  CasoBienestarFields, DonacionBienestarFields,
} from '../services/airtableService';
import {
  Heart, Stethoscope, ShoppingBasket, Home, HandCoins, Clock,
  ChevronRight, Check, AlertCircle, Loader, Download, Plus,
  Users, Calendar, Filter, ArrowRight, X,
} from 'lucide-react';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  verde:        '#1D9E75',
  verdeOscuro:  '#085041',
  verdeBg:      '#E1F5EE',
  dorado:       '#BA7517',
  doradoBg:     '#FAEEDA',
  coral:        '#D85A30',
  coralBg:      '#FAECE7',
  azul:         '#185FA5',
  azulBg:       '#E6F1FB',
  grisText:     '#5F5E5A',
  grisBg:       '#F8F7F4',
  grisLine:     'rgba(0,0,0,0.08)',
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
type TabId = 'servicios' | 'solicitar' | 'casos' | 'brigadas' | 'ministerios' | 'contribuir' | 'fondo';

interface CasoLocal {
  recordId?: string;
  casoId: string;
  nombre: string;
  situacion: string;
  eje: string;
  fecha: string;
  estado: 'Pendiente' | 'En proceso' | 'Cerrado';
  progreso: number;
  iniciales: string;
  color: keyof typeof COLORS;
}

interface DonStats { recaudado: number; pendiente: number; casosAbiertos: number; donantes: number; }

const COLORS = {
  verde:  { bg: C.verdeBg,  text: C.verdeOscuro },
  dorado: { bg: C.doradoBg, text: C.dorado },
  coral:  { bg: C.coralBg,  text: C.coral },
  azul:   { bg: C.azulBg,   text: C.azul },
};

const SAMPLE_CASOS: CasoLocal[] = [
  { casoId: 'TAF-047', nombre: 'Ana Jiménez',     situacion: 'Hospitalización · Apoyo económico para medicamentos', eje: 'E1', fecha: 'Hace 2 días',   estado: 'En proceso', progreso: 65,  iniciales: 'AJ', color: 'verde' },
  { casoId: 'TAF-046', nombre: 'Carlos Mendoza',  situacion: 'Calamidad doméstica · Daños en techo por lluvia',    eje: 'E3', fecha: 'Hace 3 días',   estado: 'Pendiente',  progreso: 10,  iniciales: 'CM', color: 'dorado' },
  { casoId: 'TAF-045', nombre: 'Rosa García',     situacion: 'Apoyo alimentario · 4 hijos menores',               eje: 'E5', fecha: 'Hace 5 días',   estado: 'En proceso', progreso: 80,  iniciales: 'RG', color: 'verde' },
  { casoId: 'TAF-044', nombre: 'Luis Torres',     situacion: 'Urgencia médica · Cirugía programada sin recursos',  eje: 'E2', fecha: 'Hace 1 semana', estado: 'En proceso', progreso: 45,  iniciales: 'LT', color: 'azul' },
  { casoId: 'TAF-043', nombre: 'María Ospina',    situacion: 'Medicamentos crónicos · Hipertensión',              eje: 'E4', fecha: 'Hace 1 semana', estado: 'Pendiente',  progreso: 20,  iniciales: 'MO', color: 'coral' },
  { casoId: 'TAF-042', nombre: 'Pedro Reyes',     situacion: 'Banco de tiempo · Reparación urgente fontanería',   eje: 'E6', fecha: 'Hace 2 semanas', estado: 'En proceso', progreso: 90, iniciales: 'PR', color: 'azul' },
  { casoId: 'TAF-041', nombre: 'Sandra López',    situacion: 'Apoyo económico temporal · Pérdida de empleo',      eje: 'E7', fecha: 'Hace 2 semanas', estado: 'Pendiente',  progreso: 5,  iniciales: 'SL', color: 'dorado' },
  { casoId: 'TAF-040', nombre: 'Familia Navarro', situacion: 'Mercado solidario · Enviados regularmente',         eje: 'E5', fecha: 'Hace 3 semanas', estado: 'Cerrado',   progreso: 100, iniciales: 'FN', color: 'verde' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const genCasoId = () => 'TAF-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900) + 100);
const genDonId  = () => 'DON-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<{ num: string; label: string; color?: string }> = ({ num, label, color }) => (
  <div className="text-center p-5 bg-white rounded-2xl border" style={{ borderColor: C.grisLine }}>
    <div className="text-3xl font-bold mb-1" style={{ color: color || C.verde, fontFamily: 'Montserrat, sans-serif' }}>{num}</div>
    <div className="text-xs" style={{ color: C.grisText }}>{label}</div>
  </div>
);

const Badge: React.FC<{ estado: string }> = ({ estado }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    'Pendiente':  { bg: C.doradoBg, text: C.dorado,      label: '🟡 Pendiente' },
    'En proceso': { bg: C.verdeBg,  text: C.verdeOscuro,  label: '🟢 En proceso' },
    'Cerrado':    { bg: '#F1EFE8',  text: '#5F5E5A',      label: '⚪ Cerrado' },
  };
  const s = map[estado] || map['Pendiente'];
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}>{s.label}</span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props { role: UserRole; }

const TAFEBienestar: React.FC<Props> = ({ role }) => {
  const [activeTab, setActiveTab]       = useState<TabId>('servicios');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [casos, setCasos]               = useState<CasoLocal[]>(SAMPLE_CASOS);
  const [loadingCasos, setLoadingCasos] = useState(false);
  const [modalCodigo, setModalCodigo]   = useState<string | null>(null);
  const [modalTitulo, setModalTitulo]   = useState('¡Solicitud recibida!');
  const [modalTexto,  setModalTexto]    = useState('El equipo de Diaconía revisará tu caso en las próximas 24-48 horas. Guarda este número de seguimiento:');
  const [donStats, setDonStats]         = useState<DonStats>({ recaudado: 0, pendiente: 0, casosAbiertos: 0, donantes: 0 });
  const [loadingFondo, setLoadingFondo] = useState(false);

  // Solicitud form
  const [solForm, setSolForm] = useState({
    tipoAyuda: 'Salud', nombre: '', cedula: '', telefono: '', barrio: '',
    eje: '', dependientes: 'Solo yo', descripcion: '', urgencia: 'Baja',
    tipoAyudaEsperada: '', monto: '',
  });

  // Donación form
  const [donTipo,    setDonTipo]    = useState<'Dinero' | 'Nequi' | 'Especie' | 'Servicio'>('Dinero');
  const [donMonto,   setDonMonto]   = useState('');
  const [donDestino, setDonDestino] = useState<'general' | 'caso'>('general');
  const [donCasoRef, setDonCasoRef] = useState('');
  const [donNombre,  setDonNombre]  = useState('');
  const [donEje,     setDonEje]     = useState('');
  const [donNotas,   setDonNotas]   = useState('');
  const [donAnonima, setDonAnonima] = useState(false);
  const [donMetodo,  setDonMetodo]  = useState('Efectivo');
  const [donEspecie, setDonEspecie] = useState('');
  const [donServicio, setDonServicio] = useState('');
  const [submittingDon, setSubmittingDon] = useState(false);

  const isAdmin = role === UserRole.SUPER_ADMIN || role === UserRole.SUPERVISORA;

  // ── Cargar casos desde Airtable ─────────────────────────────────────────────
  const cargarCasos = useCallback(async () => {
    if (!airtableIsActive()) return;
    setLoadingCasos(true);
    try {
      const records = await getCasosBienestar();
      if (records.length > 0) {
        const mapped: CasoLocal[] = records.map(r => ({
          recordId:  r.id,
          casoId:    r.fields.Caso_ID,
          nombre:    r.fields.Nombre_Solicitante,
          situacion: r.fields.Descripcion ?? '',
          eje:       r.fields.Eje_Solicitante ?? '',
          fecha:     r.fields.Fecha_Solicitud ?? '',
          estado:    (r.fields.Estado as CasoLocal['estado']) ?? 'Pendiente',
          progreso:  r.fields.Progreso ?? 0,
          iniciales: r.fields.Nombre_Solicitante.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          color:     'verde' as const,
        }));
        setCasos(mapped);
      }
    } catch { /* mantiene datos de ejemplo */ }
    finally { setLoadingCasos(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'casos') cargarCasos();
    if (activeTab === 'fondo') cargarFondo();
  }, [activeTab, cargarCasos]);

  // ── Cargar stats del fondo ─────────────────────────────────────────────────
  const cargarFondo = async () => {
    if (!airtableIsActive()) return;
    setLoadingFondo(true);
    try {
      const [donRecs, casosRec] = await Promise.all([
        getDonacionesBienestar(),
        getCasosBienestar(),
      ]);
      const recaudado  = donRecs.filter(d => d.fields.Estado_Verificacion === 'Verificado').reduce((s, d) => s + (d.fields.Monto_COP ?? 0), 0);
      const pendiente  = donRecs.filter(d => d.fields.Estado_Verificacion === 'Pendiente').reduce((s, d) => s + (d.fields.Monto_COP ?? 0), 0);
      const casosAb    = casosRec.filter(c => ['Pendiente', 'En proceso'].includes(c.fields.Estado ?? '')).length;
      const donantes   = new Set(donRecs.map(d => d.fields.Nombre_Donante).filter(Boolean)).size;
      setDonStats({ recaudado, pendiente, casosAbiertos: casosAb, donantes });
    } catch { /* sin datos */ }
    finally { setLoadingFondo(false); }
  };

  // ── Enviar solicitud ────────────────────────────────────────────────────────
  const enviarSolicitud = async () => {
    if (!solForm.nombre.trim() || !solForm.telefono.trim() || !solForm.descripcion.trim()) {
      alert('Completa los campos obligatorios: nombre, teléfono y descripción.');
      return;
    }
    const codigo = genCasoId();
    if (airtableIsActive()) {
      try {
        const fields: CasoBienestarFields = {
          Caso_ID:            codigo,
          Nombre_Solicitante: solForm.nombre,
          Telefono:           solForm.telefono,
          Barrio:             solForm.barrio,
          Tipo_Caso:          solForm.tipoAyuda,
          Descripcion:        solForm.descripcion,
          Urgencia:           solForm.urgencia,
          Tipo_Ayuda_Esperada: solForm.tipoAyudaEsperada || undefined,
          Monto_Solicitado:   solForm.monto ? Number(solForm.monto) : undefined,
          Eje_Solicitante:    solForm.eje || undefined,
          Dependientes:       solForm.dependientes,
          Estado:             'Pendiente',
          Progreso:           0,
          Fecha_Solicitud:    new Date().toISOString().split('T')[0],
        };
        await createCasoBienestar(fields);
      } catch (e) {
        console.warn('No se pudo guardar en Airtable:', e);
      }
    }
    setModalTitulo('¡Solicitud recibida!');
    setModalTexto('El equipo de Diaconía revisará tu caso en las próximas 24-48 horas. Guarda este número:');
    setModalCodigo(codigo);
    setSolForm({ tipoAyuda: 'Salud', nombre: '', cedula: '', telefono: '', barrio: '', eje: '', dependientes: 'Solo yo', descripcion: '', urgencia: 'Baja', tipoAyudaEsperada: '', monto: '' });
  };

  // ── Enviar donación ─────────────────────────────────────────────────────────
  const enviarDonacion = async () => {
    if (!donAnonima && !donNombre.trim()) { alert('Escribe tu nombre o marca la opción anónima.'); return; }
    if ((donTipo === 'Dinero' || donTipo === 'Nequi') && (!donMonto || Number(donMonto) <= 0)) { alert('Ingresa un monto mayor a $0.'); return; }
    setSubmittingDon(true);
    const donId = genDonId();
    try {
      const fields: DonacionBienestarFields = {
        Donacion_ID:       donId,
        Nombre_Donante:    donAnonima ? 'Anónimo' : donNombre.trim(),
        Monto_COP:         ['Dinero', 'Nequi'].includes(donTipo) ? Number(donMonto) : 0,
        Tipo_Donacion:     ['Dinero', 'Nequi'].includes(donTipo) ? 'Dinero' : donTipo,
        Metodo_Pago:       donMetodo,
        Eje_ID_Donante:    donEje || undefined,
        Caso_ID_Ref:       donDestino === 'caso' ? donCasoRef : undefined,
        Fecha_Donacion:    new Date().toISOString().split('T')[0],
        Notas:             donNotas || undefined,
        Estado_Verificacion: 'Pendiente',
        Anonima:           donAnonima,
      };
      if (airtableIsActive()) await createDonacionBienestar(fields);
      // Fallback localStorage
      const pending = JSON.parse(localStorage.getItem('tafe_don_pending') || '[]');
      pending.push({ donId, nombre: fields.Nombre_Donante, monto: donMonto, tipo: donTipo, fecha: new Date().toISOString() });
      localStorage.setItem('tafe_don_pending', JSON.stringify(pending));
    } catch { /* fallback silencioso */ }
    setModalTitulo('¡Gracias por tu corazón generoso!');
    setModalTexto('Tu contribución ha sido registrada. La Diaconía te confirmará la recepción.');
    setModalCodigo(donId);
    setDonNombre(''); setDonMonto(''); setDonNotas(''); setDonAnonima(false); setDonEje(''); setDonCasoRef('');
    setSubmittingDon(false);
  };

  const casosFiltrados = filtroEstado === 'todos' ? casos : casos.filter(c => c.estado === filtroEstado);

  // ── Render helper ────────────────────────────────────────────────────────────
  const tab = (id: TabId, label: string, adminOnly = false) => {
    if (adminOnly && !isAdmin) return null;
    return (
      <button
        key={id}
        onClick={() => setActiveTab(id)}
        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
          activeTab === id ? 'text-white shadow-sm' : 'hover:bg-slate-100'
        }`}
        style={activeTab === id ? { background: C.verde } : { color: C.grisText }}
      >
        {label}
      </button>
    );
  };

  const montoRapido = (m: number) => (
    <button
      key={m}
      onClick={() => setDonMonto(String(m))}
      className="px-4 py-2 rounded-full border text-sm font-medium transition-all"
      style={{
        borderColor: donMonto === String(m) ? C.verde : C.grisLine,
        background:  donMonto === String(m) ? C.verde : 'white',
        color:       donMonto === String(m) ? 'white' : '#1a1a18',
        fontFamily:  'Montserrat, sans-serif',
      }}
    >
      ${m.toLocaleString('es-CO')}
    </button>
  );

  const tipoOption = (val: string, label: string, emoji: string) => (
    <label
      key={val}
      className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all text-center text-xs font-medium"
      style={{
        borderColor: solForm.tipoAyuda === val ? C.verde : C.grisLine,
        background:  solForm.tipoAyuda === val ? C.verdeBg : C.grisBg,
        color:       solForm.tipoAyuda === val ? C.verdeOscuro : C.grisText,
      }}
    >
      <input type="radio" className="sr-only" checked={solForm.tipoAyuda === val}
        onChange={() => setSolForm(p => ({ ...p, tipoAyuda: val }))} />
      <span className="text-2xl">{emoji}</span>
      <span>{label}</span>
    </label>
  );

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: C.grisBg, fontFamily: "'Roboto', sans-serif" }}>

      {/* Modal de confirmación */}
      {modalCodigo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-10 text-center max-w-sm w-full mx-4 shadow-2xl animate-bounce-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: C.verdeBg }}>
              <Check size={28} style={{ color: C.verde }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a1a18' }}>{modalTitulo}</h3>
            <p className="text-sm mb-4" style={{ color: C.grisText }}>{modalTexto}</p>
            <div className="text-xl font-bold py-3 px-6 rounded-xl mb-5 tracking-widest"
              style={{ background: C.grisBg, color: C.verdeOscuro, fontFamily: 'Montserrat, sans-serif' }}>
              {modalCodigo}
            </div>
            <button onClick={() => setModalCodigo(null)}
              className="px-8 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
              style={{ background: C.verde }}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl mb-6 p-6 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${C.verdeOscuro} 0%, #0F6E56 100%)` }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Heart size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              TAFE Bienestar
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Sistema Comunitario de Apoyo · Diaconía E5
            </p>
          </div>
        </div>
        <div className="hidden md:block px-4 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
          Amáos los unos a los otros · Juan 13:34
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard num="47"  label="Casos atendidos este año" />
        <StatCard num="800" label="Miembros activos" />
        <StatCard num="12"  label="Brigadas realizadas" />
        <StatCard num="7"   label="Ejes ministeriales" color={C.azul} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-1.5 flex gap-1 flex-wrap mb-6 border" style={{ borderColor: C.grisLine }}>
        {tab('servicios',  '⚡ Servicios')}
        {tab('solicitar',  '🙏 Solicitar apoyo')}
        {tab('casos',      '📋 Casos activos')}
        {tab('brigadas',   '🩺 Brigadas de salud')}
        {tab('ministerios','👥 Ministerios')}
        {tab('contribuir', '💛 Contribuir')}
        {tab('fondo',      '📊 Fondo', true)}
      </div>

      {/* ═══ SERVICIOS ═══ */}
      {activeTab === 'servicios' && (
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a1a18' }}>¿Cómo podemos ayudarte?</h3>
            <p className="text-sm" style={{ color: C.grisText }}>La comunidad TAFE ofrece estos programas de apoyo integral</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              { icon: Stethoscope, title: 'Apoyo en salud',       desc: 'Coordinación de atención médica, medicamentos, transporte a citas y acompañamiento durante hospitalizaciones.', tag: 'Activo',        accent: C.verde,  tagBg: C.verdeBg,  tagText: C.verdeOscuro },
              { icon: Home,        title: 'Calamidad doméstica',   desc: 'Asistencia inmediata ante emergencias del hogar: daños, pérdida de bienes o situaciones que afecten el sustento.',  tag: 'Activo',        accent: C.dorado, tagBg: C.doradoBg, tagText: C.dorado },
              { icon: ShoppingBasket, title: 'Mercado y alimentación', desc: 'Red solidaria de donaciones en especie: alimentos, productos de primera necesidad y útiles escolares.',       tag: 'En crecimiento', accent: C.coral,  tagBg: C.coralBg,  tagText: C.coral },
              { icon: Stethoscope, title: 'Brigadas comunitarias', desc: 'Jornadas de salud preventiva con miembros profesionales: toma de presión, glucometría, orientación médica.',       tag: 'Próxima: Jul', accent: C.azul,   tagBg: C.azulBg,   tagText: C.azul },
              { icon: HandCoins,   title: 'Fondo de emergencia',   desc: 'Contribuciones voluntarias para apoyar a miembros en situación de crisis económica comprobada.',                  tag: 'Activo',        accent: C.verde,  tagBg: C.verdeBg,  tagText: C.verdeOscuro },
              { icon: Clock,       title: 'Banco de tiempo',       desc: 'Intercambio de habilidades y servicios entre miembros: transporte, cuidado de niños, reparaciones, trámites.',    tag: 'Beta',          accent: C.dorado, tagBg: C.doradoBg, tagText: C.dorado },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-2xl p-6 border cursor-pointer hover:shadow-md transition-all group"
                style={{ borderColor: C.grisLine, borderTopWidth: 3, borderTopColor: s.accent }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: s.tagBg }}>
                  <s.icon size={20} style={{ color: s.accent }} />
                </div>
                <h4 className="font-semibold mb-2 text-sm" style={{ color: '#1a1a18' }}>{s.title}</h4>
                <p className="text-xs leading-relaxed mb-3" style={{ color: C.grisText }}>{s.desc}</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: s.tagBg, color: s.tagText }}>{s.tag}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6"
            style={{ background: `linear-gradient(135deg, ${C.verdeOscuro}, #0F6E56)` }}>
            <div className="flex-1">
              <p className="text-lg italic mb-2" style={{ color: 'white', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
                "Cargad los unos las cargas de los otros, y cumplid así la ley de Cristo."
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Gálatas 6:2</p>
            </div>
            <button onClick={() => setActiveTab('solicitar')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all hover:scale-105"
              style={{ background: 'white', color: C.verdeOscuro }}>
              <Heart size={16} /> Pedir ayuda ahora
            </button>
          </div>
        </div>
      )}

      {/* ═══ SOLICITAR APOYO ═══ */}
      {activeTab === 'solicitar' && (
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Solicitar apoyo comunitario</h3>
            <p className="text-sm" style={{ color: C.grisText }}>Tu solicitud será revisada por el equipo de Diaconía con total discreción.</p>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: C.grisLine }}>
            <div className="p-6 flex items-center gap-4" style={{ background: C.verdeOscuro }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Heart size={22} className="text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Formulario de ayuda</h4>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Genera un caso con número de seguimiento · Respuesta: 24-48 horas</p>
              </div>
            </div>

            <div className="p-8">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.grisText }}>¿Qué tipo de apoyo necesitas?</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
                {tipoOption('Salud', 'Salud', '🩺')}
                {tipoOption('Calamidad', 'Calamidad', '🏠')}
                {tipoOption('Alimentacion', 'Alimentación', '🛒')}
                {tipoOption('Apoyo economico', 'Apoyo económico', '💰')}
                {tipoOption('Transporte', 'Transporte', '🚗')}
                {tipoOption('Otro', 'Otro', '···')}
              </div>

              <hr className="my-5" style={{ borderColor: C.grisLine }} />
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.grisText }}>Información del solicitante</p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {[
                  { label: 'Nombre completo *', key: 'nombre', placeholder: 'Tu nombre y apellido', type: 'text' },
                  { label: 'Cédula o ID', key: 'cedula', placeholder: 'Número de identificación', type: 'text' },
                  { label: 'Teléfono *', key: 'telefono', placeholder: '+57 313 000 0000', type: 'tel' },
                  { label: 'Barrio o sector', key: 'barrio', placeholder: 'Ej: El Cove, La Loma, San Luis', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>{f.label}</label>
                    <input type={f.type} value={(solForm as any)[f.key]} placeholder={f.placeholder}
                      onChange={e => setSolForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                      style={{ borderColor: C.grisLine, background: C.grisBg, color: '#1a1a18' }} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>Eje ministerial</label>
                  <select value={solForm.eje} onChange={e => setSolForm(p => ({ ...p, eje: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none bg-white"
                    style={{ borderColor: C.grisLine, color: '#1a1a18' }}>
                    <option value="">Selecciona...</option>
                    {['E1','E2','E3','E4','E5','E6','E7'].map(e => <option key={e} value={e}>{e}</option>)}
                    <option value="Ninguno">No pertenezco a ninguno</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>¿Cuántas personas dependen de ti?</label>
                  <select value={solForm.dependientes} onChange={e => setSolForm(p => ({ ...p, dependientes: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none bg-white"
                    style={{ borderColor: C.grisLine, color: '#1a1a18' }}>
                    {['Solo yo', '2-3 personas', '4-5 personas', 'Mas de 5'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>Describe tu situación *</label>
                  <textarea value={solForm.descripcion} rows={3}
                    placeholder="Explica brevemente qué está pasando. Esta información es confidencial."
                    onChange={e => setSolForm(p => ({ ...p, descripcion: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none resize-none"
                    style={{ borderColor: C.grisLine, background: C.grisBg, color: '#1a1a18' }} />
                </div>
              </div>

              <hr className="my-5" style={{ borderColor: C.grisLine }} />
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.grisText }}>Nivel de urgencia</p>
              <div className="flex gap-3 mb-6">
                {[
                  { val: 'Baja',  label: '🟢 Puede esperar', active: { bg: C.verdeBg, border: C.verde, text: C.verdeOscuro } },
                  { val: 'Media', label: '🟡 Esta semana',   active: { bg: C.doradoBg, border: C.dorado, text: C.dorado } },
                  { val: 'Alta',  label: '🔴 Urgente (hoy)', active: { bg: C.coralBg, border: C.coral, text: C.coral } },
                ].map(u => (
                  <button key={u.val} onClick={() => setSolForm(p => ({ ...p, urgencia: u.val }))}
                    className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                    style={solForm.urgencia === u.val
                      ? { background: u.active.bg, borderColor: u.active.border, color: u.active.text }
                      : { background: C.grisBg, borderColor: C.grisLine, color: C.grisText }}>
                    {u.label}
                  </button>
                ))}
              </div>

              <button onClick={enviarSolicitud}
                className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: C.verde, fontFamily: 'Montserrat, sans-serif' }}>
                <ArrowRight size={18} /> Enviar solicitud a Diaconía
              </button>
              <p className="text-center text-xs mt-3" style={{ color: C.grisText }}>
                🔒 Tu información es confidencial — solo la ve el equipo de Diaconía y el Pastor
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CASOS ACTIVOS ═══ */}
      {activeTab === 'casos' && (
        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h3 className="text-xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Casos activos</h3>
              <p className="text-sm" style={{ color: C.grisText }}>Panel de seguimiento · Vista para Diaconía y Super Admin</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { val: 'todos',      label: `Todos (${casos.length})` },
                { val: 'Pendiente',  label: `🟡 Pendientes (${casos.filter(c => c.estado === 'Pendiente').length})` },
                { val: 'En proceso', label: `🟢 En proceso (${casos.filter(c => c.estado === 'En proceso').length})` },
                { val: 'Cerrado',    label: `⚪ Cerrados (${casos.filter(c => c.estado === 'Cerrado').length})` },
              ].map(f => (
                <button key={f.val} onClick={() => setFiltroEstado(f.val)}
                  className="px-4 py-1.5 rounded-full text-xs border transition-all"
                  style={filtroEstado === f.val
                    ? { background: C.verde, color: 'white', borderColor: C.verde }
                    : { background: 'white', color: C.grisText, borderColor: C.grisLine }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loadingCasos ? (
            <div className="flex items-center justify-center py-20 gap-3" style={{ color: C.grisText }}>
              <Loader size={20} className="animate-spin" style={{ color: C.verde }} />
              <span className="text-sm">Cargando casos desde Airtable...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {casosFiltrados.map(c => {
                const col = COLORS[c.color];
                return (
                  <div key={c.casoId} className="bg-white rounded-2xl p-5 border flex gap-4 items-start hover:shadow-sm transition-all"
                    style={{ borderColor: C.grisLine }}>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-medium text-sm"
                      style={{ background: col.bg, color: col.text }}>{c.iniciales}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm" style={{ color: '#1a1a18' }}>{c.nombre}</span>
                        <span className="text-xs" style={{ color: C.grisText }}>· {c.casoId}</span>
                      </div>
                      <p className="text-xs mb-3" style={{ color: C.grisText }}>{c.situacion}</p>
                      <div className="flex justify-between text-xs mb-1" style={{ color: C.grisText }}>
                        <span>Avance del caso</span><span>{c.progreso}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E5E0' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${c.progreso}%`, background: C.verde }} />
                      </div>
                    </div>
                    <div className="shrink-0 text-right hidden md:block">
                      <div className="text-xs mb-1" style={{ color: C.grisText }}>{c.eje}</div>
                      <div className="text-xs mb-2" style={{ color: C.grisText }}>{c.fecha}</div>
                      <Badge estado={c.estado} />
                    </div>
                  </div>
                );
              })}
              {casosFiltrados.length === 0 && (
                <div className="text-center py-12" style={{ color: C.grisText }}>
                  <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No hay casos en esta categoría.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ BRIGADAS ═══ */}
      {activeTab === 'brigadas' && (
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Brigadas de salud comunitaria</h3>
            <p className="text-sm" style={{ color: C.grisText }}>Miembros profesionales de la salud que ofrecen su tiempo a la comunidad</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              {
                tipo: 'Próxima', tipoColor: C.verde, tag: 'Inscripción abierta', tagBg: C.verdeBg, tagText: C.verdeOscuro,
                titulo: 'Brigada de Salud General',
                desc: 'Toma de signos vitales, glucometría, orientación nutricional y consulta con médico voluntario.',
                fecha: 'Sábado 19 de julio · 8:00 AM – 12:00 PM · Sede TAFE',
                voluntarios: ['MP', 'CR', 'JS'], vColors: [C.verdeBg, C.azulBg, C.doradoBg],
                ctaLabel: 'Unirme como voluntario', ctaActive: true,
              },
              {
                tipo: 'Planificando', tipoColor: C.azul, tag: 'Buscando voluntarios', tagBg: C.azulBg, tagText: C.azul,
                titulo: 'Brigada Odontológica',
                desc: 'Revisión bucodental y orientación de higiene oral para niños y adultos. Se priorizará familias de escasos recursos.',
                fecha: 'Agosto 2026 · Fecha por confirmar',
                voluntarios: ['LM'], vColors: [C.azulBg],
                ctaLabel: 'Ofrecerme como voluntario', ctaActive: true,
              },
              {
                tipo: 'Completada', tipoColor: C.coral, tag: '24 personas atendidas', tagBg: C.coralBg, tagText: C.coral,
                titulo: 'Brigada Preventiva – Junio',
                desc: 'Primera brigada de la congregación. Toma de presión, peso y talla. Orientación sobre enfermedades tropicales.',
                fecha: 'Sábado 7 de junio 2025 · Realizada',
                voluntarios: ['GZ', 'MP', 'EL'], vColors: [C.coralBg, C.verdeBg, C.doradoBg],
                ctaLabel: 'Ver informe', ctaActive: false,
              },
              {
                tipo: 'Nueva', tipoColor: C.grisText, tag: 'Proponer', tagBg: C.grisBg, tagText: C.grisText,
                titulo: 'Proponer nueva brigada',
                desc: '¿Eres profesional de la salud? Organiza una jornada con tu equipo y la comunidad TAFE.',
                fecha: '',
                voluntarios: [], vColors: [],
                ctaLabel: 'Proponer brigada', ctaActive: true,
              },
            ].map(b => (
              <div key={b.titulo} className="bg-white rounded-2xl p-6 border" style={{ borderColor: C.grisLine }}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: b.tipoColor }}>● {b.tipo}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: b.tagBg, color: b.tagText }}>{b.tag}</span>
                </div>
                <h4 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a1a18' }}>{b.titulo}</h4>
                <p className="text-xs leading-relaxed mb-4" style={{ color: C.grisText }}>{b.desc}</p>
                {b.voluntarios.length > 0 && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex">
                      {b.voluntarios.map((v, i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium -ml-2 first:ml-0"
                          style={{ background: b.vColors[i] }}>{v}</div>
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: C.grisText }}>{b.voluntarios.length} voluntario(s)</span>
                  </div>
                )}
                {b.fecha && (
                  <div className="flex items-center gap-2 text-xs mb-4" style={{ color: C.grisText }}>
                    <Calendar size={12} style={{ color: C.verde }} /> {b.fecha}
                  </div>
                )}
                <button className={`w-full py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${b.ctaActive ? 'hover:opacity-90' : 'opacity-50 cursor-default'}`}
                  style={b.ctaActive ? { borderColor: C.verde, color: C.verde } : { borderColor: C.grisLine, color: C.grisText }}>
                  {b.ctaLabel}
                </button>
              </div>
            ))}
          </div>

          {/* Profesionales de salud */}
          <h4 className="font-semibold text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a1a18' }}>
            Profesionales de salud en la membresía
          </h4>
          <div className="mb-3 p-4 rounded-xl border flex gap-3 items-start"
            style={{ background: C.doradoBg, borderColor: 'rgba(186,117,23,0.2)' }}>
            <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: C.dorado }} />
            <p className="text-xs leading-relaxed" style={{ color: C.dorado }}>
              Esta sección se sincroniza con el campo <strong>"Profesión"</strong> en Airtable CRM. Los datos mostrados son de ejemplo.
            </p>
          </div>
          <div className="space-y-2">
            {[
              { ini: 'MP', nombre: 'Martha Porras',    rol: 'Enfermera profesional · Líder Eje E5', tag: 'Disponible brigadas', tagBg: C.verdeBg, tagText: C.verdeOscuro, bg: C.verdeBg, text: C.verdeOscuro },
              { ini: 'CR', nombre: 'Claudia Rodríguez', rol: 'Médico general · Miembro activo',    tag: 'Brigadas y urgencias', tagBg: C.azulBg, tagText: C.azul, bg: C.azulBg, text: C.azul },
              { ini: 'JS', nombre: 'Juan Sandoval',    rol: 'Bacteriólogo · Miembro activo',        tag: 'Laboratorio clínico', tagBg: C.doradoBg, tagText: C.dorado, bg: C.doradoBg, text: C.dorado },
            ].map(p => (
              <div key={p.nombre} className="bg-white rounded-xl p-4 border flex items-center justify-between gap-4"
                style={{ borderColor: C.grisLine }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ background: p.bg, color: p.text }}>{p.ini}</div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1a1a18' }}>{p.nombre}</p>
                    <p className="text-xs" style={{ color: C.grisText }}>{p.rol}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium shrink-0"
                  style={{ background: p.tagBg, color: p.tagText }}>{p.tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MINISTERIOS ═══ */}
      {activeTab === 'ministerios' && (
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Ejes ministeriales y liderazgo</h3>
            <p className="text-sm" style={{ color: C.grisText }}>Los 7 Ejes Apostólicos · Cada eje articula al sistema de bienestar</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { eje: 'E1', nombre: 'Adoración y Alabanza',    lidera: 'Martha Porras',       bg: C.verdeBg, text: C.verdeOscuro, activo: false },
              { eje: 'E2', nombre: 'Evangelismo y Misiones',  lidera: 'M. Mónica Bujato',    bg: C.azulBg,  text: C.azul,        activo: false },
              { eje: 'E3', nombre: 'Discipulado y Educación', lidera: 'Guillermina Martínez', bg: C.doradoBg, text: C.dorado,    activo: false },
              { eje: 'E4', nombre: 'Intercesión y Oración',   lidera: 'Claudia de la Oz',    bg: C.coralBg, text: C.coral,       activo: false },
              { eje: 'E5', nombre: 'Diaconía y Servicio',     lidera: 'Liseth Lever',         bg: C.verde,   text: 'white',       activo: true  },
              { eje: 'E6', nombre: 'Comunicación y Medios',   lidera: 'Luz Elena Pretel',    bg: '#F1EFE8', text: '#5F5E5A',     activo: false },
              { eje: 'E7', nombre: 'Ministerio de Jóvenes',   lidera: 'Zuleima Sandoval',    bg: C.azulBg,  text: C.azul,        activo: false },
              { eje: '+', nombre: 'Pastor principal',          lidera: 'Pr. David Lever',     bg: C.grisBg,  text: C.grisText,    activo: false },
            ].map(m => (
              <div key={m.eje}
                className={`bg-white rounded-2xl p-5 border text-center transition-all hover:shadow-md cursor-pointer relative ${m.activo ? 'border-2' : ''}`}
                style={{ borderColor: m.activo ? C.verde : C.grisLine }}>
                {m.activo && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: C.verde, color: 'white' }}>Este módulo</div>
                )}
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg"
                  style={{ background: m.bg, color: m.text, fontFamily: 'Montserrat, sans-serif' }}>{m.eje}</div>
                <h4 className="text-xs font-medium mb-1 leading-snug" style={{ color: '#1a1a18' }}>{m.nombre}</h4>
                <p className="text-xs" style={{ color: C.grisText }}>{m.lidera}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: C.grisLine }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.grisText }}>¿Cómo articula cada eje al sistema de bienestar?</p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { icon: '👥', title: 'Red de contacto', body: 'Cada líder de eje conoce a sus miembros y puede detectar necesidades antes de que se vuelvan crisis.', color: C.verde },
                { icon: '💛', title: 'Ofrenda dirigida', body: 'Fondos de ofrendas de amor canalizados a través del ERP con trazabilidad y transparencia.', color: C.dorado },
                { icon: '🩺', title: 'Brigadas sectoriales', body: 'Brigadas específicas por eje: jóvenes, mujeres, adultos mayores — cada uno con sus necesidades particulares.', color: C.azul },
                { icon: '🙏', title: 'Red de intercesión', body: 'E4 activa la cobertura espiritual sobre cada caso registrado — con consentimiento del solicitante.', color: C.coral },
              ].map(i => (
                <div key={i.title} className="p-4 rounded-xl" style={{ background: C.grisBg }}>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1a1a18' }}>{i.icon} {i.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: C.grisText }}>{i.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONTRIBUIR ═══ */}
      {activeTab === 'contribuir' && (
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Contribuir al fondo de bienestar</h3>
            <p className="text-sm" style={{ color: C.grisText }}>Adicional al diezmo. Cada aporte bendice a una familia de nuestra comunidad.</p>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border mb-6" style={{ borderColor: C.grisLine }}>
            <div className="p-6 flex items-center gap-4" style={{ background: C.verdeOscuro }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <HandCoins size={22} className="text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Registrar mi contribución</h4>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Adicional al diezmo · Tu aporte va directo al fondo comunitario</p>
              </div>
            </div>

            <div className="p-8">
              {/* Tipo de donación */}
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.grisText }}>¿Qué quieres donar?</p>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {([['Dinero','💵','Dinero en efectivo'], ['Nequi','📱','Nequi / digital'], ['Especie','🛒','En especie'], ['Servicio','🤝','Servicio / tiempo']] as const).map(([val, icon, label]) => (
                  <button key={val} onClick={() => setDonTipo(val)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-xs font-medium transition-all"
                    style={donTipo === val
                      ? { borderColor: C.verde, background: C.verdeBg, color: C.verdeOscuro }
                      : { borderColor: C.grisLine, background: C.grisBg, color: C.grisText }}>
                    <span className="text-xl">{icon}</span><span>{label}</span>
                  </button>
                ))}
              </div>

              {(donTipo === 'Dinero' || donTipo === 'Nequi') && (
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.grisText }}>Monto a donar (COP)</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[5000, 10000, 20000, 30000, 50000, 100000].map(m => montoRapido(m))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>O escribe el monto exacto</label>
                      <input type="number" value={donMonto} onChange={e => setDonMonto(e.target.value)}
                        placeholder="Ej: 25000" className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                        style={{ borderColor: C.grisLine, background: C.grisBg, color: C.verdeOscuro, fontWeight: 500 }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>Método de pago</label>
                      <select value={donMetodo} onChange={e => setDonMetodo(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none bg-white"
                        style={{ borderColor: C.grisLine, color: '#1a1a18' }}>
                        <option value="Efectivo">💵 Efectivo (al tesorero)</option>
                        <option value="Nequi">📱 Nequi</option>
                        <option value="Bancolombia">🏦 Bancolombia</option>
                        <option value="Daviplata">📱 Daviplata</option>
                      </select>
                    </div>
                  </div>
                  {donTipo === 'Nequi' && (
                    <div className="mt-3 p-4 rounded-xl border text-xs leading-relaxed"
                      style={{ background: C.azulBg, borderColor: 'rgba(24,95,165,0.2)', color: C.azul }}>
                      <strong>ℹ Instrucciones de transferencia</strong><br/>
                      Nequi / Daviplata: <strong>315 000 0000</strong> · Iglesia TAFE<br/>
                      Bancolombia: <strong>123-456789-00</strong> · Concepto: "Fondo Bienestar"
                    </div>
                  )}
                </div>
              )}

              {donTipo === 'Especie' && (
                <div className="mb-5">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>¿Qué vas a donar? *</label>
                  <textarea value={donEspecie} onChange={e => setDonEspecie(e.target.value)} rows={3}
                    placeholder="Ej: 2 bolsas de arroz 5kg, 1 caja de leche..."
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none resize-none"
                    style={{ borderColor: C.grisLine, background: C.grisBg, color: '#1a1a18' }} />
                </div>
              )}

              {donTipo === 'Servicio' && (
                <div className="mb-5">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>¿Qué servicio ofreces? *</label>
                  <textarea value={donServicio} onChange={e => setDonServicio(e.target.value)} rows={3}
                    placeholder="Ej: Transporte con mi carro para llevar a una persona a cita médica..."
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none resize-none"
                    style={{ borderColor: C.grisLine, background: C.grisBg, color: '#1a1a18' }} />
                </div>
              )}

              <hr className="my-5" style={{ borderColor: C.grisLine }} />

              {/* ¿Para quién? */}
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.grisText }}>¿Es para un caso específico?</p>
              <div className="flex gap-3 mb-4">
                {[
                  { val: 'general', label: '🤝 Fondo general' },
                  { val: 'caso',    label: '🎯 Para un caso específico' },
                ].map(d => (
                  <button key={d.val} onClick={() => setDonDestino(d.val as any)}
                    className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                    style={donDestino === d.val
                      ? { background: C.verdeBg, borderColor: C.verde, color: C.verdeOscuro }
                      : { background: C.grisBg, borderColor: C.grisLine, color: C.grisText }}>
                    {d.label}
                  </button>
                ))}
              </div>
              {donDestino === 'caso' && (
                <div className="mb-4">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>Número de caso (TAF-XXXX-XXX)</label>
                  <input type="text" value={donCasoRef} onChange={e => setDonCasoRef(e.target.value.toUpperCase())}
                    placeholder="Ej: TAF-2025-047" className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: C.grisLine, background: C.grisBg, color: '#1a1a18', letterSpacing: '1px' }} />
                </div>
              )}

              <hr className="my-5" style={{ borderColor: C.grisLine }} />

              {/* Tu info */}
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.grisText }}>¿Quién contribuye?</p>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>Tu nombre</label>
                  <input type="text" value={donNombre} onChange={e => setDonNombre(e.target.value)}
                    placeholder="Nombre completo" disabled={donAnonima}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: C.grisLine, background: donAnonima ? '#F1EFE8' : C.grisBg, color: '#1a1a18' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>Tu eje ministerial</label>
                  <select value={donEje} onChange={e => setDonEje(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm bg-white"
                    style={{ borderColor: C.grisLine, color: '#1a1a18' }}>
                    <option value="">Selecciona...</option>
                    {['E1','E2','E3','E4','E5','E6','E7'].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a18' }}>Mensaje (opcional)</label>
                  <input type="text" value={donNotas} onChange={e => setDonNotas(e.target.value)}
                    placeholder="Ej: Con amor para quien más lo necesite..." className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: C.grisLine, background: C.grisBg, color: '#1a1a18' }} />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl mb-5" style={{ background: C.grisBg }}>
                <input type="checkbox" id="anonima" checked={donAnonima} onChange={e => setDonAnonima(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: C.verde, cursor: 'pointer' }} />
                <label htmlFor="anonima" className="text-sm cursor-pointer" style={{ color: '#1a1a18' }}>
                  Registrar de forma anónima <span className="text-xs" style={{ color: C.grisText }}>(solo Diaconía sabrá quién eres)</span>
                </label>
              </div>

              {/* Resumen + submit */}
              <div className="rounded-xl p-6 flex items-center justify-between flex-wrap gap-4"
                style={{ background: C.verdeOscuro }}>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Mi contribución</p>
                  <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {donTipo === 'Especie' ? 'En especie' : donTipo === 'Servicio' ? 'Servicio' : donMonto ? `$${Number(donMonto).toLocaleString('es-CO')} COP` : '$0 COP'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {donTipo === 'Nequi' ? 'Digital' : donTipo} · {donDestino === 'general' ? 'Fondo general' : 'Caso específico'}
                  </p>
                </div>
                <button onClick={enviarDonacion} disabled={submittingDon}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-sm transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: 'white', color: C.verdeOscuro }}>
                  {submittingDon ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                  Registrar contribución
                </button>
              </div>
              <p className="text-center text-xs mt-3" style={{ color: C.grisText }}>
                🔒 Tu contribución queda registrada con número de seguimiento. La Diaconía confirmará su recepción.
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-7 flex items-center justify-between gap-5 flex-wrap"
            style={{ background: C.verdeOscuro }}>
            <p className="text-base italic flex-1" style={{ color: 'white', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
              "El que siembra escasamente, también segará escasamente; y el que siembra generosamente, también segará generosamente."
              <span className="block text-xs not-italic mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>2 Corintios 9:6</span>
            </p>
            <button onClick={() => setActiveTab('casos')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ background: 'white', color: C.verdeOscuro }}>
              <Heart size={15} /> Ver casos activos
            </button>
          </div>
        </div>
      )}

      {/* ═══ FONDO (solo admin) ═══ */}
      {activeTab === 'fondo' && isAdmin && (
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Fondo comunitario · Transparencia</h3>
            <p className="text-sm" style={{ color: C.grisText }}>Panel Super Admin y líder de Diaconía · Cifras desde Airtable</p>
          </div>

          {loadingFondo ? (
            <div className="flex items-center justify-center py-20 gap-3" style={{ color: C.grisText }}>
              <Loader size={20} className="animate-spin" style={{ color: C.verde }} />
              <span className="text-sm">Conectando con Airtable...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard num={`$${donStats.recaudado.toLocaleString('es-CO')}`} label="Total verificado" />
                <StatCard num={`$${donStats.pendiente.toLocaleString('es-CO')}`} label="Pendiente verificar" color={C.dorado} />
                <StatCard num={String(donStats.casosAbiertos)} label="Casos abiertos" color={C.coral} />
                <StatCard num={String(donStats.donantes)} label="Donantes activos" color={C.azul} />
              </div>

              <div className="bg-white rounded-2xl p-6 border mb-4" style={{ borderColor: C.grisLine }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.grisText }}>
                  {airtableIsActive() ? '✅ Conectado a Airtable' : '⚠ Sin conexión a Airtable — mostrando datos locales'}
                </p>
                <p className="text-sm" style={{ color: C.grisText }}>
                  Tablas: <strong>[BIE] Casos_Bienestar</strong> y <strong>[FIN] Donaciones_Bienestar</strong> en base appB689oQuHCzcgXH
                </p>
              </div>

              {!airtableIsActive() && (
                <div className="p-4 rounded-xl border flex gap-3" style={{ background: C.doradoBg, borderColor: 'rgba(186,117,23,0.2)' }}>
                  <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: C.dorado }} />
                  <p className="text-xs leading-relaxed" style={{ color: C.dorado }}>
                    Agrega <code>VITE_AIRTABLE_API_KEY</code> en el archivo <code>.env</code> para ver datos en tiempo real desde Airtable.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TAFEBienestar;
