import React, { useState, useMemo, useEffect } from 'react';
import { Car, CarStatus, Sector, Category, Client, CivilStatus, Prestamo, PrestamoStatus, UserRole } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PrintIcon from './icons/PrintIcon';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import DownloadIcon from './icons/DownloadIcon';
import InfoIcon from './icons/InfoIcon';
import TrashIcon from './icons/TrashIcon';
import SearchIcon from './icons/SearchIcon';


// Mock data for cars
const initialCars: Car[] = [
    { id: 1, marca: 'Volkswagen', modelo: 'Vento', version: 'Comfortline 1.4 TSI', ano: 2021, kilometraje: 15000, estado: CarStatus.PRESTADO, patente: 'AB123CD', chasis: '12345ABC', motor: 'XYZ987', garantia: true, sector: Sector.VENTAS, categoria: Category.DEMO, fotos: [] },
    { id: 2, marca: 'Volkswagen', modelo: 'Taos', version: 'Highline 250 TSI', ano: 2020, kilometraje: 25000, estado: CarStatus.PRESTADO, patente: 'AE456FG', chasis: '67890DEF', motor: 'UVW654', garantia: true, sector: Sector.SERVICIOS, categoria: Category.SUSTITUTO, fotos: [] },
    { id: 3, marca: 'Volkswagen', modelo: 'Amarok', version: 'V6 Extreme', ano: 2022, kilometraje: 5000, estado: CarStatus.VENDIDO, patente: 'AC789HI', chasis: '13579GHI', motor: 'RST321', garantia: false, sector: Sector.VENTAS, categoria: Category.DUENO, fotos: [] },
    { id: 4, marca: 'Volkswagen', modelo: 'T-Cross', version: 'Highline 200 TSI', ano: 2019, kilometraje: 45000, estado: CarStatus.DISPONIBLE, patente: 'AD012JK', chasis: '24680JKL', motor: 'OPQ987', garantia: true, sector: Sector.VENTAS, categoria: Category.DEMO, fotos: [] },
    { id: 5, marca: 'Volkswagen', modelo: 'Nivus', version: 'Highline 200 TSI', ano: 2023, kilometraje: 100, estado: CarStatus.DISPONIBLE, patente: 'AF555KL', chasis: '35791MNO', motor: 'GHI123', garantia: true, sector: Sector.VENTAS, categoria: Category.DEMO, fotos: [] },
];

// Mock data for clients
const initialClients: Client[] = [
    { id: 1, nombreCompleto: 'Juan Pérez', fechaNacimiento: '1985-05-20', dni: '31.123.456', carnetManejo: '31123456', direccion: 'Av. Siempre Viva 742', celular: '11-5555-1234', email: 'juan.perez@example.com', cuil: '20-31123456-8', estadoCivil: CivilStatus.CASADO },
    { id: 2, nombreCompleto: 'María García', fechaNacimiento: '1992-11-15', dni: '37.987.654', carnetManejo: '37987654', direccion: 'Calle Falsa 123', celular: '11-5555-5678', email: 'maria.garcia@example.com', cuil: '27-37987654-5', estadoCivil: CivilStatus.SOLTERO },
    { id: 3, nombreCompleto: 'Carlos Rodríguez', fechaNacimiento: '1978-01-30', dni: '26.456.789', carnetManejo: '26456789', direccion: 'Boulevard de los Sueños Rotos', celular: '11-5555-9012', email: 'carlos.r@example.com', cuil: '20-26456789-3', estadoCivil: CivilStatus.DIVORCIADO },
];

const initialPrestamos: Prestamo[] = [
    status: PrestamoStatus.ACTIVA, gestionadoPor: 'empleado (VENTAS)', autorizadoPor: 'Admin' },
    { id: 2, car: { ...initialCars[1], estado: CarStatus.DISPONIBLE}, client: initialClients[0], loanDate: '2024-07-15', returnDate: '2024-07-22', status: PrestamoStatus.FINALIZADA, gestionadoPor: 'empleado (VENTAS)', autorizadoPor: 'Admin' },
];

interface PrestamosManagementProps {
  onBack: () => void;
  currentUser: { username: string; role: UserRole };
}

const PrestamoDetailsNaturalLanguage: React.FC<{ prestamo: Prestamo }> = ({ prestamo }) => {
    return (
        <div className="space-y-6 text-gray-300 text-base leading-relaxed">
            <div>
                <h4 className="text-lg font-semibold text-teal-400 mb-2 border-b border-gray-700 pb-2">Información del Préstamo</h4>
                <p>
                    Esta préstamo se encuentra en estado <strong className="text-white">{prestamo.status}</strong>.
                    El vehículo fue retirado el día <strong className="text-white">{new Date(prestamo.loanDate + 'T00:00:00').toLocaleDateString()}</strong>.
                    {prestamo.returnDate 
                        ? <span> La devolución se registró el <strong className="text-white">{new Date(prestamo.returnDate + 'T00:00:00').toLocaleDateString()}</strong>.</span>
                        : <span> Aún no se ha registrado la devolución.</span>
                    }
                </p>
                <p>
                    Gestionado por: <strong className="text-white">{prestamo.gestionadoPor || 'No especificado'}</strong>
                </p>
                <p>
                    Autorizado por: <strong className="text-white">{prestamo.autorizadoPor || 'No especificado'}</strong>
                </p>
            </div>
            <div>
                <h4 className="text-lg font-semibold text-teal-400 mb-2 border-b border-gray-700 pb-2">Vehículo Involucrado</h4>
                <p>
                    El vehículo prestado es un <strong className="text-white">{prestamo.car.marca} {prestamo.car.modelo}</strong> ({prestamo.car.version}) del año {prestamo.car.ano},
                    con patente <strong className="font-mono bg-gray-700 text-white px-2 py-1 rounded">{prestamo.car.patente}</strong>.
                </p>
            </div>
            <div>
                <h4 className="text-lg font-semibold text-teal-400 mb-2 border-b border-gray-700 pb-2">Cliente Asociado</h4>
                <p>
                    El préstamo fue otorgado a <strong className="text-white">{prestamo.client.nombreCompleto}</strong>,
                    identificado con DNI <strong className="text-white">{prestamo.client.dni}</strong>.
                    Su número de contacto es <strong className="text-white">{prestamo.client.celular}</strong>.
                </p>
            </div>
        </div>
    );
};


const PrestamosManagement: React.FC<PrestamosManagementProps> = ({ onBack, currentUser }) => {
    const [cars, setCars] = useState<Car[]>(() => {
        try {
            const savedCars = localStorage.getItem('cars');
            if (savedCars) {
                return JSON.parse(savedCars);
            }
        } catch (error) {
            console.error("Error reading cars from localStorage", error);
        }
        return initialCars;
    });
    const [clients] = useState<Client[]>(() => {
        try {
            const savedClients = localStorage.getItem('clients');
            if (savedClients) {
                return JSON.parse(savedClients);
            }
        } catch (error) {
            console.error("Error reading clients from localStorage", error);
        }
        return initialClients;
    });
    const [prestamos, setPrestamos] = useState<Prestamo[]>(() => {
        try {
            const savedPrestamos = localStorage.getItem('prestamos');
            if (savedPrestamos) {
                return JSON.parse(savedPrestamos);
            }
        } catch (error) {
            console.error("Error reading prestamos from localStorage", error);
        }
        return initialPrestamos;
    });
    const [showModal, setShowModal] = useState(false);
    const [modalDetails, setModalDetails] = useState<Prestamo | null>(null);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [loanDate, setLoanDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [autorizadoPor, setAutorizadoPor] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [prestamoSearchTerm, setPrestamoSearchTerm] = useState('');

    useEffect(() => {
        try {
            localStorage.setItem('prestamos', JSON.stringify(prestamos));
        } catch (error) {
            console.error("Error saving prestamos to localStorage", error);
        }
    }, [prestamos]);

    useEffect(() => {
        try {
            localStorage.setItem('cars', JSON.stringify(cars));
        } catch (error) {
            console.error("Error saving cars to localStorage", error);
        }
    }, [cars]);

    const availableDemos = useMemo(() => {
        return cars.filter(car => car.categoria === Category.DEMO && car.estado === CarStatus.DISPONIBLE);
    }, [cars]);

    const filteredClients = useMemo(() => {
        if (!clientSearchTerm) return clients;
        return clients.filter(client =>
            client.nombreCompleto.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
            client.dni.replace(/\./g, '').includes(clientSearchTerm.replace(/\./g, ''))
        );
    }, [clients, clientSearchTerm]);

    const filteredPrestamos = useMemo(() => {
        if (!prestamoSearchTerm) return prestamos;
        return prestamos.filter(p =>
            p.car.modelo.toLowerCase().includes(prestamoSearchTerm.toLowerCase()) ||
            p.car.version.toLowerCase().includes(prestamoSearchTerm.toLowerCase()) ||
            p.car.patente.toLowerCase().includes(prestamoSearchTerm.toLowerCase()) ||
            p.client.nombreCompleto.toLowerCase().includes(prestamoSearchTerm.toLowerCase()) ||
            p.client.dni.replace(/\./g, '').includes(prestamoSearchTerm.replace(/\./g, ''))
        );
    }, [prestamos, prestamoSearchTerm]);
    
    const handleOpenModal = (car: Car) => {
        setSelectedCar(car);
        setSelectedClientId('');
        setLoanDate(new Date().toISOString().split('T')[0]);
        setError('');
        setClientSearchTerm('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCar(null);
    };

    const handleSubmitLoan = () => {
        if (!selectedClientId || !selectedCar) {
            setError('Por favor, seleccione un cliente.');
            return;
        }
        
        const client = clients.find(c => c.id === parseInt(selectedClientId));
        if (!client) {
            setError('Cliente no encontrado.');
            return;
        }

        const newPrestamo: Prestamo = {
            id: Date.now(),
            car: selectedCar,
            client: client,
            loanDate: loanDate,
            status: PrestamoStatus.ACTIVA,
            gestionadoPor: `${currentUser.username} (${currentUser.role})`,
            autorizadoPor: autorizadoPor,
        };
        setPrestamos([newPrestamo, ...prestamos]);
        setCars(cars.map(c => c.id === selectedCar.id ? { ...c, estado: CarStatus.PRESTADO } : c));
        
        handleCloseModal();
    };

    const handleFinishLoan = (prestamoId: number) => {
        if (!window.confirm('¿Está seguro de que desea registrar la devolución de este vehículo?')) return;

        const today = new Date().toISOString().split('T')[0];
        const updatedPrestamos = prestamos.map(p => 
            p.id === prestamoId 
            ? { ...p, status: PrestamoStatus.FINALIZADA, returnDate: today } 
            : p
        );
        setPrestamos(updatedPrestamos);
        
        const prestamo = prestamos.find(p => p.id === prestamoId);
        if (prestamo) {
            setCars(cars.map(c => c.id === prestamo.car.id ? { ...c, estado: CarStatus.DISPONIBLE } : c));
        }
    };

    const handleDeletePrestamo = (id: number) => {
        if (window.confirm('¿Desea eliminar este registro del historial? Esta acción no se puede deshacer y no cambiará el estado del vehículo asociado.')) {
            setPrestamos(prestamos.filter(p => p.id !== id));
        }
    };
    
    const printPrestamoContent = (p: Prestamo) => `
        <div class="flex justify-between items-center mb-6">
            <img src="https://via.placeholder.com/100x50?text=Leon+Alperovich+Logo" alt="Leon Alperovich de Tucuman SA Logo" class="h-12">
            <img src="https://via.placeholder.com/100x50?text=Volkswagen+Logo" alt="Volkswagen Logo" class="h-12">
        </div>
        <h1 class="text-2xl font-bold text-center mb-6">Entrega de vehículo a préstamo</h1>
        <div class="space-y-4 text-gray-800">
            <p>En la localización <strong>San Miguel de Tucumán</strong>, con fecha <strong>${new Date(p.loanDate + 'T00:00:00').toLocaleDateString()}</strong>, se deja constancia que la persona:</p>
            <div class="ml-4">
                <p><strong>Nombre Completo:</strong> ${p.client.nombreCompleto}</p>
                <p><strong>DNI:</strong> ${p.client.dni}</p>
                <p><strong>CUIL:</strong> ${p.client.cuil}</p>
                <p><strong>Carnet de Manejo:</strong> ${p.client.carnetManejo}</p>
                <p><strong>Dirección:</strong> ${p.client.direccion}</p>
                <p><strong>Celular:</strong> ${p.client.celular}</p>
                <p><strong>Email:</strong> ${p.client.email}</p>
            </div>
            <p>retira de Leon Alperovich de Tucuman S.A. una unidad con las siguientes características:</p>
            <div class="ml-4">
                <p><strong>Marca:</strong> ${p.car.marca}</p>
                <p><strong>Modelo:</strong> ${p.car.modelo}</p>
                <p><strong>Versión:</strong> ${p.car.version}</p>
                <p><strong>Año:</strong> ${p.car.ano}</p>
                <p><strong>Patente:</strong> ${p.car.patente}</p>
                <p><strong>Chasis:</strong> ${p.car.chasis}</p>
                <p><strong>Motor:</strong> ${p.car.motor}</p>
            </div>
            <p>Se hace entrega de la tarjeta verde correspondiente, constancia de cobertura de seguro por 30 días y un juego de llaves.</p>
            <p>El cliente <strong>${p.client.nombreCompleto}</strong> (DNI: <strong>${p.client.dni}</strong>) responde económicamente por cualquier daño o faltante en la unidad.</p>
            <p>Dicha unidad debe reintegrarse a Leon Alperovich de Tucuman S.A. en la calle Adolfo de la Vega 379 de San Miguel de Tucumán en el momento que se la solicite sin necesidad de manifestar motivo alguno, en las mismas condiciones mecánicas, técnicas y de funcionamiento en que se entrega este acto.</p>
            <div class="mt-8 space-y-4">
                <p>Firma: _________________________</p>
                <p>Aclaración: ______________________</p>
                <p>DNI: ___________________________</p>
            </div>
        </div>
    `;

    const handlePrintPrestamo = (p: Prestamo) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Comprobante de Préstamo</title><script src="https://cdn.tailwindcss.com"></script></head>
                    <body class="bg-white text-gray-900 p-8 font-sans">
                        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Comprobante de Préstamo</h1>
                        ${printPrestamoContent(p)}
                        <footer class="mt-12 text-center text-gray-500 text-sm"><p>Generado por el Sistema de Préstamos.</p></footer>
                        <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
                    </body>
                </html>`);
            printWindow.document.close();
        }
    };
    
    const handleDownloadPrestamo = (p: Prestamo) => {
        const jsonString = JSON.stringify(p, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prestamo_${p.car.patente}_${p.client.dni}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getStatusColor = (status: PrestamoStatus) => {
        switch (status) {
            case PrestamoStatus.ACTIVA: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case PrestamoStatus.FINALIZADA: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    }
    
    const getRowColor = (status: PrestamoStatus) => {
        switch (status) {
            case PrestamoStatus.ACTIVA: return 'bg-yellow-500/10 hover:bg-yellow-500/20';
            case PrestamoStatus.FINALIZADA: return 'bg-gray-800/20 hover:bg-gray-800/50';
            default: return 'hover:bg-gray-800/50';
        }
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="grid grid-cols-3 items-center mb-8">
                <div className="justify-self-start">
                    <button
                      onClick={onBack}
                      title="Regresar al panel de administrador"
                      className="flex items-center gap-2 text-teal-400 hover:text-teal-300 font-bold py-2 pr-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105"
                    >
                      <ArrowLeftIcon className="h-5 w-5"/>
                      Volver al Panel
                    </button>
                </div>
                <div className="justify-self-center w-full max-w-md">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar en historial..."
                            value={prestamoSearchTerm}
                            onChange={(e) => setPrestamoSearchTerm(e.target.value)}
                            className="bg-gray-700 w-full rounded-md border-gray-600 text-white shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2.5 pl-10 pr-4"
                        />
                    </div>
                </div>
                <div className="justify-self-end"></div>
            </header>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-12">
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white">Demos Disponibles para Préstamo</h2>
                        <p className="text-gray-400 mt-1">Seleccione un vehículo para generar un nuevo préstamo.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Vehículo</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white hidden sm:table-cell">Patente</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 bg-gray-900/50">
                                {availableDemos.map((car) => (
                                    <tr key={car.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="font-medium text-white">{car.marca} {car.modelo}</div>
                                            <div className="text-gray-400">{car.version}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 hidden sm:table-cell font-mono">{car.patente}</td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <button 
                                                onClick={() => handleOpenModal(car)}
                                                title="Iniciar el proceso de préstamo para este vehículo"
                                                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-3 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105 text-xs"
                                            >
                                                <PlusIcon className="h-4 w-4"/>
                                                Generar Préstamo
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {availableDemos.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <p>No hay vehículos de demostración disponibles en este momento.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white">Historial de Préstamos</h2>
                        <p className="text-gray-400 mt-1">Listado de préstamos activos y finalizados.</p>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Vehículo</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white hidden md:table-cell">Cliente</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Fechas</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Estado</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 bg-gray-900/50">
                                {filteredPrestamos.map((p) => (
                                    <tr key={p.id} className={`${getRowColor(p.status)} transition-colors`}>
                                        <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="font-medium text-white">{p.car.marca} {p.car.modelo}</div>
                                            <div className="text-gray-400 font-mono">{p.car.patente}</div>
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-300 hidden md:table-cell">
                                            <div>{p.client.nombreCompleto}</div>
                                            <div className="text-gray-400 font-mono">{p.client.dni}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                            <div>P: {new Date(p.loanDate + 'T00:00:00').toLocaleDateString()}</div>
                                            <div className="text-gray-400">D: {p.returnDate ? new Date(p.returnDate + 'T00:00:00').toLocaleDateString() : '---'}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium">
                                            <div className="flex items-center gap-x-1">
                                                {p.status === PrestacionStatus.ACTIVA && (
                                                    <button onClick={() => handleFinishLoan(p.id)} className="text-green-400 hover:text-green-300 p-2 rounded-md transition-colors" title="Registrar Devolución"><CheckCircleIcon className="h-5 w-5"/></button>
                                                )}
                                                <button onClick={() => setModalDetails(p)} className="text-gray-400 hover:text-white p-2 rounded-md transition-colors" title="Ver Detalles"><InfoIcon className="h-5 w-5"/></button>
                                                <button onClick={() => handlePrintPrestamo(p)} className="text-gray-400 hover:text-white p-2 rounded-md transition-colors" title="Imprimir"><PrintIcon className="h-5 w-5"/></button>
                                                <button onClick={() => handleDownloadPrestamo(p)} className="text-gray-400 hover:text-white p-2 rounded-md transition-colors" title="Descargar"><DownloadIcon className="h-5 w-5"/></button>
                                                <button onClick={() => handleDeletePrestamo(p.id)} className="text-red-500 hover:text-red-400 p-2 rounded-md transition-colors" title="Eliminar"><TrashIcon className="h-5 w-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredPrestamos.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <p>No se encontraron préstamos con ese criterio de búsqueda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {showModal && selectedCar && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 transform transition-all">
                       <div className="flex justify-between items-center p-5 border-b border-gray-700">
                           <h3 className="text-xl font-semibold text-white">Generar Nuevo Préstamo</h3>
                           <button onClick={handleCloseModal} className="text-gray-400 hover:text-white" aria-label="Cerrar" title="Cerrar ventana">
                               <XIcon className="h-6 w-6"/>
                           </button>
                       </div>
                       <div className="p-6">
                           <div className="bg-gray-900/50 p-4 rounded-lg mb-6">
                               <h4 className="font-bold text-lg text-white">{selectedCar.marca} {selectedCar.modelo}</h4>
                               <p className="text-gray-300">{selectedCar.version} - Año {selectedCar.ano}</p>
                               <p className="text-gray-400 font-mono mt-1">Patente: {selectedCar.patente}</p>
                           </div>
                           <div className="space-y-4">
                                <div>
                                    <label htmlFor="cliente-search" className="block text-sm font-medium text-gray-300 mb-1">Buscar Cliente (por nombre o DNI)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <SearchIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="cliente-search"
                                            placeholder="Escriba para buscar..."
                                            value={clientSearchTerm}
                                            onChange={(e) => setClientSearchTerm(e.target.value)}
                                            className="bg-gray-700 w-full rounded-md border-gray-600 text-white shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2.5 pl-10 pr-4"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="cliente" className="block text-sm font-medium text-gray-300 mb-1">Asociar a Cliente</label>
                                    <select 
                                        id="cliente" 
                                        value={selectedClientId} 
                                        onChange={(e) => { setSelectedClientId(e.target.value); setError(''); }}
                                        className="bg-gray-700 w-full rounded-md border-gray-600 text-white shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2.5 px-3"
                                        size={filteredClients.length > 1 && filteredClients.length < 6 ? filteredClients.length + 1 : 5}
                                    >
                                        <option value="" disabled>-- Seleccione un cliente --</option>
                                        {filteredClients.map(client => (
                                            <option key={client.id} value={client.id}>{client.nombreCompleto} (DNI: {client.dni})</option>
                                        ))}
                                    </select>
                                    {filteredClients.length === 0 && (
                                        <p className="text-yellow-400 text-sm mt-2 text-center">No se encontraron clientes con ese criterio.</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-300 mb-1">Fecha de Préstamo</label>
                                    <input type="date" id="fecha" value={loanDate} onChange={(e) => setLoanDate(e.target.value)} className="bg-gray-700 w-full rounded-md border-gray-600 text-white shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3" />
                                </div>
                                <div>
                                    <label htmlFor="autorizadoPor" className="block text-sm font-medium text-gray-300 mb-1">Autorizado Por</label>
                                    <input type="text" id="autorizadoPor" value={autorizadoPor} onChange={(e) => setAutorizadoPor(e.target.value)} className="bg-gray-700 w-full rounded-md border-gray-600 text-white shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3" />
                                </div>
                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                           </div>
                       </div>
                       <div className="flex justify-between items-center bg-gray-800/50 p-5 mt-2 rounded-b-2xl">
                           <button type="button" onClick={() => selectedClientId && handlePrintPrestamo({ car: selectedCar, client: clients.find(c => c.id === parseInt(selectedClientId))!, loanDate, status: PrestamoStatus.ACTIVA, id: 0})} disabled={!selectedClientId} title="Imprimir un comprobante borrador con los datos seleccionados" className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed">
                               <PrintIcon className="h-5 w-5"/> Imprimir
                           </button>
                           <div className="flex gap-4">
                                <button type="button" onClick={handleCloseModal} title="Cancelar la creación de la prestación" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
                                <button type="button" onClick={handleSubmitLoan} title="Confirmar y registrar el nuevo préstamo" className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg">Confirmar</button>
                           </div>
                       </div>
                    </div>
                </div>
            )}
            
            {modalDetails && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-700 transform transition-all">
                       <div className="flex justify-between items-center p-5 border-b border-gray-700">
                           <h3 className="text-xl font-semibold text-white">Detalles del Préstamo</h3>
                           <button onClick={() => setModalDetails(null)} className="text-gray-400 hover:text-white" aria-label="Cerrar" title="Cerrar ventana"><XIcon className="h-6 w-6"/></button>
                       </div>
                       <div className="p-6 max-h-[70vh] overflow-y-auto text-gray-200">
                           <PrestamoDetailsNaturalLanguage prestamo={modalDetails} />
                       </div>
                       <div className="flex justify-end p-4 border-t border-gray-700">
                            <button type="button" onClick={() => setModalDetails(null)} title="Cerrar ventana" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cerrar</button>
                       </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrestamosManagement;