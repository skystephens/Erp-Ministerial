import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import Login from './Login';
import {
  Menu, X, ChevronRight, ArrowRight,
  Heart, Users, Zap, BookOpen, Music2, Settings, Target,
  MapPin, Phone, MessageCircle, Check,
} from 'lucide-react';

// ─── Axes data ────────────────────────────────────────────────────────────────
const AXES = [
  { id: 'E1', name: 'Evangelismo',       desc: 'Alcanzando almas en cada barrio de la isla',         icon: Target,    color: '#e11d48' },
  { id: 'E2', name: 'Discipulado',       desc: 'Formación integral en la Palabra de Dios',           icon: BookOpen,  color: '#7c3aed' },
  { id: 'E3', name: 'Consolidación',     desc: 'Acompañando el crecimiento de nuevos creyentes',     icon: Users,     color: '#0369a1' },
  { id: 'E4', name: 'Misericordia',      desc: 'Servicio comunitario y bienestar familiar',          icon: Heart,     color: '#15803d' },
  { id: 'E5', name: 'Alabanza & AV',     desc: 'Adoración y producción multimedia ministerial',      icon: Music2,    color: '#b45309' },
  { id: 'E6', name: 'Administración',    desc: 'Gestión ordenada de los recursos del ministerio',    icon: Settings,  color: '#374151' },
  { id: 'E7', name: 'Oración',           desc: 'Intercesión y cobertura espiritual de la comunidad', icon: Zap,       color: '#9f1239' },
];

// ─── Form types ───────────────────────────────────────────────────────────────
interface ProspectoForm { nombre: string; telefono: string; zona: string; origen: string; }

// ─── LandingPage ──────────────────────────────────────────────────────────────
const LandingPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [showLogin,  setShowLogin]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [form, setForm] = useState<ProspectoForm>({ nombre: '', telefono: '', zona: '', origen: '' });
  const [submitted, setSubmitted]   = useState(false);

  const inicioRef      = useRef<HTMLElement>(null);
  const quienesRef     = useRef<HTMLElement>(null);
  const evangelismoRef = useRef<HTMLElement>(null);
  const liderazgoRef   = useRef<HTMLElement>(null);
  const bienestarRef   = useRef<HTMLElement>(null);
  const conectateRef   = useRef<HTMLElement>(null);

  const refsMap: Record<string, React.RefObject<HTMLElement | null>> = {
    inicio: inicioRef, quienes: quienesRef,
    evangelismo: evangelismoRef, liderazgo: liderazgoRef,
    bienestar: bienestarRef, conectate: conectateRef,
  };

  const scrollTo = (key: string) => {
    refsMap[key]?.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.35 }
    );
    Object.values(refsMap).forEach(r => { if (r.current) observer.observe(r.current); });
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing: any[] = JSON.parse(localStorage.getItem('tafe_prospectos_v1') || '[]');
    existing.push({ ...form, fecha: new Date().toISOString() });
    localStorage.setItem('tafe_prospectos_v1', JSON.stringify(existing));
    setSubmitted(true);
  };

  const navLinks = [
    { key: 'inicio',      label: 'Inicio' },
    { key: 'quienes',     label: 'Quiénes Somos' },
    { key: 'evangelismo', label: 'Evangelismo' },
    { key: 'liderazgo',   label: 'Liderazgo' },
    { key: 'bienestar',   label: 'Bienestar' },
    { key: 'conectate',   label: 'Conéctate' },
  ];

  return (
    <>
      {/* ── Login modal ───────────────────────────────────────────────────────── */}
      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,8,20,0.92)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 z-50 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 transition-all"
            >
              <X size={18} />
            </button>
            <Login onLogin={onLogin} />
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white" style={{ fontFamily: "'Roboto', sans-serif" }}>

        {/* ── Navbar ──────────────────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-navy-tafe shadow-lg">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <button onClick={() => scrollTo('inicio')} className="flex items-center gap-2.5 group">
              <img src="/logo-tafe-circle.png" alt="TAFE" className="w-9 h-9 object-contain" />
              <div className="leading-none">
                <div className="text-white font-bold text-sm tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>IGLESIA TAFE</div>
                <div className="text-turqui text-[10px] tracking-wider">San Andrés, Colombia</div>
              </div>
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <button
                  key={l.key}
                  onClick={() => scrollTo(l.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeSection === l.key
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLogin(true)}
                className="hidden md:flex items-center gap-1.5 bg-turqui text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all"
                style={{ background: '#49D1C5', color: '#002a55' }}
              >
                Ingresar <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-white/80 hover:text-white p-1"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1" style={{ background: '#003166' }}>
              {navLinks.map(l => (
                <button
                  key={l.key}
                  onClick={() => scrollTo(l.key)}
                  className="w-full text-left px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-sm transition-all"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => { setShowLogin(true); setMobileOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg font-bold text-sm mt-2"
                style={{ background: '#49D1C5', color: '#002a55' }}
              >
                Iniciar sesión →
              </button>
            </div>
          )}
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────────── */}
        <section
          ref={inicioRef} id="inicio"
          className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(0,30,60,0.90) 0%, rgba(0,50,100,0.84) 50%, rgba(0,25,55,0.92) 100%), url(https://iglesiatafe.com/wp-content/uploads/2024/08/servicio-dominical-princip.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        >
          {/* Decorative rings */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-turqui/10" />
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-turqui/15" />
            <div className="absolute top-1/2 -left-48 w-96 h-96 rounded-full border border-white/5" />
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center relative">
            <div className="flex justify-center mb-8">
              <img src="/logo-tafe-circle.png" alt="Tabernáculo Apostólico de Fe" className="w-28 h-28 object-contain" />
            </div>

            <div className="inline-flex items-center gap-2 bg-white/10 text-turqui text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-wider uppercase">
              <MapPin size={12} /> San Andrés, Colombia
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Más que fe,<br />
              <span style={{ color: '#49D1C5' }}>una comunidad</span><br />
              en movimiento
            </h1>

            <p className="text-white/70 text-lg md:text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
              Bienvenido al portal oficial de membresía y gestión ministerial de la
              Iglesia Tabernáculo Apostólico de Fe.
            </p>

            <p className="text-turqui/80 text-sm italic mb-4 max-w-xl mx-auto">
              "Este tabernáculo fue hecho para la gloria y honra de Dios."
            </p>

            <p className="text-white/50 text-base mb-10 max-w-xl mx-auto leading-relaxed">
              Al conectarte con TAFE no solo encuentras a Dios — ingresas a una
              comunidad organizada que trabaja junto a ti en tu crecimiento espiritual.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => scrollTo('conectate')}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base shadow-lg transition-all hover:scale-105"
                style={{ background: '#49D1C5', color: '#002a55' }}
              >
                Quiero conectarme <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base border border-white/30 text-white hover:bg-white/10 transition-all"
              >
                Ya soy miembro <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Quiénes Somos ───────────────────────────────────────────────────── */}
        <section ref={quienesRef} id="quienes" className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">

            <div className="text-center mb-14">
              <span className="text-xs font-bold tracking-widest uppercase text-turqui">Quiénes Somos</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-tafe mt-2 mb-4"
                style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Tabernáculo Apostólico<br />de Fe
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
                Somos una iglesia apostólica en San Andrés, Colombia. Edificamos familias como núcleo
                central de la sociedad, a través de la evangelización, el discipulado y el servicio integral a la comunidad.
              </p>
            </div>

            {/* Misión + Visión */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="p-8 rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #004182 0%, #002a55 100%)' }}>
                <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#49D1C5' }}>
                  Nuestra Misión
                </div>
                <p className="text-white text-base leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  "Alcanzar, fortalecer y transformar al ser desde una estructura espiritual e integral,
                  por medio de la evangelización y el discipulado."
                </p>
              </div>
              <div className="p-8 rounded-2xl border border-navy-tafe/10" style={{ background: '#f0f6ff' }}>
                <div className="text-xs font-bold tracking-widest uppercase mb-3 text-navy-tafe/60">
                  Nuestra Visión
                </div>
                <p className="text-navy-tafe text-base leading-relaxed font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  "TAFE será una iglesia Cristo-céntrica que restaura familias y establece el reino
                  de Dios en todas las naciones."
                </p>
              </div>
            </div>

            {/* 3 pilares */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  icon: '✝',
                  title: 'Fe Apostólica',
                  body: 'Fundamentados en los principios del evangelio de Jesucristo. Adoramos, creemos y vivimos una fe que transforma familias en la isla.',
                  accent: '#004182',
                },
                {
                  icon: '🤝',
                  title: 'Comunidad Organizada',
                  body: 'Una red de creyentes comprometidos, estructurados en 7 ejes ministeriales que trabajan cada semana por el bien de San Andrés.',
                  accent: '#49D1C5',
                },
                {
                  icon: '🌱',
                  title: 'Servicio Integral',
                  body: 'Desde evangelismo hasta bienestar comunitario: alcanzamos, formamos, mantenemos y nutrimos las almas con un propósito claro.',
                  accent: '#059669',
                },
              ].map((c) => (
                <div key={c.title} className="p-7 rounded-2xl border border-slate-100 hover:border-turqui/30 hover:shadow-md transition-all">
                  <div className="text-3xl mb-4">{c.icon}</div>
                  <h3 className="text-base font-bold mb-2" style={{ color: c.accent, fontFamily: 'Montserrat, sans-serif' }}>
                    {c.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>

            {/* Valores */}
            <div className="text-center mb-12">
              <div className="text-xs font-bold tracking-widest uppercase text-turqui mb-4">Nuestros Valores</div>
              <div className="flex flex-wrap justify-center gap-2">
                {['Servicio', 'Integridad', 'Aprendizaje', 'Lealtad', 'Perseverancia', 'Responsabilidad', 'Sabiduría', 'Respeto'].map(v => (
                  <span key={v} className="px-4 py-2 rounded-full text-sm font-medium border text-navy-tafe/70"
                    style={{ borderColor: '#004182', background: '#f0f6ff' }}>
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Galería de la comunidad */}
            <div className="space-y-4 mb-12">
              <img
                src="https://iglesiatafe.com/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-25-at-8.02.05-AM.jpeg"
                alt="Celebración 36 aniversario TAFE"
                className="rounded-2xl w-full shadow-md"
              />
              <img
                src="https://iglesiatafe.com/wp-content/uploads/2024/08/servicio-dominical-princip.jpg"
                alt="Servicio dominical TAFE"
                className="rounded-2xl w-full shadow-md"
              />
            </div>

            {/* ERP CTA */}
            <div className="bg-slate-50 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-navy-tafe mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  El Portal Ministerial de TAFE
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Este sistema digital centraliza la vida de la iglesia: membresía, asistencia, orden del día,
                  evangelismo, discipulado, seguimiento pastoral y bienestar comunitario. Si ya eres parte,
                  aquí tienes tu herramienta de trabajo.
                </p>
                <button
                  onClick={() => setShowLogin(true)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-navy-tafe hover:text-turqui transition-colors"
                >
                  Ingresar al portal <ChevronRight size={14} />
                </button>
              </div>
              <div className="shrink-0">
                <img src="/logo-tafe.png" alt="Tabernáculo Apostólico de Fe" className="w-24 h-24 object-contain" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Evangelismo ─────────────────────────────────────────────────────── */}
        <section
          ref={evangelismoRef} id="evangelismo"
          className="py-24"
          style={{ background: 'linear-gradient(135deg, #004182 0%, #003166 100%)' }}
        >
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#49D1C5' }}>
                La Gran Comisión
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4"
                style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Evangelismo en Acción
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto text-base leading-relaxed">
                El evangelismo no es una actividad para TAFE — es nuestra identidad. Cada mes, jornadas
                organizadas llevan el evangelio a los barrios y sectores de San Andrés.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-14">
              {[
                { num: '7',    label: 'Ejes ministeriales',   sub: 'Estructura apostólica completa' },
                { num: '3er',  label: 'Sábado de cada mes',   sub: 'Jornada de evangelismo en isla' },
                { num: '360°', label: 'Cobertura pastoral',   sub: 'Desde el primer contacto hasta el discipulado' },
              ].map((s) => (
                <div key={s.label} className="text-center p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="text-5xl font-bold mb-2" style={{ color: '#49D1C5', fontFamily: 'Montserrat, sans-serif' }}>
                    {s.num}
                  </div>
                  <div className="text-white font-semibold mb-1">{s.label}</div>
                  <div className="text-white/50 text-xs">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Imagen TAFE NEWS — proporción original 2048×1020 (≈2:1) */}
            <img
              src="https://iglesiatafe.com/wp-content/uploads/2025/12/TAFE-NEWS-2048x1020.jpg"
              alt="TAFE en movimiento"
              className="w-full rounded-2xl shadow-xl mb-10"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <Target className="mb-4" style={{ color: '#49D1C5' }} size={28} />
                <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Jornadas de Evangelismo
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Cada tercer sábado del mes, equipos organizados salen a los barrios de San Andrés con
                  un mensaje claro: hay una comunidad lista para recibirte.
                </p>
              </div>
              <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <Users className="mb-4" style={{ color: '#49D1C5' }} size={28} />
                <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Seguimiento y Consolidación
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Cada persona evangelizada entra a un sistema de seguimiento pastoral que la acompaña
                  desde el primer contacto hasta integrarse a la comunidad TAFE.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Liderazgo ───────────────────────────────────────────────────────── */}
        <section ref={liderazgoRef} id="liderazgo" className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-bold tracking-widest uppercase text-turqui">Liderazgo en Acción</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-tafe mt-2 mb-4"
                style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Los 7 Ejes del Ministerio
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
                La estructura apostólica de TAFE está organizada en 7 ejes, cada uno con su mandato,
                equipo y métricas. Juntos cubren cada dimensión del crecimiento espiritual y comunitario.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {AXES.map(({ id, name, desc, icon: Icon, color }) => (
                <div
                  key={id}
                  className="p-5 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 rounded-lg" style={{ background: color + '18' }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <span className="text-xs font-bold tracking-widest" style={{ color }}>
                      {id}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {name}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}

              {/* CTA card */}
              <div
                className="p-5 rounded-xl flex flex-col justify-center items-center text-center cursor-pointer hover:scale-105 transition-all"
                style={{ background: 'linear-gradient(135deg, #004182, #003166)', gridColumn: 'span 1' }}
                onClick={() => scrollTo('conectate')}
              >
                <span className="text-white font-bold text-sm mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  ¿En cuál eje sirves tú?
                </span>
                <ArrowRight size={20} style={{ color: '#49D1C5' }} />
              </div>
            </div>
          </div>
        </section>

        {/* ── TAFE Bienestar ──────────────────────────────────────────────────── */}
        <section ref={bienestarRef} id="bienestar" className="py-24" style={{ background: '#f0faf7' }}>
          <div className="max-w-5xl mx-auto px-6">

            <div className="text-center mb-14">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#059669' }}>
                Bienestar Comunitario
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4"
                style={{ fontFamily: 'Montserrat, sans-serif', color: '#064e3b' }}>
                ¿Cómo podemos ayudarte?
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
                La comunidad TAFE ofrece programas de apoyo integral a sus miembros y familias.
                En TAFE nadie enfrenta una crisis solo — hay una red organizada lista para acompañarte.
              </p>
            </div>

            {/* 6 servicios */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {[
                {
                  title: 'Apoyo en salud',
                  body: 'Coordinación de atención médica, medicamentos, transporte a citas y acompañamiento durante hospitalizaciones.',
                  tag: 'Activo', tagColor: '#059669',
                  border: '#34d399',
                },
                {
                  title: 'Calamidad doméstica',
                  body: 'Asistencia inmediata ante emergencias del hogar: daños, pérdida de bienes o situaciones que afecten el sustento familiar.',
                  tag: 'Activo', tagColor: '#b45309',
                  border: '#f59e0b',
                },
                {
                  title: 'Mercado y alimentación',
                  body: 'Red solidaria de donaciones en especie: alimentos, productos de primera necesidad y útiles escolares para hijos.',
                  tag: 'En crecimiento', tagColor: '#dc2626',
                  border: '#f87171',
                },
                {
                  title: 'Brigadas comunitarias',
                  body: 'Jornadas de salud preventiva con miembros profesionales: toma de presión, glucometría, orientación médica gratuita.',
                  tag: 'Próxima: Jul 2025', tagColor: '#7c3aed',
                  border: '#a78bfa',
                },
                {
                  title: 'Fondo de emergencia',
                  body: 'Contribuciones voluntarias de la congregación para apoyar a miembros en situación de crisis económica comprobada.',
                  tag: 'Activo', tagColor: '#0369a1',
                  border: '#38bdf8',
                },
                {
                  title: 'Banco de tiempo',
                  body: 'Intercambio de habilidades y servicios entre miembros: transporte, cuidado de niños, reparaciones, trámites.',
                  tag: 'Beta', tagColor: '#d97706',
                  border: '#fbbf24',
                },
              ].map((s) => (
                <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border-t-2 hover:shadow-md transition-all"
                  style={{ borderTopColor: s.border }}>
                  <h3 className="font-bold text-slate-800 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {s.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{s.body}</p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: s.tagColor + '18', color: s.tagColor }}>
                    {s.tag}
                  </span>
                </div>
              ))}
            </div>

            {/* Solicitar apoyo + Contribuir */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-8 border border-emerald-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: '#d1fae5' }}>
                  <Heart size={20} style={{ color: '#059669' }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#064e3b' }}>
                  Solicitar apoyo
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">
                  Si tú o tu familia atraviesan una situación difícil, la Diaconía TAFE está aquí
                  para acompañarte con discreción, amor y recursos concretos. El proceso es confidencial.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Rellenas el formulario de solicitud', 'Un diácono te contacta en 24–48 horas', 'Se asigna un plan de acompañamiento personalizado'].map(step => (
                    <li key={step} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: '#059669' }} />
                      {step}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowLogin(true)}
                  className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-colors"
                  style={{ color: '#059669' }}
                >
                  Acceder al módulo <ChevronRight size={14} />
                </button>
              </div>

              <div className="rounded-2xl p-8 text-white" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Users size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Contribuye al fondo
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-5">
                  Tu aporte — en efectivo, Nequi, especie o tiempo — fortalece la red de apoyo
                  de nuestra congregación. Cada contribución va directo a familias que lo necesitan.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {['Dinero en efectivo', 'Nequi / digital', 'En especie', 'Servicio / tiempo'].map(tipo => (
                    <div key={tipo} className="px-3 py-2 rounded-lg text-xs font-medium text-white/80 text-center"
                      style={{ background: 'rgba(255,255,255,0.12)' }}>
                      {tipo}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowLogin(true)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-white/90 hover:text-white transition-colors"
                >
                  Registrar contribución <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Ministerios involucrados */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-50">
              <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#059669' }}>
                Ministerios que sostienen TAFE Bienestar
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Diaconía & Misericordia (E4)', color: '#15803d' },
                  { name: 'Pastoral & Consolidación (E3)', color: '#0369a1' },
                  { name: 'Brigadas de Salud', color: '#7c3aed' },
                  { name: 'Administración (E6)', color: '#374151' },
                  { name: 'Oración e Intercesión (E7)', color: '#9f1239' },
                ].map(m => (
                  <span key={m.name} className="px-4 py-2 rounded-full text-xs font-bold border"
                    style={{ borderColor: m.color + '40', color: m.color, background: m.color + '0d' }}>
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Conéctate ───────────────────────────────────────────────────────── */}
        <section
          ref={conectateRef} id="conectate"
          className="py-24"
          style={{ background: 'linear-gradient(135deg, #003166 0%, #004182 100%)' }}
        >
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              {/* Left */}
              <div>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#49D1C5' }}>
                  Conexión a Redes
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Da el primer paso
                </h2>
                <p className="text-white/60 text-base leading-relaxed mb-8">
                  Completa el formulario y un líder de TAFE se comunicará contigo para darte la
                  bienvenida a la comunidad. Aquí empieza tu historia con nosotros.
                </p>

                <div className="space-y-4">
                  {[
                    'Recibirás la bienvenida personal de un líder',
                    'Te conectaremos con el grupo de tu zona',
                    'Accederás al portal ERP de membresía',
                    'Formarás parte de la misión apostólica de TAFE',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: '#49D1C5' }}>
                        <Check size={11} style={{ color: '#002a55' }} />
                      </div>
                      <span className="text-white/70 text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">Contacto directo</div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://wa.me/573155042631"
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                    <a
                      href="tel:+573155042631"
                      className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                    >
                      <Phone size={15} /> 315 5042631
                    </a>
                  </div>
                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-5 mb-3">Síguenos</div>
                  <div className="flex gap-3">
                    <a
                      href="https://www.youtube.com/@tabernaculoapostolicodefe"
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-white/30 text-xs font-bold transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      YouTube
                    </a>
                    <a
                      href="https://www.facebook.com/Tabernaculoapostolicodefe"
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-white/30 text-xs font-bold transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </a>
                  </div>
                </div>
              </div>

              {/* Right — Form */}
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: '#49D1C5' + '22', border: '2px solid #49D1C5' }}>
                      <Check size={28} style={{ color: '#49D1C5' }} />
                    </div>
                    <h3 className="text-xl font-bold text-navy-tafe mb-2"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      ¡Gracias, {form.nombre.split(' ')[0]}!
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Tu información fue recibida. Un líder de TAFE se comunicará contigo pronto.
                      ¡Bienvenido a la comunidad!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-navy-tafe mb-1"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Quiero conectarme con TAFE
                    </h3>
                    <p className="text-slate-400 text-xs mb-4">Todos los campos son importantes para poder contactarte.</p>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Nombre completo *</label>
                      <input
                        type="text" required
                        value={form.nombre}
                        onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                        placeholder="Tu nombre y apellido"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 text-slate-800"
                        style={{ focusRingColor: '#49D1C5' } as any}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Teléfono / WhatsApp *</label>
                      <input
                        type="tel" required
                        value={form.telefono}
                        onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                        placeholder="+57 300 000 0000"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Barrio o sector en San Andrés *</label>
                      <input
                        type="text" required
                        value={form.zona}
                        onChange={e => setForm(p => ({ ...p, zona: e.target.value }))}
                        placeholder="Ej: La Loma, El Centro, San Luis…"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">¿Cómo nos conociste?</label>
                      <select
                        value={form.origen}
                        onChange={e => setForm(p => ({ ...p, origen: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 text-slate-700 bg-white"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="evangelismo">Evangelismo en mi barrio</option>
                        <option value="redes">Redes sociales</option>
                        <option value="amigo">Me trajo un amigo / familiar</option>
                        <option value="servicio">Asistí a un servicio</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.02] mt-2"
                      style={{ background: '#004182', color: 'white' }}
                    >
                      Quiero ser parte de TAFE <ArrowRight size={16} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <footer style={{ background: '#001a38' }} className="py-12">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <img src="/logo-tafe-circle.png" alt="TAFE" className="w-10 h-10 object-contain" />
                <div>
                  <div className="text-white font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    IGLESIA TAFE
                  </div>
                  <div className="text-white/40 text-xs">Tabernáculo Apostólico de Fe</div>
                  <div className="text-white/40 text-xs">San Andrés, Colombia</div>
                  <div className="text-turqui/40 text-[10px] italic mt-0.5">
                    "Para la gloria y honra de Dios."
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {navLinks.map(l => (
                  <button
                    key={l.key}
                    onClick={() => scrollTo(l.key)}
                    className="text-white/40 hover:text-white text-xs transition-colors hidden md:block"
                  >
                    {l.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 rounded-lg text-xs font-bold border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
                >
                  Ingresar al ERP
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/30 text-xs">
                © {new Date().getFullYear()} Iglesia TAFE · Portal Ministerial ERP
              </p>
              <div className="flex items-center gap-3">
                <a href="https://www.youtube.com/@tabernaculoapostolicodefe" target="_blank" rel="noreferrer"
                  className="text-white/30 hover:text-white transition-colors" title="YouTube TAFE">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/Tabernaculoapostolicodefe" target="_blank" rel="noreferrer"
                  className="text-white/30 hover:text-white transition-colors" title="Facebook TAFE">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://wa.me/573155042631" target="_blank" rel="noreferrer"
                  className="text-white/30 hover:text-white transition-colors" title="WhatsApp TAFE">
                  <MessageCircle size={16} />
                </a>
                <span className="text-white/15 text-xs">iglesiatafe.com</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
