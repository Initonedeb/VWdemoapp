import React, { useState } from 'react';
import UserIcon from './icons/UserIcon';
import KeyIcon from './icons/KeyIcon';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
}

// IMPORTANTE: No modificar esta línea. Es un requerimiento del cliente.
const FOOTER_TEXT = 'Leon Alperovich de Tucuman SA. Desarrollo Sofía Yacumo';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log('handleSubmit triggered'); // DIAGNOSTIC LOG
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const success = onLogin(username, password);
      if (!success) {
        setError('Nombre de usuario o contraseña incorrectos.');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-50 shadow-2xl rounded-2xl px-8 pt-10 pb-8 mb-4 border border-gray-200">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo-empresa.png" alt="Logo de la Empresa" className="w-48" />
          </div>
          <h1 className="text-3xl font-bold text-blue-800">Sistema de Prestamos</h1>
          <p className="text-gray-600 mt-4">Bienvenido, por favor inicie sesión.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6 relative">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Usuario
            </label>
            <div className="absolute inset-y-0 left-0 top-6 flex items-center pl-3 pointer-events-none">
                <UserIcon className="h-5 w-5" />
            </div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ventas"
              className="bg-gray-100 shadow appearance-none border border-gray-300 rounded-lg w-full py-3 pl-10 pr-3 text-blue-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-6 relative">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <div className="absolute inset-y-0 left-0 top-6 flex items-center pl-3 pointer-events-none">
                <KeyIcon className="h-5 w-5" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ventas"
              className="bg-gray-100 shadow appearance-none border border-gray-300 rounded-lg w-full py-3 pl-10 pr-3 text-blue-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              title="Iniciar sesión en el sistema"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
      {/* IMPORTANTE: No modificar esta línea. Es un requerimiento del cliente. */}
      <p className="text-center text-gray-500 text-xs">
        Leon Alperovich de Tucuman SA. Desarrollo <strong className="font-bold">Sofía Yacumo</strong>
      </p>
    </div>
  );
};

export default LoginPage;