
import React, { useState, useEffect } from 'react';
import { UserRole, User, ApostolicAxis, Task, PrayerRequest } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Operations from './components/Operations';
import Directory from './components/Directory';
import TimeBank from './components/TimeBank';
import AdminManagement from './components/AdminManagement';
import CalendarView from './components/CalendarView';
import ProjectManager from './components/ProjectManager';
import BuzonPeticiones from './components/BuzonPeticiones';
import MinistryPanel from './components/MinistryPanel';
import MediaStrategy from './components/MediaStrategy';
import Onboarding from './components/Onboarding';
import { AXIS_SCHEMA as INITIAL_SCHEMA } from './constants';
import { airtableIsActive } from './services/airtableService';

const STORAGE_KEYS = {
  USERS: 'tafe_erp_users',
  TASKS: 'tafe_erp_tasks',
  PETITIONS: 'tafe_erp_petitions',
  SCHEMA: 'tafe_erp_axis_schema'
};

const initialTasks: Task[] = [
  { id: 'med_e1_1', title: 'Cobertura Audiovisual: Evangelismo Sector A', description: 'Registro de fotos y clips de testimonios durante la jornada.', ministry: 'CSI / Medios', assignedTo: 'u_lider_demo', dueDate: '2026-01-05', status: 'PENDING', category: 'CONTENIDO', axis: 'E1_EVANGELISMO', teamSizeRequired: 3, estimatedHours: 6 },
  { id: 'med_e5_1', title: 'Diseño: Pieza Cosecha de Almas', description: 'Creación de imagen para Instagram/FB con data del domingo.', ministry: 'CSI / Medios', assignedTo: 'u_lider_demo', dueDate: '2026-01-07', status: 'PENDING', category: 'DISEÑO', axis: 'E5_ALABANZA_AV', teamSizeRequired: 1, estimatedHours: 4 },
  { id: 'med_e3_1', title: 'Mapeo de Datos: Puente a Consolidación', description: 'Digitalización de fichas recolectadas y envío a E3.', ministry: 'CSI / Medios', assignedTo: 'u_lider_demo', dueDate: '2026-01-06', status: 'PENDING', category: 'TECNICO', axis: 'E3_CONSOLIDACION', teamSizeRequired: 2, estimatedHours: 3 },
  { id: 'med_fri', title: 'Setup Rutina Viernes 7:30 PM', description: 'Preparación técnica completa para el servicio de enseñanza.', ministry: 'CSI / Medios', assignedTo: 'u_lider_demo', dueDate: '2026-01-09', status: 'PENDING', category: 'TECNICO', axis: 'E5_ALABANZA_AV', teamSizeRequired: 4, estimatedHours: 3 },
];

const mockInitialUsers: User[] = [
  { 
    id: 'u_lider_demo', 
    name: 'Pr. David Lever', 
    role: UserRole.SUPER_ADMIN, 
    status: 'APPROVED', 
    ministry: 'CSI / Medios', 
    skills: ['Innovación', 'Gestión IA'], 
    contact: 'david@iglesiatafe.com', 
    joinedDate: '2022-01-01', 
    complianceRate: 100, 
    timeBankBalance: 42.5, 
    socialValueGenerated: 1250, 
    relationships: [], 
    dataDepth: 'DEEP', 
    isBaptized: true, 
    isRegularAttendee: true, 
    completedBasicStudies: true, 
    leadershipLevel: 4, 
    accessLevel: 'GLOBAL', 
    authorizedMinistries: ['CSI / Medios', 'Alabanza'] 
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [axisSchema, setAxisSchema] = useState(INITIAL_SCHEMA);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [petitions, setPetitions] = useState<PrayerRequest[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [currentUser, setCurrentUser] = useState<User>(mockInitialUsers[0]);

  // CARGA INICIAL DESDE LOCALSTORAGE
  useEffect(() => {
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const savedPetitions = localStorage.getItem(STORAGE_KEYS.PETITIONS);
    const savedSchema = localStorage.getItem(STORAGE_KEYS.SCHEMA);

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    else setUsers(mockInitialUsers);

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    else setTasks(initialTasks);

    if (savedPetitions) setPetitions(JSON.parse(savedPetitions));
    
    if (savedSchema) setAxisSchema(JSON.parse(savedSchema));
  }, []);

  // PERSISTENCIA AUTOMÁTICA
  useEffect(() => { if (users.length) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { if (tasks.length) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PETITIONS, JSON.stringify(petitions)); }, [petitions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SCHEMA, JSON.stringify(axisSchema)); }, [axisSchema]);

  const handleOnboardingComplete = (data: any) => {
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: data.name,
      role: UserRole.PROSPECTO,
      status: 'PENDING_APPROVAL',
      skills: data.skills,
      contact: data.email,
      motivation: data.motivation,
      joinedDate: new Date().toISOString().split('T')[0],
      complianceRate: 0,
      timeBankBalance: 0,
      socialValueGenerated: 0,
      relationships: [],
      dataDepth: 'INITIAL',
      isBaptized: false,
      isRegularAttendee: false,
      completedBasicStudies: false,
      leadershipLevel: 0,
      accessLevel: 'MINISTERIAL'
    };
    setUsers(prev => [newUser, ...prev]);
    alert("¡Registro enviado! Un administrador revisará tu perfil.");
  };

  const handleCreateProspect = (data: Partial<User>) => {
    const newUser: User = {
      id: `u_ev_${Date.now()}`,
      name: data.name || 'Sin Nombre',
      role: UserRole.PROSPECTO,
      status: 'PENDING_APPROVAL',
      skills: [],
      contact: data.phone || 'Sin Contacto',
      phone: data.phone,
      address: data.address,
      age: data.age,
      hasChildren: data.hasChildren,
      prayerRequests: data.prayerRequests,
      originGroup: data.originGroup,
      joinedDate: new Date().toISOString().split('T')[0],
      complianceRate: 0,
      timeBankBalance: 0,
      socialValueGenerated: 0,
      relationships: [],
      dataDepth: 'INITIAL',
      isBaptized: false,
      isRegularAttendee: false,
      completedBasicStudies: false,
      leadershipLevel: 0,
      accessLevel: 'MINISTERIAL',
      spiritualStatus: 'PROSPECTO'
    };
    setUsers(prev => [newUser, ...prev]);
    setNotificationCount(prev => prev + 1);
  };

  const handleApproveUser = (userId: string, ministry: string, axis: ApostolicAxis) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) return { ...u, status: 'APPROVED', role: UserRole.MIEMBRO, ministry, axis };
      return u;
    }));
  };

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    setNotificationCount(prev => prev + 1);
  };

  const handleImportData = (newData: any) => {
    if (newData.users) setUsers(newData.users);
    if (newData.tasks) setTasks(newData.tasks);
    if (newData.petitions) setPetitions(newData.petitions);
    alert("Datos importados con éxito");
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard role={currentUser.role} />;
      case 'ministry_panel': return <MinistryPanel user={currentUser} tasks={tasks} onAddTask={handleAddTask} />;
      case 'media_strategy': return <MediaStrategy tasks={tasks} role={currentUser.role} />;
      case 'projects': return <ProjectManager user={currentUser} tasks={tasks} schema={axisSchema} onUpdateSchema={setAxisSchema} />;
      case 'operations': return <Operations role={currentUser.role} axisSchema={axisSchema} tasks={tasks} setTasks={setTasks} />;
      case 'timebank': return <TimeBank role={currentUser.role} user={currentUser} />;
      case 'calendar': return <CalendarView role={currentUser.role} />;
      case 'pastoral_inbox': return <BuzonPeticiones user={currentUser} initialRequests={petitions} onUpdateRequests={setPetitions} />;
      case 'directory': return <Directory currentUser={currentUser} onCreateProspect={handleCreateProspect} />;
      case 'admin_mgmt': return <AdminManagement users={users} tasks={tasks} petitions={petitions} onApprove={handleApproveUser} onImport={handleImportData} />;
      default: return <Dashboard role={currentUser.role} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentRole={currentUser.role} onRoleChange={(r) => setCurrentUser(prev => ({...prev, role: r}))} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={currentUser} notificationCount={notificationCount} onClearNotifications={() => setNotificationCount(0)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white/50 p-2 rounded-xl border border-slate-200">
               <div className="flex items-center gap-3 ml-4">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${airtableIsActive() ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {airtableIsActive() ? 'Airtable: Conectado' : 'Base de Datos: Modo Local'}
                  </span>
               </div>
               <button onClick={() => setIsAuthenticated(!isAuthenticated)} className="text-[10px] font-bold bg-navy-tafe text-white px-4 py-1.5 rounded-lg hover:bg-turqui transition-all">
                 {isAuthenticated ? 'Onboarding' : 'Volver'}
               </button>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
