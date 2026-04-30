import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from '../types';
import {
  Search, X, Filter, Users, AlertCircle,
  MapPin, Phone, Calendar, Flame, Check,
  Mail, CreditCard, Building2, Droplet, Loader, WifiOff,
  UserCircle, Database, RefreshCw, HardDrive,
  Pencil, Save, BookOpen, Target, Star,
} from 'lucide-react';
import {
  getDirectorioMiembros, DirectorioMiembroFields,
  directorioIsActive, updateDirectorioMiembro,
  EstadoEspiritual, NivelAtencionCRM,
} from '../services/airtableService';
import { getCache, setCache, clearCache, getCacheAge, getCacheSize } from '../services/cacheService';

// ─── Types ───────────────────────────────────────────────────────────────────

type AirtableMember = { id: string; fields: DirectorioMiembroFields };

const CACHE_KEY = 'tafe_directorio_miembros';
const CACHE_TTL_H = 24;

const ESTADOS_ESPIRITUALES: EstadoEspiritual[] = ['PROSPECTO','VISITANTE','NUEVO_CREYENTE','CONSOLIDADO','DISCIPULO','LIDER'];
const NIVELES_ATENCION: NivelAtencionCRM[] = ['PROSPECTO','PRIMER_CONTACTO','BIENVENIDA','INTEGRADO','DISCIPULO','LIDER'];
const EJES = ['E1','E2','E3','E4','E5','E6','E7'];

const estadoLabel: Record<EstadoEspiritual, string> = {
  PROSPECTO: 'Prospecto', VISITANTE: 'Visitante', NUEVO_CREYENTE: 'Nuevo Creyente',
  CONSOLIDADO: 'Consolidado', DISCIPULO: 'Discípulo', LIDER: 'Líder',
};

const nivelLabel: Record<NivelAtencionCRM, string> = {
  PROSPECTO: 'Prospecto', PRIMER_CONTACTO: 'Primer Contacto', BIENVENIDA: 'Bienvenida',
  INTEGRADO: 'Integrado', DISCIPULO: 'Discípulo', LIDER: 'Líder',
};

const nivelColor: Record<NivelAtencionCRM, string> = {
  PROSPECTO:       'bg-slate-100 text-slate-600 border-slate-200',
  PRIMER_CONTACTO: 'bg-amber-100 text-amber-700 border-amber-200',
  BIENVENIDA:      'bg-blue-100 text-blue-700 border-blue-200',
  INTEGRADO:       'bg-purple-100 text-purple-700 border-purple-200',
  DISCIPULO:       'bg-turqui/10 text-turqui border-turqui/30',
  LIDER:           'bg-navy-tafe/10 text-navy-tafe border-navy-tafe/20',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const initials = (name: string) =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const fuenteColor: Record<string, string> = {
  'Membresía Oficial': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Evangelismos': 'bg-amber-100 text-amber-700 border-amber-200',
  'Lista de ministerios': 'bg-blue-100 text-blue-700 border-blue-200',
};

const sedeColor: Record<string, string> = {
  'Principal': 'bg-navy-tafe/10 text-navy-tafe border-navy-tafe/20',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const AvatarCircle: React.FC<{ name: string; size?: string }> = ({ name, size = 'w-12 h-12' }) => {
  const colors = ['bg-turqui', 'bg-navy-tafe', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500'];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div className={`${size} rounded-2xl ${colors[idx]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
      {initials(name)}
    </div>
  );
};

const Badge: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => (
  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${className}`}>{label}</span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface DirectoryProps {
  currentUser: User;
  onCreateProspect?: (data: Partial<User>) => void;
}

const Directory: React.FC<DirectoryProps> = ({ currentUser, onCreateProspect }) => {
  const [members, setMembers] = useState<AirtableMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cacheAge, setCacheAge] = useState<string | null>(null);
  const [cacheSize, setCacheSize] = useState(0);
  const [fromCache, setFromCache] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFuente, setFilterFuente] = useState('');
  const [filterSexo, setFilterSexo] = useState('');
  const [filterSede, setFilterSede] = useState('');
  const [filterNivel, setFilterNivel] = useState('');
  const [selectedMember, setSelectedMember] = useState<AirtableMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState<Partial<DirectorioMiembroFields>>({});
  const [saving, setSaving] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 48;

  const [harvestData, setHarvestData] = useState<Partial<User>>({
    name: '', phone: '', age: 0, address: '', hasChildren: false, prayerRequests: '', originGroup: '',
  });

  const isOnline = directorioIsActive();
  const canCreate = currentUser.role !== UserRole.MIEMBRO;

  const loadFromAirtable = async () => {
    setLoading(true);
    setError(null);
    setLoadProgress(0);
    setFromCache(false);
    try {
      const data = await getDirectorioMiembros(n => setLoadProgress(n));
      setMembers(data);
      setCache(CACHE_KEY, data, CACHE_TTL_H);
      setCacheAge(getCacheAge(CACHE_KEY));
      setCacheSize(getCacheSize(CACHE_KEY));
    } catch {
      setError('Error al cargar desde Airtable. Verifica los permisos del token.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try cache first
    const cached = getCache<AirtableMember[]>(CACHE_KEY);
    if (cached && cached.length > 0) {
      setMembers(cached);
      setFromCache(true);
      setCacheAge(getCacheAge(CACHE_KEY));
      setCacheSize(getCacheSize(CACHE_KEY));
      return;
    }
    // No cache → fetch from Airtable if configured
    if (isOnline) loadFromAirtable();
  }, [isOnline]);

  const filtered = useMemo(() => {
    let list = members;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(m =>
        m.fields['Nombre Completo']?.toLowerCase().includes(q) ||
        m.fields.Teléfono?.includes(q) ||
        String(m.fields.Cedula ?? '').includes(q) ||
        m.fields.Email?.toLowerCase().includes(q)
      );
    }
    if (filterFuente) list = list.filter(m => m.fields.Fuente === filterFuente);
    if (filterSexo) list = list.filter(m => m.fields.Sexo === filterSexo);
    if (filterSede) list = list.filter(m => m.fields['Sede de Iglesia TAFE'] === filterSede);
    if (filterNivel) list = list.filter(m => m.fields.Nivel_Atencion === filterNivel);
    return list;
  }, [members, searchTerm, filterFuente, filterSexo, filterSede, filterNivel]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  // Stats
  const totalMiembros = members.filter(m => m.fields.Fuente === 'Membresía Oficial').length;
  const totalEvangelismo = members.filter(m => m.fields.Fuente === 'Evangelismos').length;
  const totalPrincipal = members.filter(m => m.fields['Sede de Iglesia TAFE'] === 'Principal').length;

  const handleHarvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateProspect) {
      onCreateProspect(harvestData);
      setShowHarvestModal(false);
      setHarvestData({ name: '', phone: '', age: 0, address: '', hasChildren: false, prayerRequests: '', originGroup: '' });
    }
  };

  const clearFilters = () => { setFilterFuente(''); setFilterSexo(''); setFilterSede(''); setFilterNivel(''); setSearchTerm(''); };
  const hasFilters = !!(filterFuente || filterSexo || filterSede || filterNivel || searchTerm);

  const openEditMode = (m: AirtableMember) => {
    setEditFields({
      Estado_Espiritual: m.fields.Estado_Espiritual,
      Nivel_Atencion: m.fields.Nivel_Atencion,
      Celula_Actual: m.fields.Celula_Actual ?? '',
      Eje_Apostolico: m.fields.Eje_Apostolico ?? '',
      Ministerio_Activo: m.fields.Ministerio_Activo ?? '',
      Bautizado: m.fields.Bautizado ?? false,
      Asistencia_Regular: m.fields.Asistencia_Regular ?? false,
      Curso_Afirmando_Pasos: m.fields.Curso_Afirmando_Pasos ?? false,
      Escuela_NuevaVida_Cristo: m.fields.Escuela_NuevaVida_Cristo ?? false,
      Escuela_Liderazgo: m.fields.Escuela_Liderazgo ?? false,
      Ultimo_Contacto: m.fields.Ultimo_Contacto ?? '',
      Responsable_Seguimiento: m.fields.Responsable_Seguimiento ?? '',
      Notas_CRM: m.fields.Notas_CRM ?? '',
      Peticion_Oracion: m.fields.Peticion_Oracion ?? '',
      Pendiente_Ministerio: m.fields.Pendiente_Ministerio ?? '',
    });
    setIsEditing(true);
  };

  const handleSaveCRM = async () => {
    if (!selectedMember) return;
    setSaving(true);
    try {
      await updateDirectorioMiembro(selectedMember.id, editFields);
      setMembers(prev => prev.map(m =>
        m.id === selectedMember.id ? { ...m, fields: { ...m.fields, ...editFields } } : m
      ));
      setSelectedMember(prev => prev ? { ...prev, fields: { ...prev.fields, ...editFields } } : prev);
      setIsEditing(false);
    } catch (err) {
      alert('Error al guardar: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-slate-800">Directorio de Conexión</h2>
          <p className="text-slate-500 text-sm italic">"Trazabilidad de Reino para el Cuidado de la Familia"</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {loading ? (
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <Loader size={12} className="animate-spin text-turqui" />
              <span className="text-[10px] font-bold text-slate-500">Descargando... {loadProgress} registros</span>
            </div>
          ) : members.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className={`bg-white px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2`}>
                <HardDrive size={12} className={fromCache ? 'text-emerald-500' : 'text-turqui'} />
                <span className="text-[10px] font-bold text-slate-500">
                  {members.length.toLocaleString()} registros
                  {fromCache ? ` · caché (${cacheAge})` : ' · Airtable'}
                  {cacheSize > 0 && ` · ${cacheSize}KB`}
                </span>
              </div>
              {isOnline && (
                <button
                  onClick={() => { clearCache(CACHE_KEY); loadFromAirtable(); }}
                  title="Actualizar desde Airtable"
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:border-turqui hover:text-turqui transition-all"
                >
                  <RefreshCw size={14} className="text-slate-400" />
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-amber-400' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-bold text-slate-500">
                {isOnline ? 'Sin datos — verifica permisos del token' : 'Airtable no configurado'}
              </span>
            </div>
          )}
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

      {/* Stats */}
      {members.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total registros', value: members.length, icon: <Database size={16} />, color: 'text-navy-tafe' },
            { label: 'Membresía Oficial', value: totalMiembros, icon: <Users size={16} />, color: 'text-emerald-600' },
            { label: 'Evangelizados', value: totalEvangelismo, icon: <Flame size={16} />, color: 'text-amber-600' },
            { label: 'Sede Principal', value: totalPrincipal, icon: <Building2 size={16} />, color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className={`flex items-center gap-2 mb-1 ${s.color}`}>{s.icon}<span className="text-[9px] font-bold uppercase tracking-widest">{s.label}</span></div>
              <p className="text-2xl font-montserrat font-bold text-slate-800">{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* No Airtable configured */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-8 flex items-center gap-4">
          <WifiOff className="text-amber-500 shrink-0" size={28} />
          <div>
            <p className="font-bold text-amber-800">Directorio Airtable no configurado</p>
            <p className="text-sm text-amber-700 mt-1">
              Agrega <code className="bg-amber-100 px-1 rounded text-xs">VITE_AIRTABLE_BASE_ID1=appOhMA4UJPwKSGP2</code> en las variables de entorno de Render.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de filtros */}
        <aside className="lg:col-span-1 space-y-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Nombre, cédula, teléfono..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>

            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Filter size={10} /> Fuente</p>
              {['Membresía Oficial', 'Evangelismos', 'Lista de ministerios'].map(f => (
                <button
                  key={f}
                  onClick={() => { setFilterFuente(filterFuente === f ? '' : f); setPage(1); }}
                  className={`w-full text-left text-[11px] font-medium px-3 py-2 rounded-xl transition-all mb-1 ${filterFuente === f ? 'bg-navy-tafe text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sexo</p>
              {['Masculino', 'Femenino'].map(s => (
                <button
                  key={s}
                  onClick={() => { setFilterSexo(filterSexo === s ? '' : s); setPage(1); }}
                  className={`w-full text-left text-[11px] font-medium px-3 py-2 rounded-xl transition-all mb-1 ${filterSexo === s ? 'bg-navy-tafe text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sede</p>
              {['Principal'].map(s => (
                <button
                  key={s}
                  onClick={() => { setFilterSede(filterSede === s ? '' : s); setPage(1); }}
                  className={`w-full text-left text-[11px] font-medium px-3 py-2 rounded-xl transition-all mb-1 ${filterSede === s ? 'bg-navy-tafe text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Target size={10} /> Nivel CRM</p>
              {NIVELES_ATENCION.map(n => (
                <button
                  key={n}
                  onClick={() => { setFilterNivel(filterNivel === n ? '' : n); setPage(1); }}
                  className={`w-full text-left text-[11px] font-medium px-3 py-2 rounded-xl transition-all mb-1 ${filterNivel === n ? 'bg-navy-tafe text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  {nivelLabel[n]}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-600 pt-2 border-t border-slate-100 flex items-center justify-center gap-1">
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </div>

          {filtered.length !== members.length && (
            <div className="bg-turqui/5 border border-turqui/20 rounded-2xl p-3 text-center">
              <p className="text-[10px] font-bold text-turqui">{filtered.length.toLocaleString()} resultados</p>
              <p className="text-[9px] text-slate-400">de {members.length.toLocaleString()} total</p>
            </div>
          )}
        </aside>

        {/* Grid de miembros */}
        <div className="lg:col-span-3">
          {loading && members.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-2 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && members.length > 0 && (
            <div className="text-center py-16 text-slate-400">
              <Search size={32} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold">Sin resultados para "{searchTerm}"</p>
              <p className="text-xs mt-1">Intenta con nombre, cédula o teléfono</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map(m => {
              const f = m.fields;
              const nombre = f['Nombre Completo'] || '—';
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMember(m)}
                  className="bg-white p-5 rounded-[2rem] border border-slate-100 hover:border-turqui/40 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <AvatarCircle name={nombre} />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-turqui transition-colors truncate">{nombre}</h4>
                      {f.Teléfono && <p className="text-[10px] text-slate-400 font-medium">{f.Teléfono}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 relative z-10">
                    {f.Fuente && <Badge label={f.Fuente} className={fuenteColor[f.Fuente] ?? 'bg-slate-100 text-slate-500 border-slate-200'} />}
                    {f['Sede de Iglesia TAFE'] && <Badge label={f['Sede de Iglesia TAFE']} className={sedeColor[f['Sede de Iglesia TAFE']] ?? 'bg-slate-100 text-slate-500 border-slate-200'} />}
                  </div>

                  {(f['Dirección / Barrio'] || f.Sexo) && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50 relative z-10">
                      {f['Dirección / Barrio'] && (
                        <div className="flex items-center gap-1 text-slate-400 min-w-0">
                          <MapPin size={10} />
                          <span className="text-[9px] font-medium truncate">{f['Dirección / Barrio']}</span>
                        </div>
                      )}
                      {f.Sexo && <span className="text-[9px] font-bold text-slate-300 ml-auto shrink-0">{f.Sexo === 'Masculino' ? '♂' : '♀'}</span>}
                    </div>
                  )}

                  <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
                    <UserCircle size={80} />
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:border-turqui hover:text-turqui transition-all"
              >
                Ver más ({filtered.length - paginated.length} restantes)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detalle del Miembro */}
      {selectedMember && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto animate-slideLeft">
            {/* Header */}
            <div className="bg-navy-tafe p-8 text-white relative">
              <button
                onClick={() => { setSelectedMember(null); setIsEditing(false); }}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-5">
                <AvatarCircle name={selectedMember.fields['Nombre Completo'] || '?'} size="w-20 h-20" />
                <div>
                  <h3 className="text-2xl font-montserrat font-bold leading-tight">{selectedMember.fields['Nombre Completo']}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMember.fields.Fuente && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${fuenteColor[selectedMember.fields.Fuente] ?? 'bg-white/10 text-white border-white/20'}`}>
                        {selectedMember.fields.Fuente}
                      </span>
                    )}
                    {selectedMember.fields['Sede de Iglesia TAFE'] && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-turqui/20 text-turqui border border-turqui/30">
                        {selectedMember.fields['Sede de Iglesia TAFE']}
                      </span>
                    )}
                    {selectedMember.fields.Nivel_Atencion && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${nivelColor[selectedMember.fields.Nivel_Atencion]}`}>
                        {nivelLabel[selectedMember.fields.Nivel_Atencion]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-6">

              {/* Contacto */}
              <DetailSection title="Contacto">
                <DetailRow icon={<Phone size={14} />} label="Teléfono" value={selectedMember.fields.Teléfono} />
                <DetailRow icon={<Mail size={14} />} label="Email" value={selectedMember.fields.Email} />
                <DetailRow icon={<MapPin size={14} />} label="Dirección / Barrio" value={selectedMember.fields['Dirección / Barrio']} />
              </DetailSection>

              {/* Datos Personales */}
              <DetailSection title="Datos Personales">
                <DetailRow icon={<CreditCard size={14} />} label="Cédula" value={selectedMember.fields.Cedula ? String(selectedMember.fields.Cedula) : undefined} />
                <DetailRow icon={<Calendar size={14} />} label="Fecha de Nacimiento" value={selectedMember.fields['Fecha de Nacimiento']} />
                <DetailRow icon={<Users size={14} />} label="Sexo" value={selectedMember.fields.Sexo} />
                <DetailRow icon={<Droplet size={14} />} label="Tipo de Sangre" value={selectedMember.fields['Tipo de Sangre']} />
              </DetailSection>

              {/* Iglesia */}
              <DetailSection title="Iglesia">
                <DetailRow icon={<Building2 size={14} />} label="Sede" value={selectedMember.fields['Sede de Iglesia TAFE']} />
                <DetailRow icon={<Database size={14} />} label="Fuente" value={selectedMember.fields.Fuente} />
                <DetailRow icon={<Target size={14} />} label="Ministerio Activo" value={selectedMember.fields.Ministerio_Activo} />
                <DetailRow icon={<Star size={14} />} label="Célula" value={selectedMember.fields.Celula_Actual} />
                <DetailRow icon={<BookOpen size={14} />} label="Eje Apostólico" value={selectedMember.fields.Eje_Apostolico} />
              </DetailSection>

              {/* CRM / Seguimiento — vista o edición */}
              {!isEditing ? (
                <>
                  <DetailSection title="Crecimiento Espiritual">
                    <DetailRow icon={<Star size={14} />} label="Estado Espiritual" value={selectedMember.fields.Estado_Espiritual ? estadoLabel[selectedMember.fields.Estado_Espiritual] : undefined} />
                    <DetailRow icon={<Target size={14} />} label="Nivel CRM" value={selectedMember.fields.Nivel_Atencion ? nivelLabel[selectedMember.fields.Nivel_Atencion] : undefined} />
                    <CheckRow label="Bautizado" value={!!selectedMember.fields.Bautizado} />
                    <CheckRow label="Asistencia Regular" value={!!selectedMember.fields.Asistencia_Regular} />
                    <CheckRow label="Curso Afirmando los Pasos" value={!!selectedMember.fields.Curso_Afirmando_Pasos} />
                    <CheckRow label="Escuela Nueva Vida en Cristo" value={!!selectedMember.fields.Escuela_NuevaVida_Cristo} />
                    <CheckRow label="Escuela de Liderazgo" value={!!selectedMember.fields.Escuela_Liderazgo} />
                  </DetailSection>

                  {(selectedMember.fields.Responsable_Seguimiento || selectedMember.fields.Ultimo_Contacto || selectedMember.fields.Notas_CRM) && (
                    <DetailSection title="Seguimiento CRM">
                      <DetailRow icon={<Users size={14} />} label="Responsable" value={selectedMember.fields.Responsable_Seguimiento} />
                      <DetailRow icon={<Calendar size={14} />} label="Último Contacto" value={selectedMember.fields.Ultimo_Contacto} />
                      <DetailRow icon={<BookOpen size={14} />} label="Notas CRM" value={selectedMember.fields.Notas_CRM} />
                    </DetailSection>
                  )}

                  {(selectedMember.fields.Peticion_Oracion || selectedMember.fields.Pendiente_Ministerio) && (
                    <DetailSection title="Pendientes">
                      <DetailRow icon={<Star size={14} />} label="Petición de Oración" value={selectedMember.fields.Peticion_Oracion} />
                      <DetailRow icon={<AlertCircle size={14} />} label="Pendiente Ministerio" value={selectedMember.fields.Pendiente_Ministerio} />
                    </DetailSection>
                  )}

                  {canCreate && (
                    <button
                      onClick={() => openEditMode(selectedMember)}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-turqui/30 text-turqui font-bold text-sm rounded-2xl hover:bg-turqui/5 transition-all"
                    >
                      <Pencil size={16} /> Editar Seguimiento CRM
                    </button>
                  )}
                </>
              ) : (
                /* ── Formulario de edición CRM ── */
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Editando Seguimiento</p>
                    <button onClick={() => setIsEditing(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1"><X size={12} /> Cancelar</button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Estado Espiritual</label>
                      <select
                        value={editFields.Estado_Espiritual ?? ''}
                        onChange={e => setEditFields(p => ({ ...p, Estado_Espiritual: e.target.value as EstadoEspiritual || undefined }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui"
                      >
                        <option value="">— Sin definir —</option>
                        {ESTADOS_ESPIRITUALES.map(e => <option key={e} value={e}>{estadoLabel[e]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nivel CRM</label>
                      <select
                        value={editFields.Nivel_Atencion ?? ''}
                        onChange={e => setEditFields(p => ({ ...p, Nivel_Atencion: e.target.value as NivelAtencionCRM || undefined }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui"
                      >
                        <option value="">— Sin definir —</option>
                        {NIVELES_ATENCION.map(n => <option key={n} value={n}>{nivelLabel[n]}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Célula Actual</label>
                      <input type="text" value={editFields.Celula_Actual ?? ''} onChange={e => setEditFields(p => ({ ...p, Celula_Actual: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui" placeholder="Nombre de la célula" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Eje Apostólico</label>
                      <select value={editFields.Eje_Apostolico ?? ''} onChange={e => setEditFields(p => ({ ...p, Eje_Apostolico: e.target.value || undefined }))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui">
                        <option value="">— Sin asignar —</option>
                        {EJES.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ministerio Activo</label>
                    <input type="text" value={editFields.Ministerio_Activo ?? ''} onChange={e => setEditFields(p => ({ ...p, Ministerio_Activo: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui" placeholder="CSI / Medios, Alabanza..." />
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Formación</p>
                    {([
                      ['Bautizado', 'Bautizado'],
                      ['Asistencia_Regular', 'Asistencia Regular'],
                      ['Curso_Afirmando_Pasos', 'Curso Afirmando los Pasos'],
                      ['Escuela_NuevaVida_Cristo', 'Escuela Nueva Vida en Cristo'],
                      ['Escuela_Liderazgo', 'Escuela de Liderazgo'],
                    ] as [keyof DirectorioMiembroFields, string][]).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer py-1">
                        <div
                          onClick={() => setEditFields(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${editFields[key] ? 'bg-turqui border-turqui' : 'border-slate-300 hover:border-turqui'}`}
                        >
                          {editFields[key] && <Check size={12} className="text-white" />}
                        </div>
                        <span className="text-xs font-medium text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Último Contacto</label>
                      <input type="date" value={editFields.Ultimo_Contacto ?? ''} onChange={e => setEditFields(p => ({ ...p, Ultimo_Contacto: e.target.value || undefined }))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Responsable Seguimiento</label>
                      <input type="text" value={editFields.Responsable_Seguimiento ?? ''} onChange={e => setEditFields(p => ({ ...p, Responsable_Seguimiento: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui" placeholder="Nombre del responsable" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Notas CRM</label>
                    <textarea rows={3} value={editFields.Notas_CRM ?? ''} onChange={e => setEditFields(p => ({ ...p, Notas_CRM: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui resize-none" placeholder="Observaciones de seguimiento..." />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Petición de Oración</label>
                    <textarea rows={2} value={editFields.Peticion_Oracion ?? ''} onChange={e => setEditFields(p => ({ ...p, Peticion_Oracion: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui resize-none" placeholder="Necesidad específica..." />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pendiente Ministerio</label>
                    <textarea rows={2} value={editFields.Pendiente_Ministerio ?? ''} onChange={e => setEditFields(p => ({ ...p, Pendiente_Ministerio: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 ring-turqui resize-none" placeholder="Tarea o compromiso pendiente..." />
                  </div>

                  <button
                    onClick={handleSaveCRM}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-turqui text-white font-bold rounded-2xl shadow-lg shadow-turqui/20 hover:scale-[1.01] transition-all disabled:opacity-60"
                  >
                    {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Guardando en Airtable...' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Registro de Cosecha */}
      {showHarvestModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp">
            <form onSubmit={handleHarvestSubmit}>
              <div className="bg-turqui p-10 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-montserrat font-bold flex items-center gap-3"><Flame /> Registro de Cosecha</h3>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Nuevos Alcanzados — Jornada Evangelismo</p>
                </div>
                <button type="button" onClick={() => setShowHarvestModal(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={24} /></button>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Nombre y Apellido</label>
                    <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 ring-turqui text-sm" value={harvestData.name} onChange={e => setHarvestData({ ...harvestData, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Celular</label>
                      <input required type="tel" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 ring-turqui text-sm" value={harvestData.phone} onChange={e => setHarvestData({ ...harvestData, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Edad</label>
                      <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 ring-turqui text-sm" value={harvestData.age || ''} onChange={e => setHarvestData({ ...harvestData, age: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Dirección de Domicilio</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 ring-turqui text-sm" value={harvestData.address} onChange={e => setHarvestData({ ...harvestData, address: e.target.value })} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-600">Tiene Hijos</span>
                    <button type="button" onClick={() => setHarvestData({ ...harvestData, hasChildren: !harvestData.hasChildren })} className={`w-12 h-6 rounded-full transition-all relative ${harvestData.hasChildren ? 'bg-turqui' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${harvestData.hasChildren ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Grupo Evangelizador</label>
                    <input placeholder="Ej: Escuadrón E1 — Sector A" type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 ring-turqui text-sm" value={harvestData.originGroup} onChange={e => setHarvestData({ ...harvestData, originGroup: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Petición de Oración</label>
                    <textarea className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-1 ring-turqui text-xs resize-none" placeholder="Necesidad puntual manifestada..." value={harvestData.prayerRequests} onChange={e => setHarvestData({ ...harvestData, prayerRequests: e.target.value })} />
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-amber-700 font-medium leading-relaxed italic">Esta persona ingresará como 'Prospecto' y deberá ser asignada a un consolidador en el Panel Admin.</p>
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
    </div>
  );
};

// ─── Small helpers ────────────────────────────────────────────────────────────

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{title}</p>
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">{children}</div>
  </section>
);

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-300 shrink-0">{icon}</div>
      <div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xs font-bold text-slate-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const CheckRow: React.FC<{ label: string; value: boolean }> = ({ label, value }) => (
  <div className="flex items-center gap-3">
    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${value ? 'bg-turqui' : 'bg-slate-200'}`}>
      {value && <Check size={10} className="text-white" />}
    </div>
    <span className={`text-xs font-medium ${value ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
  </div>
);

export default Directory;
