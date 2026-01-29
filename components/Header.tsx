import React, { useState } from 'react';
import { Bell, Search, ChevronDown, Menu } from 'lucide-react';
import { Institution, InstitutionId, UserProfile } from '../types';
import { INSTITUTIONS, MOCK_NOTIFICATIONS } from '../constants';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  currentInstitution: Institution;
  onSwitchInstitution: (id: InstitutionId) => void;
  toggleMobileSidebar: () => void;
  user: UserProfile; // Added user prop
}

const Header: React.FC<HeaderProps> = ({ currentInstitution, onSwitchInstitution, toggleMobileSidebar, user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  // Filter institutions based on user access
  const availableInstitutions = INSTITUTIONS.filter(inst => 
    user.allowedInstitutions.includes(inst.id)
  );

  const theme = currentInstitution.theme;

  return (
    <header className={`bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm relative border-t-4 border-${theme}-600 transition-colors duration-500`}>
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-600" onClick={toggleMobileSidebar}>
            <Menu className="w-6 h-6" />
        </button>
        
        {/* Context Switcher (RF002.4) */}
        <div className="relative group">
            <button className={`flex items-center gap-2 text-gray-700 hover:text-${theme}-600 transition-colors`}>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Visualizando:</span>
                <span className="font-bold flex items-center gap-1">
                    {currentInstitution.name} 
                    <ChevronDown className="w-4 h-4" />
                </span>
            </button>
            
            {/* Dropdown - Filtered by User Access */}
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-1">
                    {availableInstitutions.map((inst) => (
                        <button
                            key={inst.id}
                            onClick={() => onSwitchInstitution(inst.id)}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 ${
                                currentInstitution.id === inst.id ? `bg-${inst.theme}-50 text-${inst.theme}-700 font-medium` : 'text-gray-700'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${inst.color}`}></div>
                            {inst.name}
                        </button>
                    ))}
                    
                    {availableInstitutions.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-400 italic">
                            Sem acesso a outras instituições.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
                type="text" 
                placeholder="Buscar indicador..." 
                className={`pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-${theme}-500 w-64`}
            />
        </div>
        
        {/* Notification Bell */}
        <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition-colors ${
                    showNotifications ? `bg-${theme}-50 text-${theme}-600` : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {/* Notification Center Popover */}
            <NotificationCenter 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
            />
        </div>
      </div>
    </header>
  );
};

export default Header;