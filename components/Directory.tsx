
import React, { useState } from 'react';
import { User, UserRole, RelationshipType } from '../types';
import { 
  Search, 
  X, 
  HeartHandshake,
  GitMerge,
  GitBranch,
  UserPlus,
  Filter,
  Users,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Calendar,
  Briefcase,
  BookOpen,
  Waves,
  ShieldCheck,
  Zap,
  MessageSquareHeart,
  UserCircle,
  ChevronRight,
  Flame,
  Check
} from 'lucide-react';

interface DirectoryProps {
  currentUser: User;
  onCreateProspect?: (data: Partial<User>) => void;
}

const mockUsers: User[] = [
  { 
    id: 'u_p1', 
    name: 'Roberto Pérez', 
    role: UserRole.MIEMBRO, 
    status: 'APPROVED', 
    ministry: 'Células', 
    skills: ['Anfitrión', 'Electricidad'], 
    contact: 'roberto@email.com', 
    joinedDate: '2024-01-01', 
    complianceRate: 100, 
    timeBankBalance: 12, 
    socialValueGenerated: 450,
    accessLevel: 'MINISTERIAL',
    relationships: [
      { targetId: 'u_p2', targetName: 'Ana de Pérez', type: 'CONYUGE' },
      { targetId: 'u_p3', targetName: 'Mateo Pérez', type: 'HIJO' }
    ],
    dataDepth: 'DEEP',
    spiritualStatus: 'CONSOLIDADO',
    isBaptized: true,
    isRegularAttendee: true,
    completedBasicStudies: true,
    leadershipLevel: 2,
    phone: '+57 300 123 4567',
    address: 'Calle 123 #45-67, Barrio Oasis',
    age: 42,
    gender: 'MASCULINO',
    employmentStatus: 'Empleado (Técnico Eléctrico)',
    prayerRequests: 'Por la salud de mi madre y provisión para el estudio de Mateo.',
    geoPosition: { lat: 4.6097, lng: -74.0817 }
  }
];

const Directory: React.FC<DirectoryProps> = ({ currentUser, onCreateProspect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'family' | 'notes'>('info');
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  
  const [harvestData, setHarvestData] = useState<Partial<User>>({
    name: '',
    phone: '',
    age: 0,
    address: '',
    hasChildren: false,
    prayerRequests: '',
    originGroup: ''
  });

  const canCreate = currentUser.role !== UserRole.MIEMBRO;

  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleHarvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateProspect) {
      onCreateProspect(harvestData);
      setShowHarvestModal(false);
      setHarvestData({ name: '', phone: '', age: 0, address: '', hasChildren: false, prayerRequests: '', originGroup: '' });
      alert("Cosecha registrada con éxito. Aparecerá en el panel de aprobaciones del administrador.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-slate-800">Directorio de Conexión</h2>
          <p className="text-slate-500 text-sm italic">"Trazabilidad de Reino para el Cuidado de la Familia"</p>
        </div>
        <div className="flex gap-3">
           <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-slate-500">540 Almas Mapeadas</span>
           </div>
           {canCreate && (
             <button 
              onClick={() => setShowHarvestModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-turqui text-white font-montserrat font-bold rounded-xl shadow-lg shadow-turqui/20 hover:scale-[1.02] transition-all"
             >
              <Flame size={20} /> Registro de Cosecha
            </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-6">
           <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="space-y-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Segmentación</p>
              <FilterItem label="No Bautizados" />
              <FilterItem label="Sin Afirmando Pasos" warning />
              <FilterItem label="Desempleados / Necesidad" />
              <FilterItem label="Potencial Liderazgo" />
           </div>
        </aside>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {filteredUsers.map(user => (
             <div 
              key={user.id} 
              onClick={() => { setSelectedUser(user); setActiveTab('info'); }}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-turqui/30 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
             >
                <div className="flex items-center gap-4 mb-4 relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner">
                      <img src={`https://picsum.photos/seed/${user.id}/100/100`} alt="" />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-turqui transition-colors">{user.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{user.spiritualStatus?.replace('_', ' ')}</p>
                   </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4 relative z-10">
                   {user.isBaptized && <span className="p-1 bg-blue-50 text-blue-500 rounded-lg"><Waves size={12}/></span>}
                   {user.completedBasicStudies && <span className="p-1 bg-emerald-50 text-emerald-500 rounded-lg"><BookOpen size={12}/></span>}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 relative z-10">
                   <div className="flex items-center gap-1 text-slate-400">
                      <GitMerge size={12} />
                      <span className="text-[10px] font-bold">{user.relationships.length} Parientes</span>
                   </div>
                   <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${user.dataDepth === 'DEEP' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {user.dataDepth === 'DEEP' ? 'FICHA 360' : 'BORRADOR'}
                   </span>
                </div>
                <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
                   <UserCircle size={100} />
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Modal Registro de Cosecha (Evangelismo) */}
      {showHarvestModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp">
              <form onSubmit={handleHarvestSubmit}>
                <div className="bg-turqui p-10 text-white flex justify-between items-center">
                   <div>
                      <h3 className="text-2xl font-montserrat font-bold flex items-center gap-3">
                         <Flame /> Registro de Cosecha
                      </h3>
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Nuevos Alcanzados - Jornada Evangelismo</p>
                   </div>
                   <button type="button" onClick={() => setShowHarvestModal(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={24}/></button>
                </div>
                
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Nombre y Apellido</label>
                        <input 
                          required
                          type="text" 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 ring-turqui text-sm"
                          value={harvestData.name}
                          onChange={e => setHarvestData({...harvestData, name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Celular</label>
                            <input 
                              required
                              type="tel" 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 ring-turqui text-sm"
                              value={harvestData.phone}
                              onChange={e => setHarvestData({...harvestData, phone: e.target.value})}
                            />
                         </div>
                         <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Edad</label>
                            <input 
                              type="number" 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 ring-turqui text-sm"
                              value={harvestData.age || ''}
                              onChange={e => setHarvestData({...harvestData, age: parseInt(e.target.value)})}
                            />
                         </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Dirección de Domicilio</label>
                        <input 
                          type="text" 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 ring-turqui text-sm"
                          value={harvestData.address}
                          onChange={e => setHarvestData({...harvestData, address: e.target.value})}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <span className="text-xs font-bold text-slate-600">Tiene Hijos</span>
                         <button 
                          type="button"
                          onClick={() => setHarvestData({...harvestData, hasChildren: !harvestData.hasChildren})}
                          className={`w-12 h-6 rounded-full transition-all relative ${harvestData.hasChildren ? 'bg-turqui' : 'bg-slate-300'}`}
                         >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${harvestData.hasChildren ? 'right-1' : 'left-1'}`} />
                         </button>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Grupo Evangelizador</label>
                        <input 
                          placeholder="Ej: Escuadrón E1 - Sector A"
                          type="text" 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 ring-turqui text-sm"
                          value={harvestData.originGroup}
                          onChange={e => setHarvestData({...harvestData, originGroup: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Petición de Oración</label>
                        <textarea 
                          className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-1 ring-turqui text-xs resize-none"
                          placeholder="Necesidad puntual manifestada..."
                          value={harvestData.prayerRequests}
                          onChange={e => setHarvestData({...harvestData, prayerRequests: e.target.value})}
                        />
                      </div>
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                         <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                         <p className="text-[9px] text-amber-700 font-medium leading-relaxed italic">
                           Esta persona ingresará como 'Prospecto' y deberá ser asignada a un consolidador en el Panel Admin.
                         </p>
                      </div>
                   </div>
                </div>

                <div className="p-10 bg-slate-50 flex gap-4">
                   <button type="button" onClick={() => setShowHarvestModal(false)} className="flex-1 py-4 text-slate-400 font-bold">Cancelar</button>
                   <button type="submit" className="flex-[2] py-4 bg-turqui text-white font-bold rounded-2xl shadow-xl shadow-turqui/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                      <Check size={20} /> Guardar Registro de Cosecha
                   </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Drawer de Detalle (Existing UI) */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
           <div className="w-full max-w-3xl bg-white h-full shadow-2xl overflow-y-auto animate-slideLeft">
              <div className="bg-slate-900 p-10 text-white relative">
                 <button onClick={() => setSelectedUser(null)} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"><X size={20}/></button>
                 
                 <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-28 h-28 rounded-[2rem] border-4 border-white/10 overflow-hidden shadow-2xl">
                       <img src={`https://picsum.photos/seed/${selectedUser.id}/200/200`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center md:text-left">
                       <h3 className="text-3xl font-montserrat font-bold mb-2">{selectedUser.name}</h3>
                       <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                          <span className="text-[10px] font-bold text-turqui uppercase tracking-widest bg-turqui/10 px-3 py-1 rounded-full border border-turqui/20">{selectedUser.spiritualStatus}</span>
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{selectedUser.role.replace('_', ' ')}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-8 mt-12 overflow-x-auto no-scrollbar">
                    <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Ficha Identidad 360" />
                    <TabButton active={activeTab === 'family'} onClick={() => setActiveTab('family')} label="Mapa Relacional" />
                    <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} label="Bitácora Pastoral" />
                 </div>
              </div>

              <div className="p-10 space-y-12">
                 {activeTab === 'info' && (
                   <div className="space-y-12 animate-fadeIn">
                      <section>
                         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-turqui" /> Trazabilidad de Reino
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatusCard icon={<Waves size={18} />} label="Bautismo" value={selectedUser.isBaptized ? 'REALIZADO' : 'PENDIENTE'} active={selectedUser.isBaptized} color="blue" />
                            <StatusCard icon={<CheckCircle2 size={18} />} label="Asistencia" value={selectedUser.isRegularAttendee ? 'REGULAR' : 'INCONSISTENTE'} active={selectedUser.isRegularAttendee} color="amber" />
                            <StatusCard icon={<BookOpen size={18} />} label="Afirmando Pasos" value={selectedUser.completedBasicStudies ? 'COMPLETO' : 'PENDIENTE'} active={selectedUser.completedBasicStudies} color="emerald" />
                            <StatusCard icon={<Zap size={18} />} label="Nivel Liderazgo" value={`MÓDULO ${selectedUser.leadershipLevel}`} active={selectedUser.leadershipLevel > 0} color="indigo" />
                         </div>
                      </section>

                      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                         <div className="space-y-6">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Información de Contacto</h4>
                            <DataDetail icon={<Phone size={14}/>} label="Teléfono" value={selectedUser.phone || 'No registrado'} />
                            <DataDetail icon={<MapPin size={14}/>} label="Dirección" value={selectedUser.address || 'No registrada'} />
                         </div>
                         <div className="space-y-6">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Perfiles Demográficos</h4>
                            <DataDetail icon={<Calendar size={14}/>} label="Edad" value={`${selectedUser.age || '--'} Años`} />
                            <DataDetail icon={<Users size={14}/>} label="Sexo / Género" value={selectedUser.gender || 'No especificado'} />
                         </div>
                         <div className="space-y-6">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Servicio Actual</h4>
                            <DataDetail icon={<Briefcase size={14}/>} label="Ministerio" value={selectedUser.ministry || 'En Proceso'} />
                         </div>
                      </section>

                      {selectedUser.originGroup && (
                        <section className="p-6 bg-navy-tafe/5 border border-navy-tafe/10 rounded-3xl flex items-center justify-between">
                           <div>
                              <p className="text-[10px] font-bold text-navy-tafe uppercase tracking-widest">Origen de Captura</p>
                              <p className="text-sm font-bold text-slate-800 mt-1">{selectedUser.originGroup}</p>
                           </div>
                           <Flame className="text-turqui" size={24} />
                        </section>
                      )}

                      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <MessageSquareHeart size={14} className="text-red-400" /> Solicitudes de Oración / Necesidad
                            </h4>
                            <div className="p-6 bg-red-50/30 border border-red-100 rounded-3xl min-h-[120px]">
                               <p className="text-sm text-slate-600 leading-relaxed italic">
                                  {selectedUser.prayerRequests || "No hay solicitudes activas de oración."}
                               </p>
                            </div>
                         </div>
                      </section>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick}
    className={`text-[10px] font-bold uppercase tracking-[0.2em] pb-4 border-b-2 transition-all whitespace-nowrap ${
      active ? 'border-turqui text-white' : 'border-transparent text-white/40 hover:text-white/60'
    }`}
  >
    {label}
  </button>
);

const StatusCard = ({ icon, label, value, active, color }: any) => {
  const colorClasses = {
    blue: active ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400',
    amber: active ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400',
    emerald: active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400',
    indigo: active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400',
  };
  
  return (
    <div className={`p-4 rounded-2xl border transition-all ${active ? 'border-transparent shadow-md scale-[1.02]' : 'border-slate-100 opacity-60'}`}>
       <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
       </div>
       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
       <p className={`text-xs font-bold mt-1 ${active ? 'text-slate-800' : 'text-slate-400'}`}>{value}</p>
    </div>
  );
};

const DataDetail = ({ icon, label, value }: any) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-slate-300">{icon}</div>
    <div>
       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
       <p className="text-xs font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

const FilterItem = ({ label, warning }: { label: string, warning?: boolean }) => (
  <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
     <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-turqui focus:ring-turqui" />
     <span className={`text-[11px] font-medium ${warning ? 'text-amber-600' : 'text-slate-600'}`}>{label}</span>
  </label>
);

export default Directory;
