import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { quickLogin, sessionToUser } from '../services/authService';
import {
  firebaseLogin, firebaseRegister, searchCandidates,
  mapFirebaseError, getFirebaseErrorCode, MatchCandidate,
} from '../services/firebaseAuthService';
import {
  LogIn, Eye, EyeOff, Shield, Users, MonitorPlay, Heart,
  Wifi, WifiOff, UserPlus, ChevronRight, Check, Clock,
} from 'lucide-react';
import { airtableIsActive } from '../services/airtableService';

// ─── Acceso rápido demo ───────────────────────────────────────────────────────

const QUICK_ROLES = [
  { role: UserRole.SUPER_ADMIN,      label: 'Pastor / Admin',  sub: 'Acceso total al sistema',    icon: Shield,      border: 'hover:border-[#004182]/40', iconColor: 'text-[#004182]' },
  { role: UserRole.SUPERVISORA,      label: 'Supervisora',     sub: 'Gestión de eje apostólico',  icon: Users,       border: 'hover:border-purple-300',   iconColor: 'text-purple-500' },
  { role: UserRole.LIDER_MINISTERIO, label: 'Developer / CSI', sub: 'Acceso total · Líder Medios',icon: MonitorPlay, border: 'hover:border-[#49D1C5]/60', iconColor: 'text-[#49D1C5]' },
  { role: UserRole.MIEMBRO,          label: 'Miembro',         sub: 'Vista de equipo de servicio',icon: Heart,       border: 'hover:border-emerald-300',  iconColor: 'text-emerald-500' },
];

// ─── SVG Logo TAFE ────────────────────────────────────────────────────────────

const TafeSvgLogo: React.FC<{ size?: number; white?: boolean }> = ({ size = 120, white = false }) => {
  const navy = white ? '#FFFFFF' : '#004182';
  const teal = '#49D1C5';
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 85 A65 65 0 1 1 160 85" stroke={teal} strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M50 70 Q100 58 150 70"  stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.4)'} strokeWidth="2" fill="none"/>
      <path d="M44 86 Q100 72 156 86"  stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.4)'} strokeWidth="2" fill="none"/>
      <path d="M100 22 Q115 55 112 88" stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.4)'} strokeWidth="2" fill="none"/>
      <path d="M100 22 Q85 55 88 88"   stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.4)'} strokeWidth="2" fill="none"/>
      <ellipse cx="100" cy="72" rx="16" ry="10" fill={teal} transform="rotate(-15 100 72)"/>
      <circle cx="115" cy="63" r="7" fill={teal}/>
      <path d="M121 63 L128 61 L121 65 Z" fill={teal}/>
      <path d="M96 68 Q72 48 60 58 Q78 62 88 75 Z" fill={teal}/>
      <path d="M104 68 Q125 46 140 54 Q122 60 112 75 Z" fill={teal}/>
      <path d="M86 78 Q78 95 70 88 Q82 88 90 82 Z" fill={teal}/>
      <path d="M100 108 Q70 100 38 108 Q45 130 70 135 Q88 136 100 128 Z" fill={teal} opacity="0.9"/>
      <path d="M100 108 Q130 100 162 108 Q155 130 130 135 Q112 136 100 128 Z" fill={teal} opacity="0.9"/>
      <path d="M100 108 L100 128" stroke={white ? 'rgba(255,255,255,0.6)' : 'rgba(0,65,130,0.3)'} strokeWidth="2"/>
      <path d="M60 118 Q78 115 98 118" stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.3)'} strokeWidth="1.5" fill="none"/>
      <path d="M58 125 Q78 122 98 125" stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.3)'} strokeWidth="1.5" fill="none"/>
      <path d="M102 118 Q122 115 140 118" stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.3)'} strokeWidth="1.5" fill="none"/>
      <path d="M102 125 Q122 122 142 125" stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.3)'} strokeWidth="1.5" fill="none"/>
      <text x="100" y="170" textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight="900" fontSize="28" letterSpacing="2">
        <tspan fill={navy}>T</tspan><tspan fill={teal}>A</tspan><tspan fill={navy}>F</tspan><tspan fill={teal}>E</tspan>
      </text>
      <text x="100" y="185" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="8" fill={white ? 'rgba(255,255,255,0.6)' : 'rgba(0,65,130,0.5)'} letterSpacing="0.5">
        Tabernáculo Apostólico de Fe
      </text>
    </svg>
  );
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoginProps { onLogin: (user: User) => void; }

type Tab  = 'login' | 'register';
type Step = 'form' | 'matching' | 'pending';

// ─── Componente ───────────────────────────────────────────────────────────────

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const isConnected = airtableIsActive();

  // Shared
  const [tab,      setTab]      = useState<Tab>('login');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [imgError, setImgError] = useState(false);

  // Login
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registro
  const [regName,     setRegName]     = useState('');
  const [regEmail,    setRegEmail]    = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStep,     setRegStep]     = useState<Step>('form');
  const [candidates,  setCandidates]  = useState<MatchCandidate[]>([]);
  const [selected,    setSelected]    = useState<string | null>(null); // recordId seleccionado

  const resetError = () => setError('');
  const switchTab  = (t: Tab) => { setTab(t); resetError(); setRegStep('form'); setSelected(null); };

  // ── Login Firebase ────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError(); setLoading(true);
    try {
      const session = await firebaseLogin(loginEmail.trim(), loginPassword);
      onLogin(sessionToUser(session));
    } catch (err) {
      setError(mapFirebaseError(getFirebaseErrorCode(err)));
    } finally {
      setLoading(false);
    }
  };

  // ── Registro: paso 1 — buscar candidatos en Airtable ─────────────────────

  const handleRegisterSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || regPassword.length < 6) {
      setError('Completa todos los campos. La contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    resetError(); setLoading(true);
    try {
      const found = await searchCandidates(regName.trim());
      setCandidates(found);
      setRegStep('matching');
    } catch {
      // Si falla la búsqueda, igualmente avanzar al paso matching vacío
      setCandidates([]);
      setRegStep('matching');
    } finally {
      setLoading(false);
    }
  };

  // ── Registro: paso 2 — confirmar y crear cuenta Firebase ─────────────────

  const handleRegisterConfirm = async (recordId?: string) => {
    resetError(); setLoading(true);
    try {
      const { session, isPending } = await firebaseRegister(
        regEmail.trim(), regPassword, regName.trim(), recordId
      );
      if (isPending) {
        setRegStep('pending');
      } else {
        onLogin(sessionToUser(session));
      }
    } catch (err) {
      const code = getFirebaseErrorCode(err);
      setError(mapFirebaseError(code));
      if (code === 'auth/email-already-in-use') setRegStep('form');
    } finally {
      setLoading(false);
    }
  };

  // ── Acceso rápido demo ────────────────────────────────────────────────────

  const handleQuickLogin = (role: UserRole) => {
    const session = quickLogin(role);
    onLogin(sessionToUser(session));
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const inputCls = 'w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-[#49D1C5] transition-shadow';
  const labelCls = 'text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5';
  const btnPrimaryCls = 'w-full py-4 bg-[#004182] text-white font-montserrat font-bold rounded-xl hover:bg-[#003068] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#004182]/20';

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-5">
      <div>
        <label className={labelCls}>Correo electrónico</label>
        <input type="email" placeholder="tu@correo.com" value={loginEmail}
          onChange={e => setLoginEmail(e.target.value)} className={inputCls}
          autoComplete="email" autoCapitalize="none" />
      </div>
      <div>
        <label className={labelCls}>Contraseña</label>
        <div className="relative">
          <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            className={`${inputCls} pr-12`} autoComplete="current-password" />
          <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm text-red-600 font-medium">{error}</div>}
      <button type="submit" disabled={loading || !loginEmail.trim() || !loginPassword.trim()} className={btnPrimaryCls}>
        <LogIn size={17}/>
        {loading ? 'Verificando...' : 'Ingresar al Sistema'}
      </button>
      <p className="text-center text-xs text-slate-400 pt-1">
        ¿Primera vez?{' '}
        <button type="button" onClick={() => switchTab('register')} className="text-[#004182] font-semibold hover:underline">
          Crear cuenta
        </button>
      </p>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegisterSearch} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-5">
      <div>
        <label className={labelCls}>Nombre completo</label>
        <input type="text" placeholder="Como aparece en el directorio" value={regName}
          onChange={e => setRegName(e.target.value)} className={inputCls} autoComplete="name" />
      </div>
      <div>
        <label className={labelCls}>Correo electrónico</label>
        <input type="email" placeholder="tu@correo.com" value={regEmail}
          onChange={e => setRegEmail(e.target.value)} className={inputCls}
          autoComplete="email" autoCapitalize="none" />
      </div>
      <div>
        <label className={labelCls}>Contraseña</label>
        <div className="relative">
          <input type={showPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={regPassword}
            onChange={e => setRegPassword(e.target.value)}
            className={`${inputCls} pr-12`} autoComplete="new-password" />
          <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm text-red-600 font-medium">{error}</div>}
      <button type="submit" disabled={loading || !regName.trim() || !regEmail.trim() || regPassword.length < 6} className={btnPrimaryCls}>
        <ChevronRight size={17}/>
        {loading ? 'Buscando perfil...' : 'Continuar'}
      </button>
      <p className="text-center text-xs text-slate-400 pt-1">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={() => switchTab('login')} className="text-[#004182] font-semibold hover:underline">
          Ingresar
        </button>
      </p>
    </form>
  );

  const renderMatching = () => (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-base">¿Estás en el directorio?</h3>
        <p className="text-xs text-slate-500 mt-1">
          {candidates.length > 0
            ? 'Encontramos estos perfiles — selecciona el tuyo para vincularlo a tu nueva cuenta:'
            : 'No encontramos tu nombre en el directorio. Puedes continuar igual y un admin aprobará tu acceso.'}
        </p>
      </div>

      {candidates.length > 0 && (
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {candidates.map(c => (
            <button key={c.recordId} type="button"
              onClick={() => setSelected(selected === c.recordId ? null : c.recordId)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                selected === c.recordId
                  ? 'border-[#49D1C5] bg-[#49D1C5]/5 ring-1 ring-[#49D1C5]'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected === c.recordId ? 'border-[#49D1C5] bg-[#49D1C5]' : 'border-slate-300'
                }`}>
                  {selected === c.recordId && <Check size={11} className="text-white"/>}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{c.nombre}</p>
                  {c.ministerio && <p className="text-[11px] text-slate-500 truncate">{c.ministerio} · {c.rol}</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm text-red-600 font-medium">{error}</div>}

      <div className="space-y-2">
        {selected && (
          <button onClick={() => handleRegisterConfirm(selected)} disabled={loading}
            className={btnPrimaryCls}>
            <Check size={17}/>
            {loading ? 'Creando cuenta...' : 'Soy yo — Vincular y continuar'}
          </button>
        )}
        <button onClick={() => handleRegisterConfirm(undefined)} disabled={loading}
          className={`w-full py-3.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-40 text-sm flex items-center justify-center gap-2`}>
          {loading ? 'Creando cuenta...' : selected ? 'No soy ninguno de estos' : 'No estoy en el directorio — continuar igual'}
        </button>
      </div>

      <button type="button" onClick={() => { setRegStep('form'); resetError(); }}
        className="text-xs text-slate-400 hover:text-slate-600 w-full text-center transition-colors">
        ← Volver
      </button>
    </div>
  );

  const renderPending = () => (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-center space-y-4">
      <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto">
        <Clock size={28} className="text-amber-500"/>
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-lg">Solicitud enviada</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Tu cuenta fue creada. Un administrador revisará tu perfil y te asignará acceso al sistema.
          Recibirás confirmación pronto.
        </p>
      </div>
      <p className="text-xs text-slate-400">
        Cuenta registrada como: <strong className="text-slate-600">{regEmail}</strong>
      </p>
      <button onClick={() => { setRegStep('form'); switchTab('login'); }}
        className="text-sm text-[#004182] font-semibold hover:underline">
        Ir al inicio de sesión
      </button>
    </div>
  );

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* Panel izquierdo */}
      <div className="hidden md:flex md:w-[45%] bg-[#004182] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/[0.03]"/>
        <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-[#49D1C5]/5"/>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#49D1C5]/8"/>
        <div className="relative z-10">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Sistema ERP Ministerial</p>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#49D1C5]/10 blur-2xl scale-150"/>
            {!imgError ? (
              <img src="/logo-tafe-circle.png" alt="TAFE" className="relative z-10 w-52 h-52 object-contain drop-shadow-2xl" onError={() => setImgError(true)}/>
            ) : (
              <div className="relative z-10 w-52 h-52 flex items-center justify-center"><TafeSvgLogo size={200} white/></div>
            )}
          </div>
          <div>
            <h1 className="text-white font-montserrat font-bold text-3xl leading-tight tracking-tight">
              Tabernáculo<br/><span className="text-[#49D1C5]">Apostólico</span> de Fe
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[#49D1C5]"/>
              <span className="text-white/70 text-[11px] font-bold uppercase tracking-[0.2em]">Torre de Control ERP</span>
            </div>
          </div>
          <div className="flex gap-8 mt-2">
            {[{ value:'7', label:'Ejes', color:'text-white' }, { value:'17', label:'Ministerios', color:'text-white' }, { value:'200+', label:'Miembros', color:'text-[#49D1C5]' }].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-2xl font-montserrat font-bold ${s.color}`}>{s.value}</p>
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            {isConnected
              ? <><Wifi size={11} className="text-emerald-400"/><span className="text-emerald-400 text-[10px] font-bold">Airtable conectado</span></>
              : <><WifiOff size={11} className="text-white/25"/><span className="text-white/25 text-[10px] font-bold">Modo local</span></>}
          </div>
          <p className="text-white/15 text-[10px]">iglesiatafe.com · 2026</p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Logo móvil */}
          <div className="md:hidden flex flex-col items-center gap-3 mb-8">
            {!imgError
              ? <img src="/logo-tafe.png" alt="TAFE" className="w-24 h-24 object-contain" onError={() => setImgError(true)}/>
              : <TafeSvgLogo size={96}/>}
            <div className="text-center">
              <h1 className="font-montserrat font-bold text-[#004182] text-xl">TAFE ERP</h1>
              <p className="text-slate-400 text-xs">Torre de Control</p>
            </div>
          </div>

          {/* Encabezado + tabs */}
          <div className="mb-6">
            <h2 className="text-3xl font-montserrat font-bold text-slate-800">Bienvenido</h2>
            <p className="text-slate-400 mt-1 text-sm">Sistema de gestión ministerial TAFE</p>

            {regStep === 'form' && (
              <div className="flex gap-1 mt-5 bg-slate-100 p-1 rounded-xl">
                {(['login', 'register'] as Tab[]).map(t => (
                  <button key={t} onClick={() => switchTab(t)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}>
                    {t === 'login' ? <><LogIn size={13}/> Ingresar</> : <><UserPlus size={13}/> Crear cuenta</>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Formulario activo */}
          {tab === 'login'    && renderLoginForm()}
          {tab === 'register' && regStep === 'form'     && renderRegisterForm()}
          {tab === 'register' && regStep === 'matching'  && renderMatching()}
          {tab === 'register' && regStep === 'pending'   && renderPending()}

          {/* Acceso rápido (dev) */}
          {regStep === 'form' && (
            <div className="mt-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-200"/>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Acceso Rápido · Demo</span>
                <div className="flex-1 h-px bg-slate-200"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ROLES.map(r => {
                  const Icon = r.icon;
                  return (
                    <button key={r.role} onClick={() => handleQuickLogin(r.role)}
                      className={`bg-white border border-slate-200 rounded-2xl p-4 text-left transition-all group cursor-pointer hover:shadow-md ${r.border}`}>
                      <Icon size={20} className={`mb-2 ${r.iconColor}`}/>
                      <p className="text-xs font-bold text-slate-800 leading-tight">{r.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{r.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-center text-[10px] text-slate-300 mt-6">TAFE ERP v2026 · Iglesia TAFE · iglesiatafe.com</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
