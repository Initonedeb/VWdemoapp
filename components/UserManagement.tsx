import React, { useState, useMemo, useRef, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

import { User, UserRole } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import SearchIcon from './icons/SearchIcon';
import Swal from 'sweetalert2';

const emptyUser: Omit<User, 'id'> = {
    username: '',
    password_dont_display: '',
    role: UserRole.VENTAS,
};

interface UserManagementProps {
  onBack: () => void;
  userRole: UserRole;
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack, userRole }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Omit<User, 'id'>>(emptyUser);
    const [searchTerm, setSearchTerm] = useState('');
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/users`);
                if (!response.ok) {
                    throw new Error('Error al cargar los usuarios');
                }
                const data: User[] = await response.json();
                setUsers(data);
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Conexión',
                    text: 'No se pudo conectar con el servidor para obtener los usuarios.',
                    confirmButtonText: 'Entendido'
                });
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNewClick = () => {
        setEditingUser(null);
        setFormData(emptyUser);
        setShowForm(!showForm);
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setFormData({ username: user.username, role: user.role, password_dont_display: '' });
        setShowForm(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('¿Está seguro de que desea eliminar este usuario? Esta acción es irreversible.')) {
            try {
                const response = await fetch(`${API_URL}/users/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar el usuario');
                }

                setUsers(users.filter(user => user.id !== id));

                Swal.fire({
                    icon: 'success',
                    title: 'Usuario Eliminado',
                    text: 'El usuario ha sido eliminado correctamente.',
                    confirmButtonText: 'Entendido'
                });

            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al Eliminar',
                    text: `Error: ${error.message}`,
                    confirmButtonText: 'Entendido'
                });
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingUser(null);
        setFormData(emptyUser);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        try {
            let updatedUser: User;

            if (editingUser) {
                // Lógica de edición
                const body: any = {
                    username: formData.username,
                    password_dont_display: formData.password_dont_display,
                    role: formData.role,
                };

                if (editingUser.username === 'sofiaadmin' && formData.password_dont_display) {
                    const { value: current_password } = await Swal.fire({
                        title: 'Confirmar cambio de contraseña',
                        input: 'password',
                        inputLabel: 'Para cambiar la contraseña de sofiaadmin, por favor ingrese la contraseña actual',
                        inputPlaceholder: 'Ingrese su contraseña actual',
                        inputAttributes: {
                          autocapitalize: 'off',
                          autocorrect: 'off'
                        },
                        showCancelButton: true,
                        confirmButtonText: 'Confirmar',
                        cancelButtonText: 'Cancelar',
                        showLoaderOnConfirm: true,
                        preConfirm: (password) => {
                            if (!password) {
                                Swal.showValidationMessage(`Por favor ingrese la contraseña actual`);
                            }
                            return password;
                        },
                        allowOutsideClick: () => !Swal.isLoading()
                      });

                    if (current_password) {
                        body.current_password = current_password;
                    } else {
                        return; // El usuario canceló
                    }
                }

                const response = await fetch(`${API_URL}/users/${editingUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al actualizar el usuario');
                }

                updatedUser = await response.json();
                setUsers(users.map(user => user.id === updatedUser.id ? { ...user, ...updatedUser } : user));

                Swal.fire({
                    icon: 'success',
                    title: 'Usuario Actualizado',
                    text: 'El usuario ha sido actualizado correctamente.',
                    confirmButtonText: 'Entendido'
                });

            } else {
                // Lógica de Creación
                if (!formData.password_dont_display) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Contraseña Requerida',
                        text: 'La contraseña es obligatoria para nuevos usuarios.',
                        confirmButtonText: 'Entendido'
                    });
                    return;
                }

                const response = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: formData.username,
                        password_dont_display: formData.password_dont_display,
                        role: formData.role,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al crear el usuario');
                }

                updatedUser = await response.json();
                setUsers(prevUsers => [updatedUser, ...prevUsers].sort((a, b) => a.username.localeCompare(b.username)));


                Swal.fire({
                    icon: 'success',
                    title: 'Usuario Creado',
                    text: 'El nuevo usuario ha sido creado correctamente.',
                    confirmButtonText: 'Entendido'
                });
            }
            handleCancel();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error: ${error.message}`,
                confirmButtonText: 'Entendido'
            });
        }
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN: return 'bg-red-100 text-red-800 border-red-200';
            case UserRole.VENTAS: return 'bg-sky-100 text-sky-800 border-sky-200';
            case UserRole.POSVENTA: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="flex items-center mb-8">
                <button
                  onClick={onBack}
                  title="Regresar al panel de administrador"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-500 font-bold py-2 pr-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105"
                >
                  <ArrowLeftIcon className="h-5 w-5"/>
                  Volver al Panel
                </button>
            </header>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-900">Gestión de Usuarios</h2>
                        <p className="text-gray-600 mt-1">Crear, modificar y eliminar cuentas de usuario.</p>
                    </div>
                    <button
                        onClick={handleAddNewClick}
                        title={showForm && !editingUser ? 'Ocultar el formulario de usuario' : 'Mostrar el formulario para crear un nuevo usuario'}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105 mt-4 sm:mt-0"
                    >
                        <PlusIcon className="h-5 w-5"/>
                        {showForm && !editingUser ? 'Ocultar Formulario' : 'Crear Usuario Nuevo'}
                    </button>
                </div>
                
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre de usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 pl-10 pr-4"
                    />
                </div>

                {showForm && (
                     <div ref={formRef} className="bg-white border border-gray-200 rounded-xl p-6 mb-8 transition-all duration-500 ease-in-out">
                        <h3 className="text-xl font-semibold text-blue-900 mb-4">{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                                <input type="text" name="username" id="username" value={formData.username} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="password_dont_display" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                <input type="password" name="password_dont_display" id="password_dont_display" value={formData.password_dont_display} onChange={handleInputChange} required={!editingUser} placeholder={editingUser ? 'Dejar en blanco para no cambiar' : '********'} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select name="role" id="role" value={formData.role} onChange={handleInputChange} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3">
                                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </div>

                            <div className="col-span-full flex justify-center gap-4 mt-4">
                               <button type="button" onClick={handleCancel} title="Cancelar la operación y cerrar el formulario" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                               <button type="submit" title={editingUser ? 'Guardar los cambios del usuario' : 'Crear el nuevo usuario'} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{editingUser ? 'Guardar Cambios' : 'Guardar Usuario'}</button>
                            </div>
                        </form>
                    </div>
                )}
                
                <div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">Listado de Usuarios</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-900 sm:pl-6">Usuario</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Rol</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="font-medium text-blue-900">{user.username}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <div className="flex items-center justify-end gap-x-1">
                                                <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:text-blue-500 p-2 rounded-md transition-colors" title="Editar"><EditIcon className="h-5 w-5"/></button>
                                                {userRole === UserRole.ADMIN && (
                                                    <button onClick={() => handleDeleteClick(user.id)} className="text-red-500 hover:text-red-400 p-2 rounded-md transition-colors disabled:text-gray-400 disabled:cursor-not-allowed" title="Eliminar" disabled={user.id === 1}><TrashIcon className="h-5 w-5"/></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>{searchTerm ? 'No se encontraron usuarios con ese criterio de búsqueda.' : 'No hay usuarios registrados.'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
