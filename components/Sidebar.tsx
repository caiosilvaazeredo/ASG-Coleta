import React from 'react';
import { LayoutDashboard, FileText, PieChart, Users, Settings, Building2, BookOpen, Network, LogOut, Layers, Target, Sparkles, Globe, BarChart2 } from 'lucide-react';
import { Institution, UserProfile } from '../types';

interface SidebarProps {
  currentView: 'DASHBOARD' | 'COLLECTION' | 'ETHOS' | 'RESPONDENTS' | 'REPORTS' | 'ORGANIZATION' | 'FRAMEWORK' | 'PROJECTS';
  onChangeView: (view: 'DASHBOARD' | 'COLLECTION' | 'ETHOS' | 'RESPONDENTS' | 'REPORTS' | 'ORGANIZATION' | 'FRAMEWORK' | 'PROJECTS') => void;
  currentInstitution: Institution;
  user: UserProfile; // Added User Prop
  onLogout: () => void; // Added Logout Handler
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, currentInstitution, user, onLogout }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'COLLECTION', label: 'GRI Standards', icon: Globe },
    { id: 'ETHOS', label: 'Indicadores Ethos', icon: Sparkles },
    { id: 'PROJECTS', label: 'Projetos de Impacto', icon: Target },
    { id: 'RESPONDENTS', label: 'Gestão de Respondentes', icon: Users },
    { id: 'REPORTS', label: 'Resultados & Exportação', icon: BarChart2 }, // Updated Item
  ];

  const theme = currentInstitution.theme;

  // Map theme to specific Tailwind classes to ensure they are picked up by CDN scanner
  const themeClassMap: Record<string, string> = {
      orange: 'bg-orange-50 text-orange-700 border-orange-100',
      blue: 'bg-blue-50 text-blue-700 border-blue-100',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      green: 'bg-green-50 text-green-700 border-green-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-100',
      slate: 'bg-slate-50 text-slate-700 border-slate-100',
  };

  const getIconClass = (isActive: boolean) => {
      if (!isActive) return 'text-gray-400';
      
      switch (theme) {
          case 'orange': return 'text-orange-700';
          case 'green': return 'text-green-700';
          case 'indigo': return 'text-indigo-700';
          case 'purple': return 'text-purple-700';
          case 'slate': return 'text-slate-700';
          default: return 'text-blue-700';
      }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center justify-center border-b border-gray-100">
        <div className={`w-10 h-10 rounded-lg ${currentInstitution.color} flex items-center justify-center text-white font-bold text-xl mr-3 shadow-lg transition-colors duration-500`}>
          {currentInstitution.logoInitial}
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Sistema ASG</h1>
          <p className="text-xs text-gray-500">Fecomércio RJ</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Principal</p>
        {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            const activeClass = isActive 
                ? `${themeClassMap[theme] || 'bg-blue-50 text-blue-700 border-blue-100'} shadow-sm border` 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
            
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id as any)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${activeClass}`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-colors ${getIconClass(isActive)}`} />
                {item.label}
              </button>
            );
        })}

        <div className="pt-8">
           <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Administração</p>
           
           <button 
              onClick={() => onChangeView('FRAMEWORK')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                  currentView === 'FRAMEWORK'
                    ? (themeClassMap[theme] || 'bg-blue-50 text-blue-700 border-blue-100') + ' shadow-sm border'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
           >
              <Layers className={`w-5 h-5 mr-3 transition-colors ${getIconClass(currentView === 'FRAMEWORK')}`} />
              Config. Framework
           </button>

           <button 
              onClick={() => onChangeView('ORGANIZATION')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                  currentView === 'ORGANIZATION'
                    ? (themeClassMap[theme] || 'bg-blue-50 text-blue-700 border-blue-100') + ' shadow-sm border'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
           >
              <Network className={`w-5 h-5 mr-3 transition-colors ${getIconClass(currentView === 'ORGANIZATION')}`} />
              Estrutura Org.
           </button>

           <button className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <Settings className="w-5 h-5 mr-3 text-gray-400" />
              Configurações
           </button>
        </div>
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between group">
            <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs transition-colors duration-500 ${currentInstitution.color}`}>
                    {user.avatarInitials}
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 truncate w-32">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate w-32">{user.role.replace('_', ' ').toLowerCase()}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Sair"
            >
                <LogOut className="w-4 h-4" />
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;