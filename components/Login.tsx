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
    colorClass: 'group-hover:text-[#004182]',
    hint: 'pastor',
  },
  {
    role: UserRole.SUPERVISORA,
    label: 'Supervisora',
    sub: 'Gestión de eje apostólico',
    icon: Users,
    colorClass: 'group-hover:text-purple-600',
    hint: 'liseth',
  },
  {
    role: UserRole.LIDER_MINISTERIO,
    label: 'Developer / CSI',
    sub: 'Acceso total · Líder Medios',
    icon: MonitorPlay,
    colorClass: 'group-hover:text-[#49D1C5]',
    hint: 'sky',
  },
  {
    role: UserRole.MIEMBRO,
    label: 'Miembro',
    sub: 'Vista de equipo de servicio',
    icon: Heart,
    colorClass: 'group-hover:text-emerald-600',
    hint: 'miembro',
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoginProps {
  onLogin: (user: User) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isConnected = airtableIsActive();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const session = attemptLogin(username, password);
      setLoading(false);
      if (!session) {
        setError('Usuario o contraseña incorrectos.');
        return;
      }
      onLogin(sessionToUser(session));
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    const session = quickLogin(role);
    onLogin(sessionToUser(session));
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Panel izquierdo (branding) ───────────────────────────────────── */}
      <div className="hidden md:flex md:w-[42%] bg-[#004182] flex-col justify-between p-12 relative overflow-hidden">

        {/* Decoración de fondo */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-[#49D1C5]/10" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#49D1C5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h1 className="text-white font-montserrat font-bold text-xl tracking-tight">TAFE ERP</h1>
            <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">Torre de Control</p>
          </div>
        </div>

        {/* Contenido central */}
        <div className="relative z-10">
          <div className="mb-6">
            <p className="text-[#49D1C5] text-[10px] font-bold uppercase tracking-widest mb-3">Sistema ERP Ministerial</p>
            <h2 className="text-5xl font-montserrat font-bold text-white leading-tight">
              Gobierno<br/>del <span className="text-[#49D1C5]">Reino</span>
            </h2>
          </div>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Coordina los 7 ejes apostólicos, el equipo de medios y la congregación de Iglesia TAFE en un solo sistema.
          </p>

          {/* Stats decorativos */}
          <div className="flex gap-6 mt-8">
            <div>
              <p className="text-2xl font-bold font-montserrat text-white">7</p>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mt-0.5">Ejes</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-montserrat text-white">17</p>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mt-0.5">Ministerios</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-montserrat text-[#49D1C5]">200+</p>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mt-0.5">Miembros</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            {isConnected
              ? <><Wifi size={12} className="text-emerald-400" /><span className="text-emerald-400 text-[10px] font-bold">Airtable conectado</span></>
              : <><WifiOff size={12} className="text-white/30" /><span className="text-white/30 text-[10px] font-bold">Modo local (sin Airtable)</span></>
            }
          </div>
          <p className="text-white/20 text-[10px]">Iglesia TAFE · iglesiatafe.com · Versión 2026</p>
        </div>
      </div>

      {/* ── Panel derecho (formulario) ───────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">

          {/* Logo móvil */}
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="bg-[#004182] p-2.5 rounded-xl">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#49D1C5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <h1 className="font-montserrat font-bold text-[#004182] text-lg">TAFE ERP</h1>
              <p className="text-slate-400 text-xs">Torre de Control</p>
            </div>
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <h2 className="text-3xl font-montserrat font-bold text-slate-800">Bienvenido</h2>
            <p className="text-slate-500 mt-1.5 text-sm">Inicia sesión para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-5">

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                placeholder="Ej: sky, pastor, martha..."
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
              className="w-full py-4 bg-[#004182] text-white font-bold rounded-xl hover:bg-[#49D1C5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <LogIn size={17} />
              {loading ? 'Verificando...' : 'Ingresar al Sistema'}
            </button>
          </form>

          {/* Acceso rápido demo */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Acceso Rápido Demo
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
                    className="bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-[#49D1C5]/60 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <Icon size={20} className={`text-slate-400 mb-2 transition-colors ${r.colorClass}`} />
                    <p className="text-xs font-bold text-slate-800 leading-tight">{r.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{r.sub}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Credenciales Demo</p>
              <p className="text-xs text-amber-700">
                Usuario: <strong>sky</strong> / Contraseña: <strong>tafe2026</strong>
              </p>
              <p className="text-[10px] text-amber-600 mt-1">
                También: pastor · liseth · martha · dario · miembro
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
