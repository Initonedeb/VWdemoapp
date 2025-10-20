import React, { useState } from 'react';
import CarIcon from './icons/CarIcon';
import UsersIcon from './icons/UsersIcon';
import LogoutIcon from './icons/LogoutIcon';
import UsedCarManagement from './UsedCarManagement';
import CalendarCheckIcon from './icons/CalendarCheckIcon';
import ClientManagement from './ClientManagement';
import PrestacionesManagement from './PrestacionesManagement';
import UserManagement from './UserManagement';
import UserCogIcon from './icons/UserCogIcon';
import { UserRole } from '../types';


interface AdminDashboardProps {
  onLogout: () => void;
  userRole: UserRole;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, userRole }) => {
  const [view, setView] = useState<'dashboard' | 'cars' | 'clients' | 'prestamos' | 'users'>('dashboard');

  if (view === 'cars') {
    return <UsedCarManagement onBack={() => setView('dashboard')} userRole={userRole} />;
  }
  
  if (view === 'clients') {
    return <ClientManagement onBack={() => setView('dashboard')} userRole={userRole} />;
  }

  if (view === 'prestamos') {
    return <PrestacionesManagement onBack={() => setView('dashboard')} userRole={userRole} />;
  }

  if (view === 'users') {
    return <UserManagement onBack={() => setView('dashboard')} userRole={userRole} />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Panel de Administrador</h1>
          <p className="text-gray-600">Seleccione una sección para continuar.</p>
        </div>
        <button
          onClick={onLogout}
          title="Cerrar la sesión actual"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105"
        >
          <LogoutIcon className="h-5 w-5"/>
          Salir
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div 
          onClick={() => setView('cars')}
          title="Acceder al módulo para gestionar vehículos"
          className="lg:col-span-2 group bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 bg-gray-200 p-4 rounded-full group-hover:bg-blue-600 transition-colors duration-300">
                <CarIcon className="h-16 w-16 text-blue-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h2 className="text-2xl font-semibold text-blue-900 mb-2">Gestion de Demos</h2>
            <p className="text-gray-600">Gestionar el inventario de vehículos de demostración y usados.</p>
          </div>
        </div>

        <div 
          onClick={() => setView('prestamos')}
          title="Acceder al módulo para gestionar préstamos"
          className="lg:col-span-2 group bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 bg-gray-200 p-4 rounded-full group-hover:bg-blue-600 transition-colors duration-300">
                <CalendarCheckIcon className="h-16 w-16 text-blue-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h2 className="text-2xl font-semibold text-blue-900 mb-2">Préstamos</h2>
            <p className="text-gray-600">Gestionar préstamos de vehículos a clientes.</p>
          </div>
        </div>

        <div 
          onClick={() => setView('clients')}
          title="Acceder al módulo para gestionar clientes"
          className="lg:col-span-2 group bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center">
             <div className="mb-6 bg-gray-200 p-4 rounded-full group-hover:bg-blue-600 transition-colors duration-300">
                <UsersIcon className="h-16 w-16 text-blue-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h2 className="text-2xl font-semibold text-blue-900 mb-2">Clientes</h2>
            <p className="text-gray-600">Administrar la base de datos de clientes y su historial.</p>
          </div>
        </div>
         <div 
          onClick={() => setView('users')}
          title="Acceder al módulo para gestionar usuarios"
          className="lg:col-span-2 group bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 bg-gray-200 p-4 rounded-full group-hover:bg-blue-600 transition-colors duration-300">
                <UserCogIcon className="h-16 w-16 text-blue-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h2 className="text-2xl font-semibold text-blue-900 mb-2">Usuarios</h2>
            <p className="text-gray-600">Gestionar cuentas y roles de los usuarios del sistema.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;