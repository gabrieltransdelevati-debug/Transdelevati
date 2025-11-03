import React, { useState } from 'react';
import type { ChecklistSubmission, ChecklistType } from './types';
import ChecklistForm from './components/ChecklistForm';
import AdminDashboard from './components/AdminDashboard';
import { TruckIcon, ClipboardListIcon, ArrowRightIcon, ArrowLeftIcon } from './components/Icons';

type Screen = 'landing' | 'form' | 'admin';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [submissions, setSubmissions] = useState<ChecklistSubmission[]>([]);
  const [selectedType, setSelectedType] = useState<ChecklistType | null>(null);

  const handleSelectType = (type: ChecklistType) => {
    setSelectedType(type);
    setCurrentScreen('form');
  };
  
  const handleGoToLanding = () => {
    setSelectedType(null);
    setCurrentScreen('landing');
  }

  const addSubmission = (submissionData: Omit<ChecklistSubmission, 'id' | 'submissionTimestamp' | 'checklistType'>) => {
    if (!selectedType) return; // Should not happen

    const newSubmission: ChecklistSubmission = {
      ...submissionData,
      id: Date.now().toString(),
      submissionTimestamp: new Date().toISOString(),
      checklistType: selectedType,
    };

    setSubmissions(prevSubmissions => [newSubmission, ...prevSubmissions]);
    setCurrentScreen('admin'); // Switch to admin view after submission
  };
  
  const Header = () => (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <TruckIcon className="h-8 w-8 text-brand-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Transdelevati <span className="font-light text-slate-500 dark:text-slate-400">| Controle de Frota</span>
            </h1>
          </div>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <NavButton
              label="Checklist"
              icon={<ClipboardListIcon className="h-5 w-5 mr-2" />}
              isActive={currentScreen === 'form' || currentScreen === 'landing'}
              onClick={handleGoToLanding}
            />
            <NavButton
              label="Dashboard"
              icon={
                <div className="relative">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  {submissions.length > 0 && (
                     <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                       {submissions.length}
                     </span>
                  )}
                </div>
              }
              isActive={currentScreen === 'admin'}
              onClick={() => setCurrentScreen('admin')}
            />
          </nav>
        </div>
      </div>
    </header>
  );

  const LandingPage = () => (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto pt-16">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Registrar Novo Checklist</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-10">Selecione se o veículo está saindo para uma entrega ou retornando para a base.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <button 
                onClick={() => handleSelectType('saida')}
                className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-brand-blue-500"
            >
                <ArrowRightIcon className="h-12 w-12 text-brand-blue-500 bg-brand-blue-100 dark:bg-brand-blue-900/50 rounded-full p-2 mb-4 transition-transform duration-300 group-hover:rotate-6"/>
                <span className="text-2xl font-semibold text-slate-800 dark:text-white">Saída de Veículo</span>
                <span className="text-slate-500 dark:text-slate-400 mt-1">Registrar checklist de partida.</span>
            </button>
            <button 
                onClick={() => handleSelectType('chegada')}
                className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-green-500"
            >
                <ArrowLeftIcon className="h-12 w-12 text-green-500 bg-green-100 dark:bg-green-900/50 rounded-full p-2 mb-4 transition-transform duration-300 group-hover:-rotate-6"/>
                <span className="text-2xl font-semibold text-slate-800 dark:text-white">Chegada de Veículo</span>
                <span className="text-slate-500 dark:text-slate-400 mt-1">Registrar checklist de retorno.</span>
            </button>
        </div>
    </div>
  );

  const renderContent = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage />;
      case 'form':
        if (selectedType) {
          return <ChecklistForm onSubmit={addSubmission} checklistType={selectedType} />;
        }
        // Fallback to landing if type is not selected
        setCurrentScreen('landing');
        return <LandingPage />;
      case 'admin':
        return <AdminDashboard submissions={submissions} />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-brand-blue-100 text-brand-blue-700 dark:bg-brand-blue-900 dark:text-brand-blue-200'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);


export default App;
