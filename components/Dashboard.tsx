
import React, { useState, useEffect } from 'react';
import { UserRole, ApostolicAxis } from '../types';
import {
  Users,
  Calendar,
  Zap,
  TrendingUp,
  Target,
  ShieldCheck,
  Sparkles,
  Activity,
  Loader2
} from 'lucide-react';
import { getMiembros, getMinisterios, getTareas, getCronograma } from '../services/airtableService';

const AXIS_META: Record<ApostolicAxis, { label: string; status: string; color: string }> = {
  E1_EVANGELISMO:    { label: 'E1: Evangelismo',       status: 'Conquista Territorial',  color: 'bg-turqui' },
  E2_INTERCESION:    { label: 'E2: Intercesión',        status: 'Vigilancia Espiritual',  color: 'bg-navy-tafe' },
  E3_CONSOLIDACION:  { label: 'E3: Consolidación',      status: 'Reteniendo Fruto',       color: 'bg-emerald-500' },
  E4_INFANCIA_DANZA: { label: 'E4: Danza & Niños',      status: 'Generacional',           color: 'bg-pink-500' },
  E5_ALABANZA_AV:    { label: 'E5: Alabanza & AV',      status: 'Atmósfera Espiritual',   color: 'bg-blue-500' },
  E6_SOCIAL_CUIDADO: { label: 'E6: Social',             status: 'Restauración Social',    color: 'bg-amber-500' },
  E7_JOVENES:        { label: 'E7: Jóvenes',            status: 'Continuidad de Reino',   color: 'bg-indigo-500' },
};

// Mapa eje código → ApostolicAxis
const EJE_TO_AXIS: Record<string, ApostolicAxis> = {
  E1: 'E1_EVANGELISMO',
  E2: 'E2_INTERCESION',
  E3: 'E3_CONSOLIDACION',
  E4: 'E4_INFANCIA_DANZA',
  E5: 'E5_ALABANZA_AV',
  E6: 'E6_SOCIAL_CUIDADO',
  E7: 'E7_JOVENES',
};

// Inicio del ciclo trimestral TAFE
const CICLO_START = new Date('2026-01-05');

const Dashboard: React.FC<{ role: UserRole }> = ({ role }) => {
  const [miembrosCount, setMiembrosCount]     = useState(0);
  const [ministeriosCount, setMinisteriosCount] = useState(0);
  const [tareasStats, setTareasStats]         = useState({ total: 0, completadas: 0 });
  const [ejesProgress, setEjesProgress]       = useState<Partial<Record<ApostolicAxis, number>>>({});
  const [faseActual, setFaseActual]           = useState('Promover y Convocar');
  const [currentWeek, setCurrentWeek]         = useState(7);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [miembros, ministerios, tareas, cronograma] = await Promise.all([
          getMiembros(),
          getMinisterios(),
          getTareas(),
          getCronograma(),
        ]);

        setMiembrosCount(miembros.length);
        setMinisteriosCount(ministerios.length);
        setTareasStats({
          total: tareas.length,
          completadas: tareas.filter(t => t.fields.Estatus === 'COMPLETADA').length,
        });

        // Ministerio → Eje map
        const minEjeMap: Record<string, string> = {};
        ministerios.forEach(m => {
          minEjeMap[m.fields.Nombre_Ministerio] = m.fields.Eje_Vinculado;
        });

        // Progreso por eje basado en tareas completadas
        const ejeCount: Record<string, { total: number; comp: number }> = {};
        tareas.forEach(t => {
          const eje = minEjeMap[t.fields.Ministerio_ID ?? ''];
          if (eje) {
            if (!ejeCount[eje]) ejeCount[eje] = { total: 0, comp: 0 };
            ejeCount[eje].total++;
            if (t.fields.Estatus === 'COMPLETADA') ejeCount[eje].comp++;
          }
        });

        const progress: Partial<Record<ApostolicAxis, number>> = {};
        Object.entries(ejeCount).forEach(([eje, { total, comp }]) => {
          const axis = EJE_TO_AXIS[eje];
          if (axis) progress[axis] = total > 0 ? Math.round((comp / total) * 100) : 0;
        });
        setEjesProgress(progress);

        // Semana actual del ciclo
        const today = new Date();
        const weekNum = Math.ceil(
          (today.getTime() - CICLO_START.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        const semana = Math.min(Math.max(weekNum, 1), 12);
        setCurrentWeek(semana);

        // Fase actual desde cronograma
        const entry = cronograma.find(r => r.fields.Semana_Num === `Semana ${semana}`);
        if (entry?.fields.Fase) {
          setFaseActual(entry.fields.Fase.replace(/_/g, ' '));
        }

      } catch (err) {
        console.error('Error cargando Dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sincronización promedio de todos los ejes
  const progresoEjes = Object.values(ejesProgress);
  const sincronizacion = progresoEjes.length > 0
    ? Math.round(progresoEjes.reduce((a, b) => a + b, 0) / progresoEjes.length)
    : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Estratégico */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-3xl font-montserrat font-bold text-slate-800">Torre de Control Apostólica</h2>
          <p className="text-slate-500 text-sm italic">"Familias bajo el Gobierno del Reino" - TAFE</p>
        </div>
        <div className="flex gap-3">
           <div className="bg-[#004182] text-white px-8 py-4 rounded-[2rem] flex items-center gap-5 shadow-2xl border border-white/5">
              <div className="text-right">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Semana del Ciclo</p>
                {loading
                  ? <Loader2 size={20} className="text-turqui animate-spin ml-auto" />
                  : <p className="text-2xl font-mono font-bold text-[#49D1C5]">{currentWeek} / 12</p>
                }
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Fase Actual</p>
                <p className="text-sm font-bold text-amber-400">{faseActual}</p>
              </div>
           </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Target className="text-turqui"/>}        label="Familias Meta"       value="500"                                      sub="Ciclo Trimestral" loading={false} />
        <StatCard icon={<Users className="text-emerald-500"/>}    label="Miembros Activos"    value={loading ? '…' : miembrosCount.toString()}  sub="Fuerza Voluntaria" loading={loading} />
        <StatCard icon={<ShieldCheck className="text-navy-tafe"/>} label="Ministerios Activos" value={loading ? '…' : ministeriosCount.toString()} sub="Bajo 7 Coberturas" loading={loading} />
        <StatCard icon={<Zap className="text-amber-500"/>}        label="Tareas Completadas"  value={loading ? '…' : `${tareasStats.completadas}/${tareasStats.total}`} sub="En los 7 Ejes" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engranaje Ministerial — con datos reales */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
                 <div className="p-2 bg-turqui/10 rounded-xl">
                    <Activity size={24} className="text-turqui" />
                 </div>
                 Engranaje Ministerial
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                {loading
                  ? 'Cargando…'
                  : sincronizacion !== null
                    ? `Sincronización: ${sincronizacion}%`
                    : 'Sin datos de tareas'}
              </span>
           </div>

           {loading ? (
             <div className="flex items-center justify-center h-48">
               <Loader2 size={32} className="text-turqui animate-spin" />
             </div>
           ) : (
             <div className="space-y-7">
               {(Object.keys(AXIS_META) as ApostolicAxis[]).map(key => {
                 const meta     = AXIS_META[key];
                 const progress = ejesProgress[key] ?? 0;
                 const hasData  = key in ejesProgress;
                 return (
                   <div key={key} className="group cursor-pointer">
                     <div className="flex justify-between items-end mb-2.5">
                        <div>
                           <p className="text-xs font-bold text-slate-800 group-hover:text-turqui transition-colors">{meta.label}</p>
                           <p className="text-[10px] text-slate-400 font-medium">{meta.status}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#004182]">
                          {hasData ? `${progress}%` : '—'}
                        </span>
                     </div>
                     <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                        <div
                         className={`h-full transition-all duration-1000 ${meta.color} shadow-[0_0_10px_rgba(73,209,197,0.3)]`}
                         style={{ width: `${hasData ? progress : 0}%` }}
                        />
                     </div>
                   </div>
                 );
               })}
             </div>
           )}
        </div>

        {/* Ruta Trimestral */}
        <div className="space-y-6">
           <div className="bg-[#004182] rounded-[3rem] p-10 text-white shadow-[0_30px_60px_-15px_rgba(0,65,130,0.3)] relative overflow-hidden">
              <h3 className="text-xl font-montserrat font-bold mb-10 flex items-center gap-3">
                <Calendar size={22} className="text-turqui" />
                Ruta Trimestral
              </h3>

              <div className="space-y-10 relative">
                <div className="absolute left-[13px] top-2 bottom-2 w-[1px] bg-white/10" />

                <TimelineStep active={currentWeek >= 1  && currentWeek <= 3}  title="Preparación"  weeks="Sem. 1-3" />
                <TimelineStep active={currentWeek >= 4  && currentWeek <= 6}  title="Planificación" weeks="Sem. 4-6" />
                <TimelineStep active={currentWeek >= 7  && currentWeek <= 9}  title="Promoción"    weeks="Sem. 7-9" />
                <TimelineStep active={currentWeek >= 10 && currentWeek <= 12} title="Ejecución"    weeks="Sem. 10-12" />
              </div>

              <div className="mt-12 pt-10 border-t border-white/10 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Sparkles size={16} className="text-turqui" />
                   <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Plan TAFE</span>
                 </div>
              </div>
           </div>

           <div className="bg-[#49D1C5]/10 rounded-[2.5rem] p-8 border border-[#49D1C5]/20">
              <p className="text-xs text-slate-500 italic leading-relaxed text-center font-medium">
                "15 ministerios unidos bajo un mismo gobierno para conquistar familias."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, loading }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-turqui/40 hover:shadow-xl transition-all duration-500">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3.5 bg-slate-50 rounded-2xl group-hover:bg-turqui/10 transition-colors shadow-inner">{icon}</div>
      {loading
        ? <Loader2 size={18} className="text-slate-200 animate-spin" />
        : <TrendingUp size={18} className="text-slate-100 group-hover:text-turqui transition-colors" />
      }
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
    <p className="text-3xl font-montserrat font-bold text-slate-800">{value}</p>
    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{sub}</p>
  </div>
);

const TimelineStep = ({ active, title, weeks }: any) => (
  <div className="flex gap-6 relative z-10 transition-all duration-500">
    <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${
      active ? 'bg-[#49D1C5] border-white shadow-[0_0_20px_rgba(73,209,197,0.5)]' : 'bg-navy-tafe border-white/20'
    }`}>
      <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
    </div>
    <div>
      <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${active ? 'text-[#49D1C5]' : 'text-white/30'}`}>{weeks}</p>
      <h4 className={`text-base font-bold ${active ? 'text-white' : 'text-white/70'}`}>{title}</h4>
    </div>
  </div>
);

export default Dashboard;
