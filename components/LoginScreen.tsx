import React, { useState } from 'react';
import { UserProfile } from '../types';
import { MOCK_USERS } from '../constants';
import { Lock, User, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [step, setStep] = useState<'SELECT_USER' | '2FA'>('SELECT_USER');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUserSelect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const user = MOCK_USERS.find(u => u.id === selectedUserId);
    if (user) {
      // Simulate 2FA requirement for President and Auditor roles (sensitive access)
      if (['PRESIDENT', 'INTERNAL_AUDITOR'].includes(user.role)) {
        setStep('2FA');
      } else {
        performLogin(user);
      }
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find(u => u.id === selectedUserId);
    if (user) {
        performLogin(user);
    }
  };

  const performLogin = (user: UserProfile) => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
        onLogin(user);
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* Header Graphic */}
        <div className="bg-slate-800 p-8 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 to-slate-900 opacity-90"></div>
           <div className="relative z-10">
                <div className="mx-auto w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4 border border-white/20">
                    <Building2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Sistema Fecomércio RJ</h1>
                <p className="text-blue-200 text-sm">Plataforma Integrada ASG/GRI</p>
           </div>
        </div>

        <div className="p-8">
            {step === 'SELECT_USER' ? (
                <form onSubmit={handleUserSelect} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Selecione seu perfil (Simulação SSO)</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select 
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                required
                            >
                                <option value="">Selecione um usuário...</option>
                                {MOCK_USERS.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} - {user.role.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={!selectedUserId || isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Autenticando...' : 'Entrar com Credenciais AD'}
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                    
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Ambiente seguro com criptografia ponta-a-ponta.</p>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                     <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Verificação em Duas Etapas</h3>
                        <p className="text-sm text-gray-500">Digite o código enviado ao seu dispositivo móvel.</p>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Código de Segurança</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-widest text-center font-mono text-lg"
                                placeholder="000 000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={!otp || isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Verificando...' : 'Confirmar Acesso'}
                        {!isLoading && <ShieldCheck className="w-4 h-4" />}
                    </button>

                    <button 
                        type="button"
                        onClick={() => setStep('SELECT_USER')}
                        className="w-full text-sm text-gray-500 hover:text-gray-800"
                    >
                        Voltar
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;