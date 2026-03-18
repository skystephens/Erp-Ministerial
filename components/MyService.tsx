
import React, { useState, useEffect } from 'react';
import { Clock, Play, CheckCircle, Award, Calendar, ListChecks } from 'lucide-react';

const MyService: React.FC<{ userId: string }> = ({ userId }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      {/* Service Clock */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-turqui p-8 text-white text-center">
            <h3 className="font-montserrat font-bold text-lg mb-6">Reloj de Servicio</h3>
            <div className="text-5xl font-mono font-bold tracking-widest mb-2 drop-shadow-lg">
              {formatTime(seconds)}
            </div>
            <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Sesión Actual</p>
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <p className="text-sm font-bold text-slate-700">
                {isActive ? 'Sesión Activa' : 'Sin actividad marcada'}
              </p>
            </div>
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`w-full py-4 rounded-2xl font-montserrat font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${
                isActive 
                  ? 'bg-red-500 text-white shadow-red-500/20' 
                  : 'bg-turqui text-white shadow-turqui/20'
              }`}
            >
              {isActive ? <CheckCircle /> : <Play />}
              {isActive ? 'Finalizar Turno' : 'Marcar Entrada'}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4 px-6 italic">
              *Tu ubicación y hora de ingreso quedarán registradas para trazabilidad contable.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h4 className="font-montserrat font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="text-amber-500" /> Rendimiento Mensual
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-500">Horas Cumplidas</span>
                <span className="text-turqui">15.5h / 20h</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-turqui" style={{ width: '77%' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Tareas</p>
                <p className="text-lg font-bold text-slate-800">8</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Racha</p>
                <p className="text-lg font-bold text-slate-800">12 Días</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
              <ListChecks className="text-turqui" size={24} />
              Mi Agenda de Servicio
            </h3>
            <button className="text-turqui text-sm font-bold flex items-center gap-1">
              <Calendar size={16} /> Ver Calendario
            </button>
          </div>

          <div className="space-y-4">
            <MemberTaskRow 
              title="Carga de Log Semanal" 
              desc="Subir reporte de asistencia de grupo de consolidación."
              due="Mañana"
              status="pending"
            />
            <MemberTaskRow 
              title="Mantenimiento Luces Hall A" 
              desc="Revisión de sockets y cambio de bombillas LED."
              due="Hoy 15:00"
              status="active"
              isUrgent
            />
            <MemberTaskRow 
              title="Preparación Streaming" 
              desc="Setup de OBS y prueba de audio para culto de jóvenes."
              due="Viernes"
              status="pending"
            />
            <MemberTaskRow 
              title="Ensayo de Adoración" 
              desc="Práctica de nuevas canciones para el servicio dominical."
              due="Ayer"
              status="completed"
            />
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-montserrat font-bold mb-2">Mi Identidad Digital</h3>
            <p className="text-white/60 text-sm mb-6 max-w-md">
              Recuerda que tu compromiso es vital. Si no marcas asistencia en la App, tu labor no podrá ser contabilizada en el reporte ministerial.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-2 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-turqui hover:text-white transition-all">
                Ver Mi Perfil
              </button>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:text-white/10 transition-colors">
            <Award size={160} />
          </div>
        </div>
      </div>
    </div>
  );
};

const MemberTaskRow = ({ title, desc, due, status, isUrgent }: any) => {
  const [completed, setCompleted] = useState(status === 'completed');

  return (
    <div className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${completed ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-turqui/30 hover:shadow-sm'}`}>
      <button 
        onClick={() => setCompleted(!completed)}
        className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors mt-1 ${
          completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-turqui'
        }`}
      >
        {completed && <CheckCircle size={14} />}
      </button>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className={`text-sm font-bold ${completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{title}</h4>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isUrgent ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {due}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">{desc}</p>
        {!completed && (
          <div className="flex gap-3 mt-4">
            <button className="text-[10px] font-bold text-turqui border border-turqui/20 px-3 py-1 rounded-lg hover:bg-turqui/5">Marcar Iniciada</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyService;
