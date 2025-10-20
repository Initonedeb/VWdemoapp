import React, { useState, useMemo, useRef, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

import { Client, CivilStatus, UserRole } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import InfoIcon from './icons/InfoIcon';
import EditIcon from './icons/EditIcon';
import SearchIcon from './icons/SearchIcon';
import PrintIcon from './icons/PrintIcon';
import DownloadIcon from './icons/DownloadIcon';
import XIcon from './icons/XIcon';
import ImageIcon from './icons/ImageIcon';
import Swal from 'sweetalert2';

const emptyClient: Omit<Client, 'id'> = {
    nombreCompleto: '',
    fechaNacimiento: '',
    dni: '',
    carnetManejo: '',
    direccion: '',
    celular: '',
    email: '',
    cuil: '',
    estadoCivil: CivilStatus.SOLTERO,
    fotoCarnetFrente: '',
    fotoCarnetDorso: '',
};

interface HistoryEvent {
  id: number;
  date: string;
  action: 'Creado' | 'Modificado' | 'Eliminado';
  clientSnapshot: Client;
}

const initialHistory: HistoryEvent[] = [];

interface ClientManagementProps {
  onBack: () => void;
  userRole: UserRole;
}

const ClientDetailsNaturalLanguage: React.FC<{ client: Client }> = ({ client }) => {
    return (
        <div className="space-y-4 text-gray-700 text-base leading-relaxed">
            <p>
                Este registro pertenece a <strong className="text-blue-600">{client.nombreCompleto}</strong>, 
                identificado con DNI <strong className="text-blue-900">{client.dni}</strong> y CUIL <strong className="text-blue-900">{client.cuil}</strong>.
            </p>
            <p>
                Nacido/a el <strong className="text-blue-900">{client.fechaNacimiento ? new Date(client.fechaNacimiento + 'T00:00:00').toLocaleDateString() : 'N/A'}</strong>, su estado civil es <strong className="text-blue-900">{client.estadoCivil}</strong>. 
                Posee el carnet de manejo número <strong className="text-blue-900">{client.carnetManejo}</strong>.
            </p>
            <p>
                Sus datos de contacto registrados son el número de celular <strong className="text-blue-900">{client.celular}</strong> 
                y el correo electrónico <strong className="text-blue-900">{client.email}</strong>. 
                Su dirección de residencia es <strong className="text-blue-900">{client.direccion}</strong>.
            </p>
            {(client.fotoCarnetFrente || client.fotoCarnetDorso) && (
                <div className="mt-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3 border-b border-gray-200 pb-2">Fotos del Carnet de Manejo</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                        {client.fotoCarnetFrente && (
                            <div className="rounded-lg overflow-hidden border-2 border-gray-300">
                                 <img src={`http://localhost:3001/${client.fotoCarnetFrente}`} alt="Frente del carnet" className="w-full h-auto object-contain" />
                            </div>
                        )}
                        {client.fotoCarnetDorso && (
                            <div className="rounded-lg overflow-hidden border-2 border-gray-300">
                                 <img src={`http://localhost:3001/${client.fotoCarnetDorso}`} alt="Dorso del carnet" className="w-full h-auto object-contain" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ClientManagement: React.FC<ClientManagementProps> = ({ onBack, userRole }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState<Omit<Client, 'id'> & { fotoCarnetFrenteFile?: File, fotoCarnetDorsoFile?: File }>(emptyClient);
    const [searchTerm, setSearchTerm] = useState('');
    const [history, setHistory] = useState<HistoryEvent[]>(initialHistory);
    const [modalData, setModalData] = useState<HistoryEvent | null>(null);
    const [photoError, setPhotoError] = useState<string>('');
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch(`${API_URL}/clients`);
                if (!response.ok) {
                    throw new Error('Error al cargar los clientes');
                }
                const data: Client[] = await response.json();
                setClients(data);
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Conexión',
                    text: 'No se pudo conectar con el servidor para obtener los clientes.',
                    confirmButtonText: 'Entendido'
                });
            }
        };

        fetchClients();
    }, []);

     const addHistoryEvent = (action: HistoryEvent['action'], client: Client) => {
        const newEvent: HistoryEvent = {
            id: Date.now(),
            date: new Date().toISOString(),
            action,
            clientSnapshot: client
        };
        setHistory(prev => [newEvent, ...prev]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'fotoCarnetFrente' | 'fotoCarnetDorso') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setPhotoError('Por favor, seleccione solo archivos de imagen.');
                return;
            }
            setPhotoError('');
            // Guardar el objeto File directamente en el estado
            setFormData(prev => ({
                ...prev,
                [`${field}File`]: file, // Guardar el File object
                [field]: URL.createObjectURL(file) // Para previsualización
            }));
            console.log(`Preview URL for ${field}:`, URL.createObjectURL(file));
        } else {
            // Si se deselecciona la imagen, limpiar el estado
            setFormData(prev => ({
                ...prev,
                [`${field}File`]: undefined,
                [field]: ''
            }));
        }
    };

    const handleRemovePhoto = (field: 'fotoCarnetFrente' | 'fotoCarnetDorso') => {
        setFormData(prev => ({
            ...prev,
            [`${field}File`]: undefined,
            [field]: ''
        }));
    };

    const handleAddNewClick = () => {
        setEditingClient(null);
        setFormData(emptyClient);
        setShowForm(!showForm);
    };

    const handleEditClick = (client: Client) => {
        setEditingClient(client);
        // Al editar, las fotos vienen como rutas, no como File objects
        setFormData({ 
            ...client, 
            fotoCarnetFrenteFile: undefined, 
            fotoCarnetDorsoFile: undefined 
        });
        setShowForm(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('¿Está seguro de que desea eliminar este cliente? Esta acción es irreversible.')) {
            try {
                const response = await fetch(`${API_URL}/clients/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar el cliente');
                }

                setClients(clients.filter(client => client.id !== id));

                Swal.fire({
                    icon: 'success',
                    title: 'Cliente Eliminado',
                    text: 'El cliente ha sido eliminado correctamente.',
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
        setEditingClient(null);
        setFormData(emptyClient);
        setPhotoError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Crear FormData para enviar archivos
        const data = new FormData();
        data.append('nombreCompleto', formData.nombreCompleto);
        data.append('fechaNacimiento', formData.fechaNacimiento);
        data.append('dni', formData.dni);
        data.append('carnetManejo', formData.carnetManejo);
        data.append('direccion', formData.direccion);
        data.append('celular', formData.celular);
        data.append('email', formData.email);
        data.append('cuil', formData.cuil);
        data.append('estadoCivil', formData.estadoCivil);

        // Adjuntar archivos si existen
        if (formData.fotoCarnetFrenteFile) {
            data.append('fotoCarnetFrente', formData.fotoCarnetFrenteFile);
        } else if (formData.fotoCarnetFrente === '') { // Si la foto fue eliminada
            data.append('fotoCarnetFrente', 'null');
        }
        if (formData.fotoCarnetDorsoFile) {
            data.append('fotoCarnetDorso', formData.fotoCarnetDorsoFile);
        } else if (formData.fotoCarnetDorso === '') { // Si la foto fue eliminada
            data.append('fotoCarnetDorso', 'null');
        }

        try {
            let updatedClient: Client;

            if (editingClient) {
                // Lógica de Edición
                const response = await fetch(`${API_URL}/clients/${editingClient.id}`, {
                    method: 'PUT',
                    body: data, // FormData no necesita Content-Type
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al actualizar el cliente');
                }

                updatedClient = await response.json();
                setClients(clients.map(client => client.id === updatedClient.id ? updatedClient : client));

                Swal.fire({
                    icon: 'success',
                    title: 'Cliente Actualizado',
                    text: 'El cliente ha sido actualizado correctamente.',
                    confirmButtonText: 'Entendido'
                });

            } else {
                // Lógica de Creación
                if (!formData.fotoCarnetFrenteFile || !formData.fotoCarnetDorsoFile) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Fotos Requeridas',
                        text: 'Debe subir la foto del frente y del dorso del carnet.',
                        confirmButtonText: 'Entendido'
                    });
                    return;
                }

                const response = await fetch(`${API_URL}/clients`, {
                    method: 'POST',
                    body: data, // FormData no necesita Content-Type
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al crear el cliente');
                }

                updatedClient = await response.json();
                setClients(prevClients => [updatedClient, ...prevClients]);

                Swal.fire({
                    icon: 'success',
                    title: 'Cliente Creado',
                    text: 'El nuevo cliente ha sido creado correctamente.',
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
    
    const printContent = (client: Client) => `
        <h1 class="text-3xl font-bold text-gray-800">Ficha del Cliente</h1>
        <p class="text-gray-500">${new Date().toLocaleDateString()}</p>
        </header>
        <main>
            <div class="grid grid-cols-2 gap-x-12 gap-y-4 text-lg">
                <div class="col-span-2 flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Nombre Completo:</span> <span>${client.nombreCompleto}</span></div>
                <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">DNI:</span> <span>${client.dni}</span></div>
                <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">CUIL:</span> <span>${client.cuil}</span></div>
                <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Fecha de Nacimiento:</span> <span>${client.fechaNacimiento ? new Date(client.fechaNacimiento + 'T00:00:00').toLocaleDateString() : 'N/A'}</span></div>
                <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Carnet de Manejo:</span> <span>${client.carnetManejo}</span></div>
                <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Celular:</span> <span>${client.celular}</span></div>
                <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Email:</span> <span>${client.email}</span></div>
                <div class="col-span-2 flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Dirección:</span> <span>${client.direccion}</span></div>
                <div class="col-span-2 flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Estado Civil:</span> <span>${client.estadoCivil}</span></div>
            </div>
             ${(client.fotoCarnetFrente || client.fotoCarnetDorso) ? `
            <div class="mt-10">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Fotos del Carnet</h2>
                <div class="grid grid-cols-2 gap-6" style="page-break-inside: avoid;">
                    ${client.fotoCarnetFrente ? `<div class="photo border rounded-lg overflow-hidden shadow-md"><img src="http://localhost:3001/${client.fotoCarnetFrente}" alt="Frente del Carnet" class="w-full h-full object-contain"></div>` : ''}
                    ${client.fotoCarnetDorso ? `<div class="photo border rounded-lg overflow-hidden shadow-md"><img src="http://localhost:3001/${client.fotoCarnetDorso}" alt="Dorso del Carnet" class="w-full h-full object-contain"></div>` : ''}
                </div>
            </div>` : ''}
        </main>`;

    const handlePrintHistory = (event: HistoryEvent) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Historial Cliente - ${event.clientSnapshot.nombreCompleto}</title><script src="https://cdn.tailwindcss.com"></script></head>
                    <body class="bg-white text-gray-900 p-8 font-sans">
                        <div class="mb-4 text-center">
                            <p class="text-xl"><strong>Acción:</strong> ${event.action}</p>
                            <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleString()}</p>
                        </div>
                        ${printContent(event.clientSnapshot)}
                        <footer class="mt-12 text-center text-gray-500 text-sm"><p>Documento generado por el Sistema de Prestaciones.</p></footer>
                        <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
                    </body>
                </html>`);
            printWindow.document.close();
        }
    };

    const handleDownloadHistory = (event: HistoryEvent) => {
        const jsonString = JSON.stringify(event, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial_cliente_${event.clientSnapshot.dni}_${event.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handleDeleteHistory = (id: number) => {
        if (window.confirm('¿Está seguro de que desea eliminar este registro del historial?')) {
            setHistory(history.filter(h => h.id !== id));
        }
    };

    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        return clients.filter(client =>
            client.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.dni.replace(/\./g, '').includes(searchTerm.replace(/\./g, ''))
        );
    }, [clients, searchTerm]);

    const filteredHistory = useMemo(() => {
        if (!searchTerm) return history;
        const lowercasedFilter = searchTerm.toLowerCase();
        return history.filter(event =>
            event.clientSnapshot.nombreCompleto.toLowerCase().includes(lowercasedFilter) ||
            event.clientSnapshot.dni.replace(/\./g, '').includes(lowercasedFilter.replace(/\./g, ''))
        );
    }, [history, searchTerm]);

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
                        <h2 className="text-2xl font-bold text-blue-900">Gestión de Clientes</h2>
                        <p className="text-gray-600 mt-1">Agregue, edite o elimine clientes de la base de datos.</p>
                    </div>
                    <button
                        onClick={handleAddNewClick}
                        title={showForm && !editingClient ? 'Ocultar el formulario de ingreso' : 'Mostrar el formulario para agregar un nuevo cliente'}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105 mt-4 sm:mt-0"
                    >
                        <PlusIcon className="h-5 w-5"/>
                        {showForm && !editingClient ? 'Ocultar Formulario' : 'Ingresar Cliente Nuevo'}
                    </button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar en listado o historial por nombre o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 pl-10 pr-4"
                    />
                </div>
                
                {showForm && (
                     <div ref={formRef} className="bg-white border border-gray-200 rounded-xl p-6 mb-8 transition-all duration-500 ease-in-out">
                        <h3 className="text-xl font-semibold text-blue-900 mb-4">{editingClient ? 'Detalles del Cliente' : 'Ingresar Nuevo Cliente'}</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input type="text" name="nombreCompleto" id="nombreCompleto" value={formData.nombreCompleto} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                                <input type="date" name="fechaNacimiento" id="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                                <input type="text" name="dni" id="dni" value={formData.dni} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="cuil" className="block text-sm font-medium text-gray-700 mb-1">CUIL</label>
                                <input type="text" name="cuil" id="cuil" value={formData.cuil} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="carnetManejo" className="block text-sm font-medium text-gray-700 mb-1">Carnet de Manejo</label>
                                <input type="text" name="carnetManejo" id="carnetManejo" value={formData.carnetManejo} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div className="lg:col-span-3">
                                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input type="text" name="direccion" id="direccion" value={formData.direccion} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="celular" className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                                <input type="tel" name="celular" id="celular" value={formData.celular} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                             <div>
                                <label htmlFor="estadoCivil" className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                                <select name="estadoCivil" id="estadoCivil" value={formData.estadoCivil} onChange={handleInputChange} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3">
                                    {Object.values(CivilStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="col-span-full mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                    Fotos del Carnet de Manejo <span className="text-gray-500">(Obligatorio)</span>
                                </label>
                                <div className="flex flex-wrap gap-6 items-start justify-center mt-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-gray-500 font-semibold">Frente</span>
                                        <div className="relative w-56 h-36 group">
                                            {formData.fotoCarnetFrente ? (
                                                <>
                                                    <img src={formData.fotoCarnetFrente} alt="Frente del Carnet" className="w-full h-full object-cover rounded-lg border border-gray-300" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePhoto('fotoCarnetFrente')}
                                                        className="absolute top-0 right-0 m-2 bg-red-600/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        aria-label="Eliminar foto del frente"
                                                        title="Eliminar foto del frente"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="w-56 h-36">
                                                    <label htmlFor="frente-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-gray-500 hover:text-blue-500 p-2">
                                                        <ImageIcon className="h-10 w-10 mb-2" />
                                                        <span className="text-sm text-center font-semibold">Añadir Foto</span>
                                                    </label>
                                                    <input
                                                        id="frente-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handlePhotoChange(e, 'fotoCarnetFrente')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-gray-500 font-semibold">Dorso</span>
                                        <div className="relative w-56 h-36 group">
                                            {formData.fotoCarnetDorso ? (
                                                <>
                                                    <img src={formData.fotoCarnetDorso} alt="Dorso del Carnet" className="w-full h-full object-cover rounded-lg border border-gray-300" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePhoto('fotoCarnetDorso')}
                                                        className="absolute top-0 right-0 m-2 bg-red-600/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        aria-label="Eliminar foto del dorso"
                                                        title="Eliminar foto del dorso"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                 <div className="w-56 h-36">
                                                     <label htmlFor="dorso-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-gray-500 hover:text-blue-500 p-2">
                                                        <ImageIcon className="h-10 w-10 mb-2" />
                                                        <span className="text-sm text-center font-semibold">Añadir Foto</span>
                                                    </label>
                                                    <input
                                                        id="dorso-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handlePhotoChange(e, 'fotoCarnetDorso')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {photoError && <p className="text-red-500 text-sm text-center mt-3">{photoError}</p>}
                            </div>


                            <div className="col-span-full flex justify-center gap-4 mt-4">
                               <button type="button" onClick={handleCancel} title="Cancelar la operación y cerrar el formulario" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                               {editingClient && userRole === UserRole.ADMIN && (
                                   <button type="button" onClick={() => handleDeleteClick(editingClient.id)} title="Eliminar este cliente permanentemente" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><TrashIcon className="h-5 w-5"/>Eliminar</button>
                               )}
                               <button type="submit" title={editingClient ? 'Guardar los cambios realizados en este cliente' : 'Guardar el nuevo cliente en la base de datos'} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{editingClient ? 'Guardar Cambios' : 'Guardar Cliente'}</button>
                            </div>
                        </form>
                    </div>
                )}
                
                <div className="space-y-10">
                    <div>
                        <h3 className="text-xl font-semibold text-blue-900 mb-4">Listado de Clientes</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-900 sm:pl-6">Nombre</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">DNI</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden sm:table-cell">Celular</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden md:table-cell">Carnet</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="font-medium text-blue-900">{client.nombreCompleto}</div>
                                                <div className="text-gray-500 sm:hidden mt-1">{client.celular}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 font-mono">{client.dni}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 hidden sm:table-cell">{client.celular}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 hidden md:table-cell font-mono">{client.carnetManejo}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex items-center justify-end gap-x-1">
                                                    <button onClick={() => handleEditClick(client)} className="text-blue-600 hover:text-blue-500 p-2 rounded-md transition-colors" title="Editar / Ver Detalles"><EditIcon className="h-5 w-5"/></button>
                                                    {userRole === UserRole.ADMIN && (
                                                        <button onClick={() => handleDeleteClick(client.id)} className="text-red-500 hover:text-red-400 p-2 rounded-md transition-colors" title="Eliminar"><TrashIcon className="h-5 w-5"/></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {filteredClients.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>{searchTerm ? 'No se encontraron clientes con ese criterio de búsqueda.' : 'No hay clientes registrados.'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-blue-900 mb-4">Historial de Actividad de Clientes</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-900 sm:pl-6">Cliente</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden sm:table-cell">DNI</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Acción</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden md:table-cell">Fecha</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredHistory.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 pl-4 pr-3 text-sm sm:pl-6 font-medium text-blue-900">{event.clientSnapshot.nombreCompleto}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 hidden sm:table-cell font-mono">{event.clientSnapshot.dni}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{event.action}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 hidden md:table-cell">{new Date(event.date).toLocaleString()}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex items-center justify-end gap-x-1">
                                                    <button onClick={() => setModalData(event)} className="text-gray-500 hover:text-blue-800 p-2 rounded-md transition-colors" title="Ver Detalles"><InfoIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => handlePrintHistory(event)} className="text-gray-500 hover:text-blue-800 p-2 rounded-md transition-colors" title="Imprimir"><PrintIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => handleDownloadHistory(event)} className="text-gray-500 hover:text-blue-800 p-2 rounded-md transition-colors" title="Descargar"><DownloadIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => handleDeleteHistory(event.id)} className="text-red-500 hover:text-red-400 p-2 rounded-md transition-colors" title="Eliminar Historial"><TrashIcon className="h-5 w-5"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredHistory.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>{searchTerm ? 'No se encontraron clientes con ese criterio de búsqueda.' : 'No hay clientes registrados.'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

             {modalData && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-200 transform transition-all">
                       <div className="flex justify-between items-center p-5 border-b border-gray-200">
                           <h3 className="text-xl font-semibold text-blue-900">Detalles del Historial</h3>
                           <button onClick={() => setModalData(null)} className="text-gray-500 hover:text-blue-800" aria-label="Cerrar" title="Cerrar esta ventana"><XIcon className="h-6 w-6"/></button>
                       </div>
                       <div className="p-6 max-h-[70vh] overflow-y-auto">
                           <div className="bg-gray-50 p-4 rounded-lg mb-6 text-center">
                               <p><span className="font-semibold text-gray-700">Acción:</span> <strong className="text-blue-900">{modalData.action}</strong></p>
                               <p><span className="font-semibold text-gray-700">Fecha:</span> <strong className="text-blue-900">{new Date(modalData.date).toLocaleString()}</strong></p>
                           </div>
                           <div className="text-left">
                               <ClientDetailsNaturalLanguage client={modalData.clientSnapshot} />
                           </div>
                       </div>
                       <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            <button type="button" onClick={() => setModalData(null)} title="Cerrar esta ventana" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cerrar</button>
                       </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientManagement;