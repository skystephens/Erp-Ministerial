
import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { Check, ArrowRight, User as UserIcon, Award, Heart, Shield } from 'lucide-react';
import { MINISTRIES, SERVICE_CATEGORIES } from '../constants';

interface OnboardingProps {
  onComplete: (userData: Partial<User>) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: [] as string[],
    motivation: '',
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden animate-fadeIn">
        <div className="bg-turqui p-10 text-white relative">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-montserrat font-bold">Bienvenido a TAFE ERP</h2>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Paso {step} de 3</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-white' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>

        <div className="p-10">
          {step === 1 && (
            <div className="space-y-6 animate-slideLeft">
              <div className="flex items-center gap-3 text-turqui mb-2">
                <UserIcon size={24} />
                <h3 className="text-xl font-montserrat font-bold text-slate-800">Identidad Ministerial</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej. Juan Pérez"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-turqui/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="tu@email.com"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-turqui/20"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-slideLeft">
              <div className="flex items-center gap-3 text-turqui mb-2">
                <Award size={24} />
                <h3 className="text-xl font-montserrat font-bold text-slate-800">Dones y Talentos</h3>
              </div>
              <p className="text-sm text-slate-500">Selecciona las áreas donde puedes aportar al Banco de Tiempo.</p>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_CATEGORIES.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => toggleSkill(cat.label)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      formData.skills.includes(cat.label) 
                        ? 'border-turqui bg-turqui/5 text-turqui' 
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-xl mb-2 block">{cat.icon}</span>
                    <span className="text-xs font-bold">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-slideLeft">
              <div className="flex items-center gap-3 text-turqui mb-2">
                <Heart size={24} />
                <h3 className="text-xl font-montserrat font-bold text-slate-800">Compromiso Espiritual</h3>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">¿Qué te motiva a servir en este ministerio?</label>
                <textarea 
                  value={formData.motivation}
                  onChange={e => setFormData({...formData, motivation: e.target.value})}
                  placeholder="Cuéntanos un poco sobre tu llamado..."
                  className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-turqui/20 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <Shield size={20} className="text-amber-500" />
                <p className="text-[11px] text-amber-700 font-medium">Tu perfil será revisado por el Super Admin para asignarte un ministerio oficial.</p>
              </div>
            </div>
          )}

          <div className="mt-10 flex gap-4">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all"
              >
                Atrás
              </button>
            )}
            <button 
              onClick={step === 3 ? () => onComplete(formData) : nextStep}
              className="flex-[2] py-4 bg-turqui text-white font-bold rounded-2xl shadow-lg shadow-turqui/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              {step === 3 ? 'Finalizar Registro' : 'Siguiente Paso'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
