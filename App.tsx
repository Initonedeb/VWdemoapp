import React, { useState, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import { UserRole } from './types';
import EmployeeDashboard from './components/EmployeeDashboard';
import Swal from 'sweetalert2';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const handleLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status, response.ok); // DIAGNOSTIC LOG

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData.message);
        Swal.fire({
          icon: 'error',
          title: 'Error de Autenticación',
          text: 'Credenciales incorrectas.',
          confirmButtonText: 'Entendido'
        });
        return false;
      }

      const userData = await response.json();
      setUserRole(userData.role);
      return true;

    } catch (error) {
      console.error('Network error during login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo conectar con el servidor de autenticación.',
        confirmButtonText: 'Entendido'
      });
      return false;
    }
  }, []);

  const handleLogout = useCallback(() => {
    setUserRole(null);
  }, []);

  const renderContent = () => {
    switch (userRole) {
      case UserRole.ADMIN:
        return <AdminDashboard onLogout={handleLogout} userRole={userRole} />;
      case UserRole.VENTAS:
      case UserRole.POSVENTA:
        return <EmployeeDashboard onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-blue-900 flex items-center justify-center font-sans">
      {renderContent()}
    </div>
  );
};

export default App;