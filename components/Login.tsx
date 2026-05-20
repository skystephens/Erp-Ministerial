import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { attemptLogin, quickLogin, sessionToUser } from '../services/authService';
import { LogIn, Eye, EyeOff, Shield, Users, MonitorPlay, Heart, Wifi, WifiOff } from 'lucide-react';
import { airtableIsActive } from '../services/airtableService';

// ─── Tarjetas de acceso rápido demo ──────────────────────────────────────────

const QUICK_ROLES = [
  {
    role: UserRole.SUPER_ADMIN,
    label: 'Pastor / Admin',
    sub: 'Acceso total al sistema',
    icon: Shield,
    border: 'hover:border-[#004182]/40',
    iconColor: 'text-[#004182]',
    hint: 'pastor',
  },
  {
    role: UserRole.SUPERVISORA,
    label: 'Supervisora',
    sub: 'Gestión de eje apostólico',
    icon: Users,
    border: 'hover:border-purple-300',
    iconColor: 'text-purple-500',
    hint: 'liseth',
  },
  {
    role: UserRole.LIDER_MINISTERIO,
    label: 'Developer / CSI',
    sub: 'Acceso total · Líder Medios',
    icon: MonitorPlay,
    border: 'hover:border-[#49D1C5]/60',
    iconColor: 'text-[#49D1C5]',
    hint: 'sky',
  },
  {
    role: UserRole.MIEMBRO,
    label: 'Miembro',
    sub: 'Vista de equipo de servicio',
    icon: Heart,
    border: 'hover:border-emerald-300',
    iconColor: 'text-emerald-500',
    hint: 'miembro',
  },
];

// ─── SVG Logo TAFE (fallback si no existe el PNG) ─────────────────────────────

const TafeSvgLogo: React.FC<{ size?: number; white?: boolean }> = ({ size = 120, white = false }) => {
  const navy  = white ? '#FFFFFF' : '#004182';
  const teal  = '#49D1C5';
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Globe arc */}
      <path d="M40 85 A65 65 0 1 1 160 85" stroke={teal} strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Globe horizontal lines */}
      <path d="M50 70 Q100 58 150 70"  stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.4)'} strokeWidth="2" fill="none"/>
      <path d="M44 86 Q100 72 156 86"  stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.4)'} strokeWidth="2" fill="none"/>
      {/* Globe vertical lines */}
      <path d="M100 22 Q115 55 112 88" stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.4)'} strokeWidth="2" fill="none"/>
      <path d="M100 22 Q85 55 88 88"   stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.4)'} strokeWidth="2" fill="none"/>

      {/* Dove body */}
      <ellipse cx="100" cy="72" rx="16" ry="10" fill={teal} transform="rotate(-15 100 72)"/>
      {/* Dove head */}
      <circle cx="115" cy="63" r="7" fill={teal}/>
      {/* Dove beak */}
      <path d="M121 63 L128 61 L121 65 Z" fill={teal}/>
      {/* Dove left wing */}
      <path d="M96 68 Q72 48 60 58 Q78 62 88 75 Z" fill={teal}/>
      {/* Dove right wing */}
      <path d="M104 68 Q125 46 140 54 Q122 60 112 75 Z" fill={teal}/>
      {/* Dove tail */}
      <path d="M86 78 Q78 95 70 88 Q82 88 90 82 Z" fill={teal}/>

      {/* Open book - left page */}
      <path d="M100 108 Q70 100 38 108 Q45 130 70 135 Q88 136 100 128 Z" fill={teal} opacity="0.9"/>
      {/* Open book - right page */}
      <path d="M100 108 Q130 100 162 108 Q155 130 130 135 Q112 136 100 128 Z" fill={teal} opacity="0.9"/>
      {/* Book spine */}
      <path d="M100 108 L100 128" stroke={white ? 'rgba(255,255,255,0.6)' : 'rgba(0,65,130,0.3)'} strokeWidth="2"/>
      {/* Book lines left */}
      <path d="M60 118 Q78 115 98 118" stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.3)'} strokeWidth="1.5" fill="none"/>
      <path d="M58 125 Q78 122 98 125" stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.3)'} strokeWidth="1.5" fill="none"/>
      {/* Book lines right */}
      <path d="M102 118 Q122 115 140 118" stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.3)'} strokeWidth="1.5" fill="none"/>
      <path d="M102 125 Q122 122 142 125" stroke={white ? 'rgba(255,255,255,0.5)' : 'rgba(0,65,130,0.3)'} strokeWidth="1.5" fill="none"/>

      {/* TAFE text */}
      <text x="100" y="170" textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight="900" fontSize="28" letterSpacing="2">
        <tspan fill={navy}>T</tspan>
        <tspan fill={teal}>A</tspan>
        <tspan fill={navy}>F</tspan>
        <tspan fill={teal}>E</tspan>
      </text>
      {/* Subtitle */}
      <text x="100" y="185" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="8" fill={white ? 'rgba(255,255,255,0.6)' : 'rgba(0,65,130,0.5)'} letterSpacing="0.5">
        Tabernáculo Apostólico de Fe
      </text>
    </svg>
  );
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoginProps {
  onLogin: (user: User) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [imgError, setImgError]   = useState(false);
  const isConnected = airtableIsActive();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const session = attemptLogin(username, password);
      setLoading(false);
      if (!session) { setError('Usuario o contraseña incorrectos.'); return; }
      onLogin(sessionToUser(session));
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    const session = quickLogin(role);
    onLogin(sessionToUser(session));
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Panel izquierdo ─────────────────────────────────────────────────── */}
      <div className="hidden md:flex md:w-[45%] bg-[#004182] flex-col justify-between p-12 relative overflow-hidden">

        {/* Decoración geométrica de fondo */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/[0.03]" />
        <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-[#49D1C5]/5" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#49D1C5]/8" />

        {/* Header — texto pequeño top */}
        <div className="relative z-10">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">
            Sistema ERP Ministerial
          </p>
        </div>

        {/* Centro — logo prominente */}
        <div className="relative z-10 flex flex-col items-center text-center gap-6">

          {/* Logo: PNG real si existe, SVG como fallback */}
          <div className="relative">
            {/* Halo glow detrás del logo */}
            <div className="absolute inset-0 rounded-full bg-[#49D1C5]/10 blur-2xl scale-150" />
            {!imgError ? (
              <img
                src="/logo-tafe-circle.png"
                alt="TAFE"
                className="relative z-10 w-52 h-52 object-contain drop-shadow-2xl"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="relative z-10 w-52 h-52 flex items-center justify-center">
                <TafeSvgLogo size={200} white />
              </div>
            )}
          </div>

          {/* Nombre completo de la iglesia */}
          <div>
            <h1 className="text-white font-montserrat font-bold text-3xl leading-tight tracking-tight">
              Tabernáculo<br/>
              <span className="text-[#49D1C5]">Apostólico</span> de Fe
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[#49D1C5]" />
              <span className="text-white/70 text-[11px] font-bold uppercase tracking-[0.2em]">Torre de Control ERP</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-2">
            {[
              { value: '7',    label: 'Ejes',       color: 'text-white' },
              { value: '17',   label: 'Ministerios', color: 'text-white' },
              { value: '200+', label: 'Miembros',    color: 'text-[#49D1C5]' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-2xl font-montserrat font-bold ${s.color}`}>{s.value}</p>
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            {isConnected
              ? <><Wifi size={11} className="text-emerald-400" /><span className="text-emerald-400 text-[10px] font-bold">Airtable conectado</span></>
              : <><WifiOff size={11} className="text-white/25" /><span className="text-white/25 text-[10px] font-bold">Modo local</span></>
            }
          </div>
          <p className="text-white/15 text-[10px]">iglesiatafe.com · 2026</p>
        </div>
      </div>

      {/* ── Panel derecho (formulario) ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Logo móvil */}
          <div className="md:hidden flex flex-col items-center gap-3 mb-8">
            {!imgError ? (
              <img
                src="/logo-tafe.png"
                alt="TAFE"
                className="w-24 h-24 object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <TafeSvgLogo size={96} />
            )}
            <div className="text-center">
              <h1 className="font-montserrat font-bold text-[#004182] text-xl">TAFE ERP</h1>
              <p className="text-slate-400 text-xs">Torre de Control</p>
            </div>
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <h2 className="text-3xl font-montserrat font-bold text-slate-800">Bienvenido</h2>
            <p className="text-slate-400 mt-1.5 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-5">

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                placeholder="Ej: sky, pastor, liseth..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-[#49D1C5] transition-shadow"
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-[#49D1C5] pr-12 transition-shadow"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="w-full py-4 bg-[#004182] text-white font-montserrat font-bold rounded-xl hover:bg-[#003068] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#004182]/20"
            >
              <LogIn size={17} />
              {loading ? 'Verificando...' : 'Ingresar al Sistema'}
            </button>
          </form>

          {/* Acceso rápido */}
          <div className="mt-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Acceso Rápido
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {QUICK_ROLES.map(r => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.role}
                    onClick={() => handleQuickLogin(r.role)}
                    className={`bg-white border border-slate-200 rounded-2xl p-4 text-left transition-all group cursor-pointer hover:shadow-md ${r.border}`}
                  >
                    <Icon size={20} className={`mb-2 transition-colors ${r.iconColor}`} />
                    <p className="text-xs font-bold text-slate-800 leading-tight">{r.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{r.sub}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 bg-[#004182]/5 border border-[#004182]/10 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-[#004182] uppercase tracking-widest mb-1.5">Credenciales Demo</p>
              <p className="text-xs text-slate-600">
                Contraseña universal: <strong className="text-[#004182]">tafe2026</strong>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Usuarios: sky · pastor · liseth · martha · dario · miembro
              </p>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-300 mt-6">
            TAFE ERP v2026 · Iglesia TAFE · iglesiatafe.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
