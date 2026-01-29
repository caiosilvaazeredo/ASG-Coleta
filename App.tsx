import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DataCollection from './components/DataCollection';
import RespondentManagement from './components/RespondentManagement';
import OrganizationChart from './components/OrganizationChart';
import LoginScreen from './components/LoginScreen';
import ResultsCenter from './components/ResultsCenter'; // Changed from ReportGenerator
import FrameworkManagement from './components/FrameworkManagement';
import ProjectManagement from './components/ProjectManagement';
import { INSTITUTIONS, MOCK_KPIS } from './constants';
import { InstitutionId, UserProfile } from './types';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // App State
  const [currentInstitutionId, setCurrentInstitutionId] = useState<InstitutionId>('SENAC');
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'COLLECTION' | 'ETHOS' | 'RESPONDENTS' | 'REPORTS' | 'ORGANIZATION' | 'FRAMEWORK' | 'PROJECTS'>('DASHBOARD');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Inactivity Timer (RF002.3)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    console.log('User logged out due to inactivity or manual action');
  }, []);

  const resetTimer = useCallback(() => {
    if (currentUser) {
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        logoutTimerRef.current = setTimeout(handleLogout, SESSION_TIMEOUT);
    }
  }, [currentUser, handleLogout]);

  useEffect(() => {
    // Add event listeners for user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keypress', resetTimer);
        window.removeEventListener('click', resetTimer);
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
        }
    };
  }, [resetTimer]);


  // Handle Login
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    // Set default institution to the first one the user has access to, or maintain SENAC if allowed
    if (user.allowedInstitutions.length > 0) {
        if (user.allowedInstitutions.includes('SENAC')) {
             setCurrentInstitutionId('SENAC');
        } else {
             setCurrentInstitutionId(user.allowedInstitutions[0]);
        }
    }
  };


  // --- RENDER LOGIC ---

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const currentInstitution = INSTITUTIONS.find(i => i.id === currentInstitutionId) || INSTITUTIONS[0];
  const currentKPIs = MOCK_KPIS[currentInstitutionId];

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard institution={currentInstitution} kpis={currentKPIs} />;
      case 'COLLECTION':
        return <DataCollection user={currentUser} forcedFramework="GRI" />;
      case 'ETHOS':
        return <DataCollection user={currentUser} forcedFramework="ETHOS" />;
      case 'RESPONDENTS':
        return <RespondentManagement />;
      case 'ORGANIZATION':
        return <OrganizationChart />;
      case 'REPORTS':
        return <ResultsCenter institution={currentInstitution} />; // Updated to ResultsCenter
      case 'FRAMEWORK':
        return <FrameworkManagement />;
      case 'PROJECTS':
        return <ProjectManagement user={currentUser} />;
      default:
        return <Dashboard institution={currentInstitution} kpis={currentKPIs} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}
      
      {/* Sidebar */}
      <div className={`fixed md:relative z-30 transition-transform duration-300 transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
         <Sidebar 
            currentView={currentView} 
            onChangeView={(view) => { setCurrentView(view); setMobileSidebarOpen(false); }}
            currentInstitution={currentInstitution}
            user={currentUser}
            onLogout={handleLogout}
         />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
            currentInstitution={currentInstitution} 
            onSwitchInstitution={setCurrentInstitutionId}
            toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            user={currentUser}
        />
        
        <main className="p-6 overflow-x-hidden h-[calc(100vh-64px)]">
           {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;