
import React, { useState, useEffect } from 'react';
import { UserRole, User, ApostolicAxis, Task, PrayerRequest, ContentPiece, Group, CalendarEvent, AttendanceSession, CRMFollowUp } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Operations from './components/Operations';
import Directory from './components/Directory';
import TimeBank from './components/TimeBank';
import AdminManagement from './components/AdminManagement';
import CalendarView, { initialCalendarEvents } from './components/CalendarView';
import ProjectManager from './components/ProjectManager';
import BuzonPeticiones from './components/BuzonPeticiones';
import MinistryPanel from './components/MinistryPanel';
import MediaStrategy from './components/MediaStrategy';
import Grupos, { initialGroups } from './components/Grupos';
import ContentManager from './components/ContentManager';
import Asistencia from './components/Asistencia';
import CRMSeguimiento from './components/CRMSeguimiento';
import MinisterioDashboard from './components/MinisterioDashboard';
import Login from './components/Login';
import { AXIS_SCHEMA as INITIAL_SCHEMA } from './constants';
import { airtableIsActive } from './services/airtableService';
import { getStoredSession, logout as authLogout, sessionToUser } from './services/authService';

const STORAGE_KEYS = {
  USERS:      'tafe_erp_users',
  TASKS:      'tafe_erp_tasks',
  PETITIONS:  'tafe_erp_petitions',
  SCHEMA:     'tafe_erp_axis_schema',
  CONTENT:    'tafe_erp_content',
  GROUPS:     'tafe_erp_groups',
  EVENTS:     'tafe_erp_events',
  ATTENDANCE: 'tafe_erp_attendance',
  CRM:        'tafe_erp_crm',
};

const initialTasks: Task[] = [
  { id: 'med_e1_1', title: 'Cobertura Audiovisual: Evangelismo Sector A', description: 'Registro de fotos y clips de testimonios durante la jornada.', ministry: 'CSI / Medios', assignedTo: 'u_sky', dueDate: '2026-01-05', status: 'PENDING', category: 'CONTENIDO', axis: 'E1_EVANGELISMO', teamSizeRequired: 3, estimatedHours: 6 },
  { id: 'med_e5_1', title: 'Diseño: Pieza Cosecha de Almas', description: 'Creación de imagen para Instagram/FB con data del domingo.', ministry: 'CSI / Medios', assignedTo: 'u_sky', dueDate: '2026-01-07', status: 'PENDING', category: 'DISEÑO', axis: 'E5_ALABANZA_AV', teamSizeRequired: 1, estimatedHours: 4 },
  { id: 'med_e3_1', title: 'Mapeo de Datos: Puente a Consolidación', description: 'Digitalización de fichas recolectadas y envío a E3.', ministry: 'CSI / Medios', assignedTo: 'u_sky', dueDate: '2026-01-06', status: 'PENDING', category: 'TECNICO', axis: 'E3_CONSOLIDACION', teamSizeRequired: 2, estimatedHours: 3 },
  { id: 'med_fri', title: 'Setup Rutina Viernes 7:30 PM', description: 'Preparación técnica completa para el servicio de enseñanza.', ministry: 'CSI / Medios', assignedTo: 'u_sky', dueDate: '2026-01-09', status: 'PENDING', category: 'TECNICO', axis: 'E5_ALABANZA_AV', teamSizeRequired: 4, estimatedHours: 3 },
];

// Inicializar currentUser desde la sesión guardada (evita flash de login)
const initCurrentUser = (): User | null => {
  const session = getStoredSession();
  return session ? sessionToUser(session) : null;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(initCurrentUser);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [axisSchema, setAxisSchema] = useState(INITIAL_SCHEMA);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [petitions, setPetitions] = useState<PrayerRequest[]>([]);
  const [contentPieces, setContentPieces] = useState<ContentPiece[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSession[]>([]);
  const [crmFollowUps, setCrmFollowUps] = useState<CRMFollowUp[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // ── Carga inicial desde localStorage ──────────────────────────────────────
  useEffect(() => {
    const savedUsers    = localStorage.getItem(STORAGE_KEYS.USERS);
    const savedTasks    = localStorage.getItem(STORAGE_KEYS.TASKS);
    const savedPetitions= localStorage.getItem(STORAGE_KEYS.PETITIONS);
    const savedSchema   = localStorage.getItem(STORAGE_KEYS.SCHEMA);
    const savedContent  = localStorage.getItem(STORAGE_KEYS.CONTENT);
    const savedGroups   = localStorage.getItem(STORAGE_KEYS.GROUPS);
    const savedEvents   = localStorage.getItem(STORAGE_KEYS.EVENTS);
    const savedAttend   = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const savedCRM      = localStorage.getItem(STORAGE_KEYS.CRM);

    if (savedUsers)   setUsers(JSON.parse(savedUsers));
    if (savedTasks)   setTasks(JSON.parse(savedTasks));
    else              setTasks(initialTasks);
    if (savedPetitions) setPetitions(JSON.parse(savedPetitions));
    if (savedSchema)  setAxisSchema(JSON.parse(savedSchema));
    if (savedContent) setContentPieces(JSON.parse(savedContent));

    if (savedGroups) {
      const parsed = JSON.parse(savedGroups);
      setGroups(parsed.length > 0 ? parsed : initialGroups);
    } else {
      setGroups(initialGroups);
    }

    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      setCalendarEvents(parsed.length > 0 ? parsed : initialCalendarEvents);
    } else {
      setCalendarEvents(initialCalendarEvents);
    }

    if (savedAttend) setAttendance(JSON.parse(savedAttend));
    if (savedCRM)    setCrmFollowUps(JSON.parse(savedCRM));
  }, []);

  // ── Persistencia automática ────────────────────────────────────────────────
  useEffect(() => { if (users.length)         localStorage.setItem(STORAGE_KEYS.USERS,      JSON.stringify(users)); }, [users]);
  useEffect(() => { if (tasks.length)         localStorage.setItem(STORAGE_KEYS.TASKS,      JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => {                            localStorage.setItem(STORAGE_KEYS.PETITIONS,  JSON.stringify(petitions)); }, [petitions]);
  useEffect(() => {                            localStorage.setItem(STORAGE_KEYS.SCHEMA,     JSON.stringify(axisSchema)); }, [axisSchema]);
  useEffect(() => {                            localStorage.setItem(STORAGE_KEYS.CONTENT,    JSON.stringify(contentPieces)); }, [contentPieces]);
  useEffect(() => {                            localStorage.setItem(STORAGE_KEYS.GROUPS,     JSON.stringify(groups)); }, [groups]);
  useEffect(() => { if (calendarEvents.length) localStorage.setItem(STORAGE_KEYS.EVENTS,    JSON.stringify(calendarEvents)); }, [calendarEvents]);
  useEffect(() => {                            localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => {                            localStorage.setItem(STORAGE_KEYS.CRM,        JSON.stringify(crmFollowUps)); }, [crmFollowUps]);

  // ── Autenticación ──────────────────────────────────────────────────────────

  if (!currentUser) {
    return <Login onLogin={(user) => { setCurrentUser(user); }} />;
  }

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

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
      spiritualStatus: 'PROSPECTO',
    };
    setUsers(prev => [newUser, ...prev]);
    setNotificationCount(prev => prev + 1);
  };

  const handleApproveUser = (userId: string, ministry: string, axis: ApostolicAxis) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, status: 'APPROVED', role: UserRole.MIEMBRO, ministry, axis } : u
    ));
  };

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    setNotificationCount(prev => prev + 1);
  };

  const handleImportData = (newData: any) => {
    if (newData.users)    setUsers(newData.users);
    if (newData.tasks)    setTasks(newData.tasks);
    if (newData.petitions) setPetitions(newData.petitions);
    alert('Datos importados con éxito');
  };

  // ── Renderizado de módulos ─────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':     return <Dashboard role={currentUser.role} />;
      case 'ministry_panel':return <MinistryPanel user={currentUser} tasks={tasks} onAddTask={handleAddTask} />;
      case 'media_strategy':return <MediaStrategy tasks={tasks} role={currentUser.role} />;
      case 'content_manager':return (
        <ContentManager
          pieces={contentPieces}
          role={currentUser.role}
          onAdd={piece => setContentPieces(prev => [piece, ...prev])}
          onUpdate={piece => setContentPieces(prev => prev.map(p => p.id === piece.id ? piece : p))}
          onDelete={id => setContentPieces(prev => prev.filter(p => p.id !== id))}
        />
      );
      case 'projects':      return <ProjectManager user={currentUser} tasks={tasks} schema={axisSchema} onUpdateSchema={setAxisSchema} />;
      case 'operations':    return <Operations role={currentUser.role} tasks={tasks} setTasks={setTasks} />;
      case 'timebank':      return <TimeBank role={currentUser.role} user={currentUser} />;
      case 'calendar':      return <CalendarView role={currentUser.role} events={calendarEvents} setEvents={setCalendarEvents} />;
      case 'asistencia':    return (
        <Asistencia
          role={currentUser.role}
          users={users}
          sessions={attendance}
          setSessions={setAttendance}
          currentUserName={currentUser.name}
        />
      );
      case 'crm_seguimiento': return (
        <CRMSeguimiento
          role={currentUser.role}
          followUps={crmFollowUps}
          setFollowUps={setCrmFollowUps}
          users={users}
        />
      );
      case 'mi_ministerio': return (
        <MinisterioDashboard
          ministry={currentUser.ministry}
          role={currentUser.role}
          users={users}
          sessions={attendance}
        />
      );
      case 'pastoral_inbox': return <BuzonPeticiones user={currentUser} users={users} initialRequests={petitions} onUpdateRequests={setPetitions} />;
      case 'grupos':         return <Grupos currentRole={currentUser.role} users={users} groups={groups} onUpdateGroups={setGroups} />;
      case 'directory':      return <Directory currentUser={currentUser} onCreateProspect={handleCreateProspect} />;
      case 'admin_mgmt':     return <AdminManagement users={users} tasks={tasks} petitions={petitions} onApprove={handleApproveUser} onImport={handleImportData} />;
      default:               return <Dashboard role={currentUser.role} />;
    }
  };

  // ── Layout principal ───────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentUser.role}
        currentUserMinistry={currentUser.ministry}
        onRoleChange={(r) => setCurrentUser(prev => prev ? { ...prev, role: r } : prev)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={currentUser}
          notificationCount={notificationCount}
          onClearNotifications={() => setNotificationCount(0)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Status bar */}
            <div className="flex justify-between items-center bg-white/50 p-2 px-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${airtableIsActive() ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {airtableIsActive() ? 'Airtable: Conectado' : 'Modo Local (sin Airtable)'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-bold hidden md:block">
                  {currentUser.name} · {
                    currentUser.id === 'u_sky'
                      ? 'Developer · CSI/Medios'
                      : currentUser.role.replace(/_/g, ' ')
                  }
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-bold text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
