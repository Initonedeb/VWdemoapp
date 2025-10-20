import React, { useState, useMemo, useRef, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001';
const API_URL = `${API_BASE_URL}/api`;

import { Car, CarStatus, Sector, Category } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import InfoIcon from './icons/InfoIcon';
import EditIcon from './icons/EditIcon';
import ImageIcon from './icons/ImageIcon';
import PrintIcon from './icons/PrintIcon';
import DownloadIcon from './icons/DownloadIcon';
import XIcon from './icons/XIcon';
import SearchIcon from './icons/SearchIcon';
import { UserRole } from '../types';
import QrCodeIcon from './icons/QrCodeIcon';

const vwModels = ['T-Cross', 'Taos', 'Nivus', 'Amarok', 'Vento', 'Tera', 'Tiguan', 'Polo', 'Saveiro', 'Virtus'];

const modelVersions: { [key: string]: string[] } = {
    'Polo': ['Track', 'Comfortline AT', 'Highline AT'],
    'Amarok': [
        'V6 Highline', 'V6 Extreme', 'V6 Blackstyle', 'V6 Hero', 'V6 Comfort',
        '2.0 Trendline', '2.0 Comfortline', '2.0 Highline'
    ],
    'Taos': ['Comfortline', 'Highline', 'BI Tono'],
    'Virtus': ['MSI', 'Comfortline', 'Highline', 'Exclusive'],
    'Nivus': ['170 TSI', 'Trendline AT 200 TSI', 'Comfortline 200 TSI', 'Highline Outfit 200 TSI'],
    'T-Cross': ['Trendline 170 TSI', 'Trendline AT 200 TSI', 'Comfortline 200 TSI', 'Highline 200 TSI', 'Extreme 200 TSI'],
    'Tiguan': ['Allspace Trendline', 'Allspace Comfortline', 'Allspace R-line'],
    'Vento': ['GLI'],
    'Saveiro': ['Trendline', 'Comfortline', 'Extreme'],
    'Tera': ['Trend', 'Comfort', 'High', 'Outfit']
};

const emptyCar: Omit<Car, 'id'> = {
    marca: 'Volkswagen',
    modelo: vwModels[0],
    version: '',
    ano: new Date().getFullYear(),
    kilometraje: 0,
    estado: CarStatus.DISPONIBLE,
    patente: '',
    chasis: '',
    motor: '',
    garantia: true,
    sector: Sector.VENTAS,
    categoria: Category.DEMO,
    sucursal: 'San Lorenzo 254',
    fotos: [],
};

interface HistoryEvent {
  id: number;
  date: string;
  action: 'Creado' | 'Modificado' | 'Eliminado';
  carSnapshot: Car;
}

const initialHistory: HistoryEvent[] = [];

interface UsedCarManagementProps {
  onBack: () => void;
  userRole: UserRole;
}

const CarDetailsNaturalLanguage: React.FC<{ car: Car }> = ({ car }) => {
    const getPhotoUrl = (photo: string | File) => {
        if (typeof photo === 'string') {
            return photo.startsWith('/') ? `${API_BASE_URL}${photo}` : photo;
        }
        return URL.createObjectURL(photo);
    };

    return (
        <div className="space-y-4 text-gray-700 text-base leading-relaxed">
            <p>
                El registro corresponde a un <strong className="text-blue-600">{car.marca} {car.modelo}</strong>, versión <strong className="text-blue-900">{car.version}</strong>, del año <strong className="text-blue-900">{car.ano}</strong>.
                Al momento del registro, el vehículo tenía un kilometraje de <strong className="text-blue-900">{car.kilometraje.toLocaleString()} km</strong>.
            </p>
            <p>
                Identificado con la patente <strong className="font-mono bg-gray-200 text-blue-900 px-2 py-1 rounded">{car.patente}</strong>,
                su número de chasis es <strong className="text-blue-900">{car.chasis}</strong> y el de motor es <strong className="text-blue-900">{car.motor}</strong>.
                En ese momento, {car.garantia ? 'se encontraba en período de garantía' : 'ya no contaba con garantía'}.
            </p>
            <p>
                El vehículo fue clasificado en la categoría <strong className="text-blue-900">{car.categoria}</strong>,
                asignado al sector de <strong className="text-blue-900">{car.sector}</strong>,
                y su estado era <strong className="text-blue-900">{car.estado}</strong>.
            </p>
             {car.fotos && car.fotos.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3 border-b border-gray-200 pb-2">Fotos Adjuntas</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
                        {car.fotos.map((foto, index) => (
                            <div key={index} className="rounded-lg overflow-hidden border-2 border-gray-300 aspect-w-1 aspect-h-1">
                                <img src={getPhotoUrl(foto)} alt={`Foto del vehículo ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {car.qr_code_url && (
                <div className="mt-6 text-center">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3 border-b border-gray-200 pb-2">Código QR</h4>
                    <div className="flex justify-center items-center gap-4">
                        <img src={`${API_BASE_URL}${car.qr_code_url}`} alt="Código QR del vehículo" className="mx-auto w-48 h-48 object-contain p-2 border border-gray-300 rounded-lg" />
                        <button onClick={() => onPrintQR(car)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                            <PrintIcon className="h-5 w-5"/> Imprimir QR
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Escanee para identificar el vehículo.</p>
                </div>
            )}
        </div>
    );
};


const UsedCarManagement: React.FC<UsedCarManagementProps> = ({ onBack, userRole }) => {
    const [cars, setCars] = useState<Car[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCar, setEditingCar] = useState<Car | null>(null);
    const [formData, setFormData] = useState<Omit<Car, 'id'> & { version: string, fotos: (File | string)[] }>(emptyCar);
    const [photoError, setPhotoError] = useState<string>('');
    const [history, setHistory] = useState<HistoryEvent[]>(initialHistory);
    const [modalData, setModalData] = useState<HistoryEvent | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await fetch(`${API_URL}/cars`);
                if (!response.ok) {
                    throw new Error('Error al cargar los vehículos');
                }
                const data: Car[] = await response.json();
                setCars(data);
            } catch (error) {
                console.error(error);
                alert('No se pudo conectar con el servidor para obtener los vehículos.');
            }
        };

        fetchCars();
    }, []);
    
    const filteredCars = useMemo(() => {
        if (!searchTerm) return cars;
        return cars.filter(car =>
            car.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.patente.toLowerCase().replace(/\s+/g, '').includes(searchTerm.toLowerCase().replace(/\s+/g, ''))
        );
    }, [cars, searchTerm]);

    const filteredHistory = useMemo(() => {
        if (!searchTerm) return history;
        const lowercasedFilter = searchTerm.toLowerCase();
        return history.filter(event =>
            event.carSnapshot.marca.toLowerCase().includes(lowercasedFilter) ||
            event.carSnapshot.modelo.toLowerCase().includes(lowercasedFilter) ||
            event.carSnapshot.version.toLowerCase().includes(lowercasedFilter) ||
            event.carSnapshot.patente.toLowerCase().replace(/\s+/g, '').includes(lowercasedFilter.replace(/\s+/g, ''))
        );
    }, [history, searchTerm]);

    const addHistoryEvent = (action: HistoryEvent['action'], car: Car) => {
        const newEvent: HistoryEvent = {
            id: Date.now(),
            date: new Date().toISOString(),
            action,
            carSnapshot: car
        };
        setHistory(prev => [newEvent, ...prev]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'garantia') {
            setFormData(prev => ({ ...prev, [name]: value === 'true' }));
        } else if (name === 'modelo') {
            setFormData(prev => ({ ...prev, modelo: value, version: '' }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const remainingSlots = 4 - formData.fotos.length;
            if (files.length > remainingSlots) {
                setPhotoError(`Puede subir ${remainingSlots} foto(s) más como máximo.`);
                return;
            }

            setPhotoError('');
            const validFiles = files.filter(file => file.type.startsWith('image/'));
            setFormData(prev => ({
                ...prev,
                fotos: [...prev.fotos, ...validFiles]
            }));
            e.target.value = '';
        }
    };
    
    const handleRemovePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            fotos: prev.fotos.filter((_, i) => i !== index)
        }));
    };

    const handleAddNewClick = () => {
        setEditingCar(null);
        setFormData(emptyCar);
        setShowForm(!showForm);
    };
    
    const handleDetailsClick = (car: Car) => {
        setEditingCar(car);
        setFormData(car);
        setShowForm(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('¿Está seguro de que desea eliminar este vehículo? Esta acción es irreversible.')) {
            try {
                const response = await fetch(`${API_URL}/cars/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar el vehículo');
                }

                setCars(cars.filter(car => car.id !== id));

            } catch (error) {
                console.error(error);
                alert(`Error: ${error.message}`);
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCar(null);
        setFormData(emptyCar);
        setPhotoError('');
    };
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (formData.fotos.length < 2) {
            setPhotoError('Debe subir al menos 2 fotos.');
            return;
        }
        setPhotoError('');

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'fotos') {
                (value as (File | string)[]).forEach(foto => {
                    if (foto instanceof File) {
                        data.append('fotos', foto);
                    }
                });
            } else {
                data.append(key, String(value));
            }
        });

        try {
            let updatedCar: Car;
            const url = editingCar ? `${API_URL}/cars/${editingCar.id}` : `${API_URL}/cars`;
            const method = editingCar ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al ${editingCar ? 'actualizar' : 'crear'} el vehículo`);
            }
            
            updatedCar = await response.json();

            if (editingCar) {
                setCars(cars.map(car => car.id === updatedCar.id ? updatedCar : car));
            } else {
                setCars(prevCars => [updatedCar, ...prevCars]);
            }
            handleCancel();
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        }
    };

    const getPhotoUrl = (photo: string | File) => {
        if (typeof photo === 'string') {
            return photo.startsWith('/') ? `${API_BASE_URL}${photo}` : photo;
        }
        return URL.createObjectURL(photo);
    };

    const printContent = (car: Car) => {
        const photoElements = car.fotos.map(foto => {
            const photoUrl = getPhotoUrl(foto);
            return `<div class="photo border rounded-lg overflow-hidden shadow-md"><img src="${photoUrl}" alt="Foto del vehículo" class="w-full h-full object-cover"></div>`;
        }).join('');

        return `
            <h1 class="text-3xl font-bold text-gray-800">Ficha del Vehículo</h1>
            <p class="text-gray-500">${new Date().toLocaleDateString()}</p>
            </header>
            <main>
                <div class="grid grid-cols-2 gap-x-12 gap-y-4 text-lg">
                    <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Marca:</span> <span>${car.marca}</span></div>
                    <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Modelo:</span> <span>${car.modelo}</span></div>
                    <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Versión:</span> <span>${car.version}</span></div>
                    <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Año:</span> <span>${car.ano}</span></div>
                    <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Kilometraje:</span> <span>${car.kilometraje.toLocaleString()} km</span></div>
                    <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Patente:</span> <span class="font-mono bg-gray-200 px-2 py-1 rounded">${car.patente}</span></div>
                    <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Chasis:</span> <span>${car.chasis}</span></div>
                    <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Motor:</span> <span>${car.motor}</span></div>
                    <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Garantía:</span> <span>${car.garantia ? 'Sí' : 'No'}</span></div>
                    <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Categoría:</span> <span>${car.categoria}</span></div>
                    <div class="flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Sector:</span> <span>${car.sector}</span></div>
                    <div class="col-span-2 flex justify-between border-b py-2"><span class="font-semibold text-gray-600">Estado:</span> <span>${car.estado}</span></div>
                </div>
                ${car.fotos && car.fotos.length > 0 ? `<div class="mt-10"><h2 class="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Fotos</h2><div class="grid grid-cols-2 gap-6">${photoElements}</div></div>` : ''}
            </main>`;
    };
        
    const handlePrint = (car: Car) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Ficha del Vehículo - ${car.marca} ${car.modelo}</title><script src="https://cdn.tailwindcss.com"></script><style>@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head>
                    <body class="bg-white text-gray-900 p-8 font-sans">
                        ${printContent(car)}
                        <footer class="mt-12 text-center text-gray-500 text-sm"><p>Documento generado por el Sistema de Prestaciones.</p></footer>
                        <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
                    </body>
                </html>`);
            printWindow.document.close();
        }
    };

    const handlePrintQR = (car: Car) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Código QR - ${car.patente}</title><script src="https://cdn.tailwindcss.com"></script></head>
                    <body class="flex justify-center items-center h-screen bg-gray-100">
                        <div class="text-center p-8 bg-white rounded-lg shadow-lg">
                            <h1 class="text-2xl font-bold mb-2">${car.marca} ${car.modelo}</h1>
                            <p class="text-lg text-gray-600 mb-4 font-mono">${car.patente}</p>
                            <img src="${API_BASE_URL}${car.qr_code_url}" alt="Código QR del vehículo" class="w-64 h-64 mx-auto" />
                            <p class="mt-4 text-sm text-gray-500">ID: ${car.id}</p>
                        </div>
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
        a.download = `historial_vehiculo_${event.carSnapshot.patente}_${event.id}.json`;
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
    
    const getStatusColor = (status: CarStatus) => {
        switch (status) {
            case CarStatus.DISPONIBLE: return 'bg-green-100 text-green-800 border-green-200';
            case CarStatus.PRESTADO: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case CarStatus.VENDIDO: return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }
    
    const getRowColor = (status: CarStatus) => {
        switch (status) {
            case CarStatus.DISPONIBLE: return 'bg-green-50 hover:bg-green-100';
            case CarStatus.PRESTADO: return 'bg-yellow-50 hover:bg-yellow-100';
            case CarStatus.VENDIDO: return 'bg-red-50 hover:bg-red-100';
            default: return 'hover:bg-gray-50';
        }
    }

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
                        <h2 className="text-2xl font-bold text-blue-900">Gestión de Demos</h2>
                        <p className="text-gray-600 mt-1">Agregue, edite o elimine vehículos del inventario.</p>
                    </div>
                    <button
                        onClick={handleAddNewClick}
                        title={showForm && !editingCar ? 'Ocultar el formulario de ingreso' : 'Mostrar el formulario para agregar un nuevo vehículo'}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105 mt-4 sm:mt-0"
                    >
                        <PlusIcon className="h-5 w-5"/>
                        {showForm && !editingCar ? 'Ocultar Formulario' : 'Ingresar Auto Nuevo'}
                    </button>
                </div>
                
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar en listado o historial por marca, modelo, versión o patente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 pl-10 pr-4"
                    />
                </div>
                
                {showForm && (
                     <div ref={formRef} className="bg-white border border-gray-200 rounded-xl p-6 mb-8 transition-all duration-500 ease-in-out">
                        <h3 className="text-xl font-semibold text-blue-900 mb-4">{editingCar ? 'Detalles del Vehículo' : 'Ingresar Nuevo Vehículo'}</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Form fields */}
                            <div>
                                <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                <select name="marca" id="marca" value={formData.marca} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3">
                                    <option>Volkswagen</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="modelo" className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                                <select name="modelo" id="modelo" value={formData.modelo} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3">
                                    {vwModels.map(model => <option key={model} value={model}>{model}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">Versión</label>
                                <input 
                                    type="text" 
                                    name="version" 
                                    id="version" 
                                    value={formData.version} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="Seleccione o escriba una versión" 
                                    list="version-options"
                                    className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"
                                />
                                <datalist id="version-options">
                                    {(modelVersions[formData.modelo] || []).map(v => <option key={v} value={v} />)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                                <input type="number" name="ano" id="ano" value={formData.ano} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="kilometraje" className="block text-sm font-medium text-gray-700 mb-1">Kilometraje</label>
                                <input type="number" name="kilometraje" id="kilometraje" value={formData.kilometraje} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="patente" className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
                                <input type="text" name="patente" id="patente" value={formData.patente} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="chasis" className="block text-sm font-medium text-gray-700 mb-1">Chasis</label>
                                <input type="text" name="chasis" id="chasis" value={formData.chasis} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="motor" className="block text-sm font-medium text-gray-700 mb-1">Motor</label>
                                <input type="text" name="motor" id="motor" value={formData.motor} onChange={handleInputChange} required className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label htmlFor="garantia" className="block text-sm font-medium text-gray-700 mb-1">Garantía</label>
                                <select name="garantia" id="garantia" value={String(formData.garantia)} onChange={handleInputChange} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3">
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                                <select name="sector" id="sector" value={formData.sector} onChange={handleInputChange} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3">
                                    {Object.values(Sector).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select name="categoria" id="categoria" value={formData.categoria} onChange={handleInputChange} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3">
                                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="sucursal" className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                                <select name="sucursal" id="sucursal" value={formData.sucursal} onChange={handleInputChange} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3">
                                    <option>San Lorenzo 254</option>
                                    <option>Adolfo de la Vega 379</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select name="estado" id="estado" value={formData.estado} onChange={handleInputChange} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3">
                                    {Object.values(CarStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </div>

                            {editingCar && editingCar.qr_code_url && (
                                <div className="col-span-full mt-4 text-center">
                                    <h4 className="text-lg font-semibold text-blue-900 mb-3 border-b border-gray-200 pb-2">Código QR</h4>
                                    <div className="flex flex-col items-center gap-4">
                                        <img src={`${API_BASE_URL}${editingCar.qr_code_url}`} alt="Código QR del vehículo" className="w-48 h-48 object-contain p-2 border border-gray-300 rounded-lg" />
                                        <button type="button" onClick={() => handlePrintQR(editingCar)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                            <PrintIcon className="h-5 w-5"/> Imprimir QR
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Escanee para identificar el vehículo.</p>
                                </div>
                            )}
                            
                            <div className="col-span-full mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                    Fotos del Vehículo <span className="text-gray-500">(Mín. 2, Máx. 4)</span>
                                </label>
                                <div className="flex flex-wrap gap-6 items-center justify-center mt-4">
                                    {formData.fotos.map((foto, index) => (
                                        <div key={index} className="relative w-56 h-40 group">
                                            <img src={getPhotoUrl(foto)} alt={`Foto ${index + 1}`} className="w-full h-full object-cover rounded-lg border border-gray-300" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePhoto(index)}
                                                className="absolute top-0 right-0 m-2 bg-red-600/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                aria-label="Eliminar foto"
                                                title="Eliminar esta foto"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.fotos.length < 4 && (
                                        <div className="w-56 h-40">
                                            <label htmlFor="foto-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-gray-500 hover:text-blue-500 p-2">
                                                <ImageIcon className="h-12 w-12 mb-2" />
                                                <span className="text-sm text-center font-semibold">Añadir Foto</span>
                                            </label>
                                            <input
                                                id="foto-upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handlePhotoChange}
                                            />
                                        </div>
                                    )}
                                </div>
                                {photoError && <p className="text-red-500 text-sm text-center mt-3">{photoError}</p>}
                            </div>

                            <div className="col-span-full flex justify-center gap-4 mt-4">
                               <button type="button" onClick={handleCancel} title="Cancelar la operación y cerrar el formulario" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                               {editingCar && userRole === UserRole.ADMIN && (
                                   <button type="button" onClick={() => handleDeleteClick(editingCar.id)} title="Eliminar este vehículo permanentemente" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><TrashIcon className="h-5 w-5"/>Eliminar</button>
                               )}
                               <button type="submit" title={editingCar ? 'Guardar los cambios realizados en este vehículo' : 'Guardar el nuevo vehículo en el inventario'} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{editingCar ? 'Guardar Cambios' : 'Guardar Vehículo'}</button>
                            </div>
                        </form>
                    </div>
                )}
                
                <div className="space-y-10">
                    <div>
                        <h3 className="text-xl font-semibold text-blue-900 mb-4">Listado de Vehículos</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-900 sm:pl-6">Vehículo</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden sm:table-cell">Patente</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Año</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden lg:table-cell">Kilometraje</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden md:table-cell">Categoría</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden md:table-cell">Sector</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Sucursal</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Estado</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredCars.map((car) => (
                                        <tr key={car.id} className={`${getRowColor(car.estado)} transition-colors`}>
                                            <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="font-medium text-blue-900">{car.marca} {car.modelo}</div>
                                                <div className="text-gray-500">{car.version}</div>
                                                <div className="text-gray-500 sm:hidden mt-1 font-mono">{car.patente}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 hidden sm:table-cell font-mono">{car.patente}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{car.ano}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 hidden lg:table-cell">{car.kilometraje.toLocaleString()} km</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 hidden md:table-cell">{car.categoria}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 hidden md:table-cell">{car.sector}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{car.sucursal}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(car.estado)}`}>
                                                {car.estado}
                                              </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex items-center justify-end gap-x-1">
                                                    <button onClick={() => handlePrint(car)} className="text-gray-500 hover:text-blue-800 p-2 rounded-md transition-colors" title="Imprimir Ficha"><span className="sr-only">Imprimir</span><PrintIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => handleDetailsClick(car)} className="text-blue-600 hover:text-blue-500 p-2 rounded-md transition-colors" title="Editar / Ver Detalles"><span className="sr-only">Editar</span><EditIcon className="h-5 w-5"/></button>
                                                    {userRole === UserRole.ADMIN && (
                                                        <button onClick={() => handleDeleteClick(car.id)} className="text-red-500 hover:text-red-400 p-2 rounded-md transition-colors" title="Eliminar"><span className="sr-only">Eliminar</span><TrashIcon className="h-5 w-5"/></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {filteredCars.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>{searchTerm ? 'No se encontraron vehículos con ese criterio de búsqueda.' : 'No hay vehículos registrados.'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-semibold text-blue-900 mb-4">Historial de Actividad de Vehículos</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-900 sm:pl-6">Vehículo</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden sm:table-cell">Patente</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Acción</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden md:table-cell">Fecha</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredHistory.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 pl-4 pr-3 text-sm sm:pl-6 font-medium text-blue-900">{event.carSnapshot.marca} {event.carSnapshot.modelo}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 hidden sm:table-cell font-mono">{event.carSnapshot.patente}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{event.action}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 hidden md:table-cell">{new Date(event.date).toLocaleString()}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex items-center justify-end gap-x-1">
                                                    <button onClick={() => setModalData(event)} className="text-gray-500 hover:text-blue-800 p-2 rounded-md transition-colors" title="Ver Detalles"><InfoIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => handlePrint(event.carSnapshot)} className="text-gray-500 hover:text-blue-800 p-2 rounded-md transition-colors" title="Imprimir"><PrintIcon className="h-5 w-5"/></button>
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
                                    <p>{searchTerm ? 'No se encontraron registros en el historial con ese criterio.' : 'No hay actividad registrada en el historial.'}</p>
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
                               <pre className="bg-gray-800 text-white p-4 rounded-lg text-sm">{JSON.stringify(modalData.carSnapshot, null, 2)}</pre>
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

export default UsedCarManagement;