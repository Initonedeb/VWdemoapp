import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:3001/api';

import { Car, CarStatus, Sector, Category, Client, CivilStatus, Prestacion, PrestacionStatus, FuelLevel } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PrintIcon from './icons/PrintIcon';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import DownloadIcon from './icons/DownloadIcon';
import InfoIcon from './icons/InfoIcon';
import TrashIcon from './icons/TrashIcon';
import SearchIcon from './icons/SearchIcon';
import ImageIcon from './icons/ImageIcon';
import { UserRole } from '../types';
import { Scanner } from '@yudiel/react-qr-scanner';
import QrCodeIcon from './icons/QrCodeIcon';

interface PrestacionesManagementProps {
  onBack: () => void;
  userRole: UserRole;
}

const PairingModal: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=250x250&bgcolor=ffffff`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 text-center">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-blue-900">Escanear con Celular</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-blue-800">
                        <XIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div className="p-8">
                    <h4 className="text-gray-800 font-semibold text-lg mb-2">¡Conecte su celular!</h4>
                    <p className="text-gray-600 mb-4">1. Abra la cámara de su celular y apunte a este código QR.</p>
                    <img src={qrCodeUrl} alt="Pairing QR Code" className="w-64 h-64 mx-auto border-4 border-white rounded-lg shadow-md"/>
                    <p className="text-gray-600 mt-4">2. Siga el enlace para abrir el escaner en su celular y apunte al QR del vehículo.</p>
                    <p className="text-blue-900 font-bold mt-6 animate-pulse">Esperando escaneo...</p>
                </div>
            </div>
        </div>
    );
};

const PrestacionFicha: React.FC<{ prestacion: Prestacion }> = ({ prestacion }) => {
    const { car, client, loanDate, combustible_salida, combustible_regreso, km_salida, km_regreso } = prestacion;
    const fullVehicleInfo = `${car.marca} ${car.modelo} ${car.version}, Año ${car.ano}, Patente ${car.patente}, Chasis ${car.chasis}, Motor ${car.motor}`;
    
    return (
        <div className="bg-white text-blue-900 p-8 font-serif" style={{ width: '800px' }}>
            <p className="text-right mb-8">San Miguel de Tucumán, {new Date(loanDate).toLocaleDateString()}.</p>
            <h2 className="text-xl font-bold text-center uppercase mb-6">Entrega de vehiculo a prestamo</h2>
            <p className="text-justify leading-relaxed mb-6">
                Por la presente se deja constancia que el <strong>{client.nombreCompleto}</strong>, 
                DNI <strong>{client.dni}</strong>, con domicilio en <strong>{client.direccion}</strong>, 
                retira de Leon Alperovich de Tucuman S.A. una unidad con las siguientes caracteristicas: <strong>{fullVehicleInfo}</strong>.
                El vehículo se entrega con <strong>{km_salida ? km_salida.toLocaleString() : 'N/A'} KM</strong> y el siguiente nivel de combustible: <strong>{combustible_salida || 'No especificado'}</strong>.
                Se hace entrega de la tarjeta verde correspondiente, constancia de cobertura de seguro por 30 dias y un juego de llaves.
                El sr. <strong>{client.nombreCompleto}</strong> (DNI: <strong>{client.dni}</strong>) responde economicamente por cualquier daño o faltante en la unidad.
                Dicha unidad debera reintegrarse a la firma Leon Alperovich de Tucuman S.A. en calle Adolfo de la Vega 379 de San Miguel de Tucuman,
                en el momento que se la solicite sin necesidad de manifestar motivo alguno, en las mismas condiciones mecanicas, tecnicas y de funcionamiento en que se entrega en este acto.
            </p>
            {(combustible_regreso || km_regreso) && (
                <p className="text-justify leading-relaxed mb-6">
                    El vehículo se devuelve con <strong>{km_regreso ? km_regreso.toLocaleString() : 'N/A'} KM</strong>, nivel de combustible: <strong>{combustible_regreso || 'No especificado'}</strong>.
                    Rueda de auxilio: <strong>{prestacion.rueda_auxilio ? 'Sí' : 'No'}</strong>.
                </p>
            )}
            {prestacion.observaciones_devolucion && (
                <div className="text-justify leading-relaxed mb-6">
                    <h4 className="font-bold">Observaciones de Devolución:</h4>
                    <p>{prestacion.observaciones_devolucion}</p>
                </div>
            )}
            <div className="flex justify-around mt-20 pt-10">
                <div className="text-center">
                    <p className="border-t border-gray-400 pt-2 px-12">Firma del Cliente</p>
                </div>
                <div className="text-center">
                    <p className="border-t border-gray-400 pt-2 px-12">Firma de la Empresa</p>
                </div>
            </div>
        </div>
    );
};


const PrestacionesManagement: React.FC<PrestacionesManagementProps> = ({ onBack, userRole }) => {
    const [cars, setCars] = useState<Car[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [prestaciones, setPrestaciones] = useState<Prestacion[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalDetails, setModalDetails] = useState<Prestacion | null>(null);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [loanDate, setLoanDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [gestionadoPor, setGestionadoPor] = useState('');
    const [autorizadoPor, setAutorizadoPor] = useState('');
    const [combustibleSalida, setCombustibleSalida] = useState<FuelLevel>(FuelLevel.MEDIO);
    const [kmSalida, setKmSalida] = useState<number | string>('');
    const [error, setError] = useState<string>('');
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showQrScanner, setShowQrScanner] = useState(false);
    const [qrScannerMode, setQrScannerMode] = useState<'start' | 'finish'>('start');
    const [showPairingModal, setShowPairingModal] = useState(false);
    const [pairingUrl, setPairingUrl] = useState('');
    const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);

    // Report state
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    const [reportSelectedCarId, setReportSelectedCarId] = useState('all');
    const [reportSelectedClientId, setReportSelectedClientId] = useState('all');
    const [generatedReport, setGeneratedReport] = useState<{ stats: any; data: Prestacion[] } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prestacionesRes, carsRes, clientsRes] = await Promise.all([
                    fetch(`${API_URL}/prestaciones`),
                    fetch(`${API_URL}/cars`),
                    fetch(`${API_URL}/clients`)
                ]);

                if (!prestacionesRes.ok || !carsRes.ok || !clientsRes.ok) {
                    throw new Error('Error al cargar los datos iniciales');
                }

                const prestacionesData = await prestacionesRes.json();
                const carsData = await carsRes.json();
                const clientsData = await clientsRes.json();

                setPrestaciones(prestacionesData);
                setCars(carsData);
                setClients(clientsData);

            } catch (error) {
                console.error(error);
                alert('No se pudo conectar con el servidor para obtener los datos.');
            }
        };
        fetchData();
    }, []);

    // Effect for polling scan session
    useEffect(() => {
        if (pollingIntervalId) {
            return () => {
                console.log('Cleaning up polling interval.');
                clearInterval(pollingIntervalId);
                setPollingIntervalId(null);
            };
        }
    }, [pollingIntervalId]);

    const filteredPrestaciones = useMemo(() => {
        if (!searchTerm) return prestaciones;
        const lowercasedFilter = searchTerm.toLowerCase();
        return prestaciones.filter(p =>
            p.car.modelo.toLowerCase().includes(lowercasedFilter) ||
            p.car.patente.toLowerCase().replace(/\s+/g, '').includes(lowercasedFilter.replace(/\s+/g, '')) ||
            p.client.nombreCompleto.toLowerCase().includes(lowercasedFilter) ||
            p.client.dni.replace(/\./g, '').includes(lowercasedFilter.replace(/\./g, ''))
        );
    }, [prestaciones, searchTerm]);

    const availableDemos = useMemo(() => {
        return cars.filter(car => car.categoria === Category.DEMO && car.estado === CarStatus.DISPONIBLE);
    }, [cars]);

    const filteredAvailableDemos = useMemo(() => {
        if (!searchTerm) return availableDemos;
        const lowercasedFilter = searchTerm.toLowerCase();
        return availableDemos.filter(car =>
            car.marca.toLowerCase().includes(lowercasedFilter) ||
            car.modelo.toLowerCase().includes(lowercasedFilter) ||
            car.version.toLowerCase().includes(lowercasedFilter) ||
            car.patente.toLowerCase().replace(/\s+/g, '').includes(lowercasedFilter.replace(/\s+/g, ''))
        );
    }, [availableDemos, searchTerm]);


    const filteredClients = useMemo(() => {
        if (!clientSearchTerm) return clients;
        return clients.filter(client =>
            client.nombreCompleto.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
            client.dni.replace(/\./g, '').includes(clientSearchTerm.replace(/\./g, ''))
        );
    }, [clients, clientSearchTerm]);
    
    const handleOpenModal = (car: Car) => {
        setSelectedCar(car);
        setSelectedClientId('');
        setLoanDate(new Date().toISOString().split('T')[0]);
        setGestionadoPor('');
        setAutorizadoPor('');
        setCombustibleSalida(FuelLevel.MEDIO);
        setKmSalida(car.kilometraje || '');
        setError('');
        setClientSearchTerm('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCar(null);
    };

    const handleScanWithPhone = async () => {
        const { value: ipAddress } = await Swal.fire({
            title: 'Ingrese la IP de esta computadora',
            input: 'text',
            inputLabel: 'Su celular debe estar en la misma red Wi-Fi',
            inputPlaceholder: 'Ej: 192.168.1.100',
            showCancelButton: true,
            confirmButtonText: 'Generar QR de Conexión',
            inputValidator: (value) => {
                if (!value) {
                    return '¡Necesita ingresar una dirección IP!';
                }
                const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
                if (!ipRegex.test(value)) {
                    return 'Por favor, ingrese una dirección IP válida (ej: 192.168.1.100)';
                }
            }
        });

        if (!ipAddress) return;

        try {
            const response = await fetch(`${API_URL}/scan-sessions`, { method: 'POST' });
            if (!response.ok) throw new Error('No se pudo crear la sesión de escaneo.');
            
            const { sessionId } = await response.json();
            const url = `http://${ipAddress}:5173/scan-phone.html?session=${sessionId}`;
            setPairingUrl(url);
            setShowPairingModal(true);

            // Start polling
            const intervalId = setInterval(async () => {
                try {
                    const pollResponse = await fetch(`${API_URL}/scan-sessions/${sessionId}`);
                    if (pollResponse.status === 200) {
                        const { vehicleId } = await pollResponse.json();
                        clearInterval(intervalId);
                        setShowPairingModal(false);
                        
                        const car = cars.find(c => c.id === vehicleId);
                        if (car) {
                            if (car.estado === CarStatus.DISPONIBLE) {
                                handleOpenModal(car);
                                Swal.fire('¡Vehículo Recibido!', `Iniciando préstamo para ${car.marca} ${car.modelo}.`, 'success');
                            } else {
                                Swal.fire('Vehículo No Disponible', `El vehículo ya se encuentra "${car.estado}".`, 'warning');
                            }
                        } else {
                            Swal.fire('Error', 'El vehículo escaneado no se encuentra en el sistema.', 'error');
                        }
                    } else if (pollResponse.status !== 202 && pollResponse.status !== 404) {
                        // If status is not pending or not found, there might be an error
                        clearInterval(intervalId);
                        setShowPairingModal(false);
                        Swal.fire('Error de Conexión', 'Se perdió la conexión con el servidor de escaneo.', 'error');
                    }
                    // If 202 or 404, continue polling
                } catch (err) {
                    console.error('Polling error:', err);
                    clearInterval(intervalId);
                    setShowPairingModal(false);
                }
            }, 3000);
            setPollingIntervalId(intervalId);

        } catch (err) {
            Swal.fire('Error', 'No se pudo iniciar la sesión de escaneo con el celular.', 'error');
        }
    };

    const handleSubmitLoan = async () => {
        if (!selectedCar || !selectedClientId) {
            setError('Debe seleccionar un vehículo y un cliente.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/prestaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carId: selectedCar.id,
                    clientId: parseInt(selectedClientId),
                    loanDate,
                    gestionadoPor,
                    autorizadoPor,
                    combustible_salida: combustibleSalida,
                    km_salida: kmSalida,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el préstamo');
            }

            const newPrestacion = await response.json();
            setPrestaciones(prev => [newPrestacion, ...prev]);

            // Actualizar el estado del coche en la lista local
            setCars(prevCars => prevCars.map(car => 
                car.id === selectedCar.id ? { ...car, estado: CarStatus.PRESTADO } : car
            ));

            handleCloseModal();

        } catch (err) {
            console.error(err);
            alert(`Error al generar el préstamo: ${err.message}`);
        }
    };

    const handleFinishLoan = async (prestacionId: number) => {
    // 1. Pedir fotos de devolución
    const { value: files } = await Swal.fire({
        title: 'Adjuntar Fotos de Devolución',
        html: `
            <p class="text-gray-600 mb-4">Por favor, adjunte 2 fotos del estado del vehículo al momento de la devolución.</p>
            <input type="file" id="swal-file1" class="swal2-file" accept="image/*" multiple>
        `,
        showCancelButton: true,
        confirmButtonText: 'Siguiente',
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: () => {
            const fileInput = document.getElementById('swal-file1') as HTMLInputElement;
            if (!fileInput.files || fileInput.files.length !== 2) {
                Swal.showValidationMessage('Debe seleccionar exactamente 2 fotos.');
                return false;
            }
            return Array.from(fileInput.files);
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    if (!files) return; // El usuario canceló

    // 2. Pedir nivel de combustible de regreso
    const { value: combustibleRegreso } = await Swal.fire({
        title: 'Nivel de Combustible de Regreso',
        input: 'select',
        inputOptions: {
            'reserva': 'Reserva',
            '1/4 tanque': '1/4 tanque',
            '1/2 tanque': '1/2 tanque',
            '3/4 tanque': '3/4 tanque',
            'lleno': 'Lleno'
        },
        inputPlaceholder: 'Seleccione el nivel de combustible',
        showCancelButton: true,
        confirmButtonText: 'Siguiente',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Debe seleccionar un nivel de combustible';
            }
        }
    });

    if (!combustibleRegreso) return; // El usuario canceló

    // 3. Pedir KM de regreso
    const { value: kmRegreso } = await Swal.fire({
        title: 'Kilometraje de Regreso',
        input: 'number',
        inputLabel: 'Ingrese el kilometraje actual del vehículo',
        inputPlaceholder: 'Ej: 15000',
        showCancelButton: true,
        confirmButtonText: 'Siguiente',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value || parseInt(value) <= 0) {
                return 'Debe ingresar un kilometraje válido';
            }
        }
    });

    if (!kmRegreso) return; // El usuario canceló

    // 4. Pedir rueda de auxilio
    const { value: ruedaAuxilio } = await Swal.fire({
        title: 'Rueda de Auxilio',
        text: '¿Se encuentra la rueda de auxilio en el vehículo?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        reverseButtons: true
    });

    // 5. Pedir observaciones
    const { value: observaciones } = await Swal.fire({
        title: 'Observaciones de Devolución',
        input: 'textarea',
        inputLabel: 'Ingrese cualquier observación sobre el estado del vehículo.',
        inputPlaceholder: 'Ej: El vehículo tiene un rayón en la puerta delantera derecha...',
        showCancelButton: true,
        confirmButtonText: 'Siguiente',
        cancelButtonText: 'Cancelar',
    });

    try {
        // 2. Subir las fotos de devolución
        const photoFormData = new FormData();
        files.forEach(file => {
            photoFormData.append('fotosDevolucion', file);
        });

        const photoResponse = await fetch(`${API_URL}/prestaciones/${prestacionId}/photos`, {
            method: 'POST',
            body: photoFormData,
        });

        if (!photoResponse.ok) {
            const errorData = await photoResponse.json();
            throw new Error(errorData.message || 'Error al subir las fotos de devolución');
        }

        // 3. Preguntar por la ficha firmada
        const { value: signedFileResult, isDenied } = await Swal.fire({
            title: 'Ficha de Préstamo Firmada',
            html: `
                <p class="text-gray-600 mb-4">¿Desea adjuntar la ficha de préstamo firmada? (Opcional)</p>
                <input type="file" id="swal-file-signed" class="swal2-file" accept=".pdf,.jpg,.jpeg,.png">
            `,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Adjuntar y Finalizar',
            denyButtonText: 'Finalizar sin Adjuntar',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const fileInput = document.getElementById('swal-file-signed') as HTMLInputElement;
                return fileInput.files?.[0] || null;
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        // Si el usuario cancela la segunda alerta, no hacemos nada.
        if (isDenied === undefined && signedFileResult === undefined) return;

        const finishFormData = new FormData();
        finishFormData.append('combustible_regreso', combustibleRegreso);
        finishFormData.append('km_regreso', kmRegreso);
        finishFormData.append('rueda_auxilio', ruedaAuxilio === 'Sí' ? 'true' : 'false');
        if (observaciones) {
            finishFormData.append('observaciones_devolucion', observaciones);
        }
        if (signedFileResult) { // El usuario adjuntó un archivo
            finishFormData.append('fichaFirmada', signedFileResult);
        }

        const finishResponse = await fetch(`${API_URL}/prestaciones/${prestacionId}/finish`, {
            method: 'PUT',
            body: finishFormData, // Enviamos el FormData (puede estar vacío)
        });

        if (!finishResponse.ok) {
            const errorText = await finishResponse.text();
            throw new Error(errorText || 'Error al finalizar el préstamo.');
        }

        const updatedPrestacion = await finishResponse.json();
        updatePrestacionState(updatedPrestacion);

        const successMessage = signedFileResult
            ? '¡Devolución Completa!'
            : '¡Devolución Registrada!';
        const successSubMessage = signedFileResult
            ? 'El préstamo fue finalizado y la ficha firmada se ha guardado.'
            : 'El préstamo ha sido marcado como finalizado.';

        Swal.fire(successMessage, successSubMessage, 'success');

    } catch (err) {
        console.error('Error en handleFinishLoan:', err);
        Swal.fire('Error', `Ocurrió un error: ${err.message}`, 'error');
    }
};

    const updatePrestacionState = (updatedPrestacion: Prestacion) => {
    setPrestaciones(prev => prev.map(p => p.id === updatedPrestacion.id ? updatedPrestacion : p));
    setCars(prevCars => prevCars.map(car => 
        car.id === updatedPrestacion.car.id ? { ...car, estado: CarStatus.DISPONIBLE } : car
    ));
};
        const handleDeletePrestacion = async (id: number) => {
        if (!window.confirm('¿Desea eliminar este registro del historial? Esta acción no se puede deshacer.')) return;

        try {
            const response = await fetch(`${API_URL}/prestaciones/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el préstamo');
            }

            // Actualizar la lista de préstamos
            setPrestaciones(prev => prev.filter(p => p.id !== id));

            // Si el préstamo eliminado estaba activo, actualizar el estado del coche a Disponible
            // Necesitamos el carId del préstamo eliminado para esto
            const deletedPrestacion = prestaciones.find(p => p.id === id);
            if (deletedPrestacion && deletedPrestacion.status === PrestacionStatus.ACTIVA) {
                setCars(prevCars => prevCars.map(car => 
                    car.id === deletedPrestacion.car.id ? { ...car, estado: CarStatus.DISPONIBLE } : car
                ));
            }

        } catch (err) {
            console.error(err);
            alert(`Error al eliminar el préstamo: ${err.message}`);
        }
    };
    
    const getPrestacionFichaHTML = (p: Prestacion): string => {
        const { car, client, loanDate } = p;
        const fullVehicleInfo = `${car.marca} ${car.modelo} ${car.version}, Año ${car.ano}, Patente ${car.patente}, Chasis ${car.chasis}, Motor ${car.motor}`;
        
        return `
            <div style="font-family: serif; color: #1e3a8a; padding: 2rem; width: 800px;">
                <p style="text-align: right; margin-bottom: 2rem;">San Miguel de Tucumán, ${new Date(loanDate).toLocaleDateString()}.</p>
                <h2 style="font-size: 1.25rem; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 1.5rem;">Entrega de vehiculo a prestamo</h2>
                <p style="text-align: justify; line-height: 1.625; margin-bottom: 1.5rem;">
                    Por la presente se deja constancia que el <strong>${client.nombreCompleto}</strong>, 
                    DNI <strong>${client.dni}</strong>, con domicilio en <strong>${client.direccion}</strong>, 
                    retira de Leon Alperovich de Tucuman S.A. una unidad con las siguientes caracteristicas: <strong>{fullVehicleInfo}</strong>.
                    Se hace entrega de la tarjeta verde correspondiente, constancia de cobertura de seguro por 30 dias y un juego de llaves.
                    El sr. <strong>${client.nombreCompleto}</strong> (DNI: <strong>${client.dni}</strong>) responde economicamente por cualquier daño o faltante en la unidad.
                    Dicha unidad debera reintegrarse a la firma Leon Alperovich de Tucuman S.A. en calle Adolfo de la Vega 379 de San Miguel de Tucuman,
                    en el momento que se la solicite sin necesidad de manifestar motivo alguno, en las mismas condiciones mecanicas, tecnicas y de funcionamiento en que se entrega en este acto.
                </p>
                <div class="flex justify-around mt-20 pt-10">
                    <div class="text-center">
                        <p class="border-t border-gray-400 pt-2 px-12">Firma del Cliente</p>
                    </div>
                    <div class="text-center">
                        <p class="border-t border-gray-400 pt-2 px-12">Firma de la Empresa</p>
                    </div>
                </div>
            </div>
        `;
    };

    const handlePrintPrestacion = (p: Prestacion) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Comprobante de Préstamo - ${p.car.patente}</title></head>
                    <body style="margin: 0;">
                        ${getPrestacionFichaHTML(p)}
                        <script>setTimeout(() => { window.print(); window.close(); }, 250);</script>
                    </body>
                </html>`);
            printWindow.document.close();
        }
    };
    
    const handleDownloadPrestacion = (prestacion: Prestacion) => {
        const fichaElement = document.createElement('div');
        fichaElement.style.position = 'absolute';
        fichaElement.style.left = '-9999px';
        document.body.appendChild(fichaElement);

        const root = createRoot(fichaElement);
        root.render(<PrestacionFicha prestacion={prestacion} />);

        setTimeout(() => {
            html2canvas(fichaElement.firstChild as HTMLElement, { 
                scale: 2, 
                useCORS: true, 
                logging: false 
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const ratio = canvas.width / canvas.height;
                
                let newWidth = pdfWidth - 20; // Margen
                let newHeight = newWidth / ratio;

                if (newHeight > pdfHeight - 20) {
                    newHeight = pdfHeight - 20;
                    newWidth = newHeight * ratio;
                }
                
                const xOffset = (pdfWidth - newWidth) / 2;
                const yOffset = (pdfHeight - newHeight) / 2;

                pdf.addImage(imgData, 'PNG', xOffset, yOffset, newWidth, newHeight);
                pdf.save(`prestamo_${prestacion.car.patente}_${prestacion.client.dni}.pdf`);

                // Cleanup
                root.unmount();
                document.body.removeChild(fichaElement);
            });
        }, 250);
    };

    const handleGenerateReport = () => {
        let filteredData = [...prestaciones];

        // Filter by date
        if (reportStartDate && reportEndDate) {
            const startDate = new Date(reportStartDate);
            const endDate = new Date(reportEndDate);
            filteredData = filteredData.filter(p => {
                const loanDate = new Date(p.loanDate);
                return loanDate >= startDate && loanDate <= endDate;
            });
        }

        // Filter by car
        if (reportSelectedCarId !== 'all') {
            filteredData = filteredData.filter(p => p.car.id === parseInt(reportSelectedCarId));
        }

        // Filter by client
        if (reportSelectedClientId !== 'all') {
            filteredData = filteredData.filter(p => p.client.id === parseInt(reportSelectedClientId));
        }

        // Calculate stats
        const totalPrestamos = filteredData.length;
        const activas = filteredData.filter(p => p.status === PrestacionStatus.ACTIVA).length;
        const finalizadas = totalPrestamos - activas;

        const prestamosPorVehiculo = filteredData.reduce((acc, p) => {
            const key = `${p.car.marca} ${p.car.modelo} (${p.car.patente})`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const prestamosPorCliente = filteredData.reduce((acc, p) => {
            const key = `${p.client.nombreCompleto} (${p.client.dni})`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        setGeneratedReport({
            data: filteredData,
            stats: {
                totalPrestamos,
                activas,
                finalizadas,
                prestamosPorVehiculo,
                prestamosPorCliente,
                filters: {
                    startDate: reportStartDate,
                    endDate: reportEndDate,
                    car: reportSelectedCarId === 'all' ? 'Todos' : cars.find(c => c.id === parseInt(reportSelectedCarId))?.patente,
                    client: reportSelectedClientId === 'all' ? 'Todos' : clients.find(c => c.id === parseInt(reportSelectedClientId))?.nombreCompleto,
                }
            }
        });

        setShowReportModal(false);
    };

    const handleDownloadExcel = () => {
        if (!generatedReport) return;

        const reportData = generatedReport.data.map(p => ({
            'ID Prestamo': p.id,
            'Vehiculo': `${p.car.marca} ${p.car.modelo}`,
            'Patente': p.car.patente,
            'Cliente': p.client.nombreCompleto,
            'DNI Cliente': p.client.dni,
            'Fecha Prestamo': new Date(p.loanDate).toLocaleDateString(),
            'Fecha Devolucion': p.returnDate ? new Date(p.returnDate).toLocaleDateString() : 'N/A',
            'Estado': p.status,
            'Gestionado Por': p.gestionadoPor,
            'Autorizado Por': p.autorizadoPor,
        }));

        const stats = generatedReport.stats;
        const summaryData = [
            { 'Metrica': 'Filtros Aplicados', 'Valor': '' },
            { 'Metrica': '  Fecha Desde', 'Valor': stats.filters.startDate || 'N/A' },
            { 'Metrica': '  Fecha Hasta', 'Valor': stats.filters.endDate || 'N/A' },
            { 'Metrica': '  Vehículo', 'Valor': stats.filters.car },
            { 'Metrica': '  Cliente', 'Valor': stats.filters.client },
            { 'Metrica': '', 'Valor': '' },
            { 'Metrica': 'Resumen General', 'Valor': '' },
            { 'Metrica': '  Total de Préstamos', 'Valor': stats.totalPrestamos },
            { 'Metrica': '  Préstamos Activos', 'Valor': stats.activas },
            { 'Metrica': '  Préstamos Finalizados', 'Valor': stats.finalizadas },
            { 'Metrica': '', 'Valor': '' },
            { 'Metrica': 'Préstamos por Vehículo', 'Valor': '' },
            ...Object.entries(stats.prestamosPorVehiculo).map(([key, value]) => ({ 'Metrica': `  ${key}`, 'Valor': value })),
            { 'Metrica': '', 'Valor': '' },
            { 'Metrica': 'Préstamos por Cliente', 'Valor': '' },
            ...Object.entries(stats.prestamosPorCliente).map(([key, value]) => ({ 'Metrica': `  ${key}`, 'Valor': value })),
        ];


        const wsReport = XLSX.utils.json_to_sheet(reportData);
        const wsSummary = XLSX.utils.json_to_sheet(summaryData, { skipHeader: true });

        // Adjust column widths
        wsReport['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];
        wsSummary['!cols'] = [{ wch: 40 }, { wch: 15 }];


        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
        XLSX.utils.book_append_sheet(wb, wsReport, 'Datos');

        XLSX.writeFile(wb, 'Reporte_Prestamos.xlsx');
    };

    const getStatusColor = (status: PrestacionStatus) => {
        switch (status) {
            case PrestacionStatus.ACTIVA: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case PrestacionStatus.FINALIZADA: return 'bg-gray-100 text-gray-800 border-gray-200';
            case PrestacionStatus.FIRMADA_Y_FINALIZADA: return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }
    
    const getRowColor = (status: PrestacionStatus) => {
        switch (status) {
            case PrestacionStatus.ACTIVA: return 'bg-yellow-50 hover:bg-yellow-100';
            case PrestacionStatus.FINALIZADA: return 'bg-gray-50 hover:bg-gray-100';
            case PrestacionStatus.FIRMADA_Y_FINALIZADA: return 'bg-green-50 hover:bg-green-100';
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

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-blue-900">Gestión de Préstamos</h2>
                    <p className="text-gray-600 mt-1">Busque en el historial o genere nuevos préstamos desde la lista de demos disponibles.</p>
                </div>
                <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar en Demos Disponibles o Historial (por vehículo o cliente)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 pl-10 pr-4"
                    />
                </div>

                <div className="space-y-12">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-blue-900">Demos Disponibles para Prestar</h2>
                                <p className="text-gray-600 mt-1">Seleccione un vehículo para generar un nuevo préstamo o escanee su código QR.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                <button
                                    onClick={handleScanWithPhone}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105"
                                    title="Iniciar el escaneo con un celular externo"
                                >
                                    <QrCodeIcon className="h-5 w-5" />
                                    Escanear con Celular
                                </button>
                                <button
                                    onClick={() => { setQrScannerMode('start'); setShowQrScanner(true); }}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105"
                                    title="Escanear el código QR de un vehículo para iniciar un préstamo"
                                >
                                    <QrCodeIcon className="h-5 w-5" />
                                    Escanear QR
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-900 sm:pl-6">Vehículo</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden sm:table-cell">Patente</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredAvailableDemos.map((car) => (
                                        <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="font-medium text-blue-900">{car.marca} {car.modelo}</div>
                                                <div className="text-gray-500">{car.version}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 hidden sm:table-cell font-mono">{car.patente}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button 
                                                    onClick={() => handleOpenModal(car)}
                                                    title="Iniciar el proceso de préstamo para este vehículo"
                                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105 text-xs"
                                                >
                                                    <PlusIcon className="h-4 w-4"/>
                                                    Generar Préstamo
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredAvailableDemos.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>{searchTerm ? 'No se encontraron demos disponibles con ese criterio.' : 'No hay vehículos de demostración disponibles en este momento.'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-blue-900">Historial de Préstamos</h2>
                                <p className="text-gray-600 mt-1">Listado de préstamos activos y finalizados.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setQrScannerMode('finish'); setShowQrScanner(true); }}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                                    title="Escanear el código QR de un vehículo para finalizar un préstamo activo"
                                >
                                    <QrCodeIcon className="h-5 w-5" />
                                    Finalizar con QR
                                </button>
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                                >
                                    Generar Reporte
                                </button>
                            </div>
                        </div>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-900 sm:pl-6">Vehículo</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900 hidden md:table-cell">Cliente</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Fechas</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Combustible</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Kilometraje</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Estado</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredPrestaciones.map((p) => (
                                        <tr key={p.id} className={`${getRowColor(p.status)} transition-colors`}>
                                            <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="font-medium text-blue-900">{p.car.marca} {p.car.modelo}</div>
                                                <div className="text-gray-500 font-mono">{p.car.patente}</div>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-700 hidden md:table-cell">
                                                <div>{p.client.nombreCompleto}</div>
                                                <div className="text-gray-500 font-mono">{p.client.dni}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                                <div>P: {new Date(p.loanDate).toLocaleDateString()}</div>
                                                <div className="text-gray-500">D: {p.returnDate ? new Date(p.returnDate).toLocaleDateString() : '---'}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                                <div>S: {p.combustible_salida || 'N/A'}</div>
                                                <div className="text-gray-500">R: {p.combustible_regreso || '---'}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                                <div>S: {p.km_salida ? p.km_salida.toLocaleString() : 'N/A'}</div>
                                                <div className="text-gray-500">R: {p.km_regreso ? p.km_regreso.toLocaleString() : '---'}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium">
                                                <div className="flex items-center gap-x-1">
                                                    {p.status === PrestacionStatus.ACTIVA && (
                                                        <button onClick={() => handleFinishLoan(p.id)} className="text-green-500 hover:text-green-600 p-2 rounded-md transition-colors" title="Registrar Devolución"><CheckCircleIcon className="h-5 w-5"/></button>
                                                    )}
                                                    {p.fotosDevolucion && p.fotosDevolucion.length > 0 && (
                                                        <button onClick={() => Swal.fire({
                                                            title: 'Fotos de Devolución',
                                                            html: p.fotosDevolucion.map(foto => `<img src="http://localhost:3001/${foto.replace(/\\/g, '/')}" class="swal2-image" alt="Foto de devolución">`).join(''),
                                                            showCloseButton: true,
                                                        })} className="text-blue-500 hover:text-blue-600 p-2 rounded-md transition-colors" title="Ver Fotos de Devolución"><ImageIcon className="h-5 w-5"/></button>
                                                    )}
                                                    <button onClick={() => setModalDetails(p)} className="text-gray-500 hover:text-blue-800 p-2 rounded-md transition-colors" title="Ver Detalles"><InfoIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => handlePrintPrestacion(p)} className="text-gray-500 hover:text-blue-800 p-2 rounded-md transition-colors" title="Imprimir"><PrintIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => handleDownloadPrestacion(p)} className="text-gray-500 hover:text-blue-800 p-2 rounded-md transition-colors" title="Descargar"><DownloadIcon className="h-5 w-5"/></button>
                                                    {userRole === UserRole.ADMIN && (
                                                        <button onClick={() => handleDeletePrestacion(p.id)} className="text-red-500 hover:text-red-400 p-2 rounded-md transition-colors" title="Eliminar"><TrashIcon className="h-5 w-5"/></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredPrestaciones.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>{searchTerm ? 'No se encontraron préstamos con ese criterio de búsqueda.' : 'No hay préstamos registrados.'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {showModal && selectedCar && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 transform transition-all">
                       <div className="flex justify-between items-center p-5 border-b border-gray-200">
                           <h3 className="text-xl font-semibold text-blue-900">Generar Nuevo Préstamo</h3>
                           <button onClick={handleCloseModal} className="text-gray-500 hover:text-blue-800" aria-label="Cerrar" title="Cerrar ventana">
                               <XIcon className="h-6 w-6"/>
                           </button>
                       </div>
                       <div className="p-6">
                           <div className="bg-gray-50 p-4 rounded-lg mb-6">
                               <h4 className="font-bold text-lg text-blue-900">{selectedCar.marca} {selectedCar.modelo}</h4>
                               <p className="text-gray-700">{selectedCar.version} - Año {selectedCar.ano}</p>
                               <p className="text-gray-600 font-mono mt-1">Patente: {selectedCar.patente}</p>
                           </div>
                           <div className="space-y-4">
                                <div>
                                    <label htmlFor="cliente-search" className="block text-sm font-medium text-gray-700 mb-1">Buscar Cliente (por nombre o DNI)</label>
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
                                            className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 pl-10 pr-4"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">Asociar a Cliente</label>
                                    <select 
                                        id="cliente" 
                                        value={selectedClientId} 
                                        onChange={(e) => { setSelectedClientId(e.target.value); setError(''); }}
                                        className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                                        size={filteredClients.length > 1 && filteredClients.length < 6 ? filteredClients.length + 1 : 5}
                                    >
                                        <option value="" disabled>-- Seleccione un cliente --</option>
                                        {filteredClients.map(client => (
                                            <option key={client.id} value={client.id}>{client.nombreCompleto} (DNI: {client.dni})</option>
                                        ))}
                                    </select>
                                    {filteredClients.length === 0 && (
                                        <p className="text-yellow-500 text-sm mt-2 text-center">No se encontraron clientes con ese criterio.</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Préstamo</label>
                                        <input type="date" id="fecha" value={loanDate} onChange={(e) => setLoanDate(e.target.value)} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3" />
                                    </div>
                                    <div>
                                        <label htmlFor="combustibleSalida" className="block text-sm font-medium text-gray-700 mb-1">Combustible Salida</label>
                                        <select id="combustibleSalida" value={combustibleSalida} onChange={(e) => setCombustibleSalida(e.target.value as FuelLevel)} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3">
                                            {Object.values(FuelLevel).map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="kmSalida" className="block text-sm font-medium text-gray-700 mb-1">KM Salida</label>
                                        <input type="number" id="kmSalida" value={kmSalida} onChange={(e) => setKmSalida(e.target.value)} placeholder="Kilometraje actual" className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="gestionadoPor" className="block text-sm font-medium text-gray-700 mb-1">Gestionado por</label>
                                        <input type="text" id="gestionadoPor" value={gestionadoPor} onChange={(e) => setGestionadoPor(e.target.value)} placeholder="Nombre del gestor" className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3" />
                                    </div>
                                    <div>
                                        <label htmlFor="autorizadoPor" className="block text-sm font-medium text-gray-700 mb-1">Autorizado por</label>
                                        <input type="text" id="autorizadoPor" value={autorizadoPor} onChange={(e) => setAutorizadoPor(e.target.value)} placeholder="Nombre del autorizador" className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3" />
                                    </div>
                                </div>
                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                           </div>
                       </div>
                       <div className="flex justify-between items-center bg-gray-100 p-5 mt-2 rounded-b-2xl border-t border-gray-200">
                           <button type="button" onClick={() => selectedClientId && handlePrintPrestacion({ car: selectedCar, client: clients.find(c => c.id === parseInt(selectedClientId))!, loanDate, gestionadoPor, autorizadoPor, status: PrestacionStatus.ACTIVA, id: 0})} disabled={!selectedClientId} title="Imprimir un comprobante borrador con los datos seleccionados" className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                               <PrintIcon className="h-5 w-5"/> Imprimir
                           </button>
                           <div className="flex gap-4">
                                <button type="button" onClick={handleCloseModal} title="Cancelar la creación del préstamo" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
                                <button type="button" onClick={handleSubmitLoan} title="Confirmar y registrar el nuevo préstamo" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Confirmar</button>
                           </div>
                       </div>
                    </div>
                </div>
            )}
            
            {modalDetails && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50" aria-modal="true" role="dialog">
                    <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200 transform transition-all">
                       <div className="flex justify-between items-center p-5 border-b border-gray-200">
                           <h3 className="text-xl font-semibold text-blue-900">Ficha de Préstamo</h3>
                           <button onClick={() => setModalDetails(null)} className="text-gray-500 hover:text-blue-800" aria-label="Cerrar" title="Cerrar ventana"><XIcon className="h-6 w-6"/></button>
                       </div>
                       <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6 bg-gray-100">
                           <div>
                               <h4 className="text-lg font-semibold text-blue-900 mb-2">Ficha de Préstamo (Original)</h4>
                               <div className="border rounded-lg overflow-hidden bg-white shadow">
                                   <PrestacionFicha prestacion={modalDetails} />
                               </div>
                           </div>

                           {modalDetails.ficha_firmada_path && (
                               <div>
                                   <h4 className="text-lg font-semibold text-blue-900 mb-2">Ficha de Préstamo (Firmada)</h4>
                                   <div className="border rounded-lg p-4 bg-white shadow">
                                       <img src={`${API_URL.replace('/api', '')}/${modalDetails.ficha_firmada_path.replace(/\\/g, '/')}`} alt="Ficha Firmada" className="max-w-full mx-auto max-h-96 border rounded" />
                                   </div>
                               </div>
                           )}
                       </div>
                       <div className="flex justify-between items-center bg-white p-4 border-t border-gray-200 rounded-b-2xl">
                           <div>
                               {modalDetails.ficha_firmada_path && (
                                   <a href={`${API_URL.replace('/api', '')}/${modalDetails.ficha_firmada_path.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">
                                       <DownloadIcon className="h-5 w-5"/>
                                       Descargar Firmada
                                   </a>
                               )}
                           </div>
                           <div className="flex items-center gap-4">
                               <button type="button" onClick={() => handlePrintPrestacion(modalDetails)} title="Imprimir ficha original" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">
                                   <PrintIcon className="h-5 w-5" />
                                   Imprimir Original
                               </button>
                               <button type="button" onClick={() => setModalDetails(null)} title="Cerrar ventana" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cerrar</button>
                           </div>
                       </div>
                    </div>
                </div>
            )}

            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-blue-900">Generar Reporte de Préstamos</h3>
                            <button onClick={() => setShowReportModal(false)} className="text-gray-500 hover:text-blue-800"><XIcon className="h-6 w-6"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                                    <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                                    <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                                <select value={reportSelectedCarId} onChange={e => setReportSelectedCarId(e.target.value)} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900">
                                    <option value="all">Todos los vehículos</option>
                                    {cars.map(car => <option key={car.id} value={car.id}>{car.marca} {car.modelo} ({car.patente})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                <select value={reportSelectedClientId} onChange={e => setReportSelectedClientId(e.target.value)} className="bg-gray-100 w-full rounded-md border-gray-300 text-blue-900">
                                    <option value="all">Todos los clientes</option>
                                    {clients.map(client => <option key={client.id} value={client.id}>{client.nombreCompleto} ({client.dni})</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end bg-gray-100 p-5 mt-2 rounded-b-2xl border-t border-gray-200">
                            <button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Generar</button>
                        </div>
                    </div>
                </div>
            )}

            {generatedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-blue-900">Reporte Estadístico</h3>
                            <button onClick={() => setGeneratedReport(null)} className="text-gray-500 hover:text-blue-800"><XIcon className="h-6 w-6"/></button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                                <div className="bg-blue-100 p-4 rounded-lg"><p className="text-sm text-blue-800">Total Préstamos</p><p className="text-2xl font-bold text-blue-900">{generatedReport.stats.totalPrestamos}</p></div>
                                <div className="bg-yellow-100 p-4 rounded-lg"><p className="text-sm text-yellow-800">Activos</p><p className="text-2xl font-bold text-yellow-900">{generatedReport.stats.activas}</p></div>
                                <div className="bg-gray-200 p-4 rounded-lg"><p className="text-sm text-gray-800">Finalizados</p><p className="text-2xl font-bold text-gray-900">{generatedReport.stats.finalizadas}</p></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-blue-900 mb-2">Préstamos por Vehículo</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-700">
                                        {Object.entries(generatedReport.stats.prestamosPorVehiculo).map(([key, value]) => <li key={key}>{key}: <strong>{value}</strong></li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900 mb-2">Préstamos por Cliente</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-700">
                                        {Object.entries(generatedReport.stats.prestamosPorCliente).map(([key, value]) => <li key={key}>{key}: <strong>{value}</strong></li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center bg-gray-100 p-5 mt-2 rounded-b-2xl border-t border-gray-200">
                            <button onClick={handleDownloadExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                                <DownloadIcon className="h-5 w-5"/>
                                Descargar Excel
                            </button>
                            <button onClick={() => setGeneratedReport(null)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {showQrScanner && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-blue-900">Escanear Código QR</h3>
                            <button onClick={() => setShowQrScanner(false)} className="text-gray-500 hover:text-blue-800">
                                <XIcon className="h-6 w-6"/>
                            </button>
                        </div>
                        <div className="p-6">
                            <Scanner
                                onResult={(result) => {
                                    setShowQrScanner(false);
                                    const carId = parseInt(result, 10);
                                    if (isNaN(carId)) {
                                        Swal.fire('Error', 'Código QR inválido.', 'error');
                                        return;
                                    }

                                    const car = cars.find(c => c.id === carId);

                                    if (!car) {
                                        Swal.fire('Error', 'Código QR inválido o vehículo no encontrado.', 'error');
                                        return;
                                    }

                                    if (qrScannerMode === 'start') {
                                        if (car.estado === CarStatus.DISPONIBLE) {
                                            handleOpenModal(car);
                                            Swal.fire('Vehículo Encontrado', `Se iniciará un préstamo para el ${car.marca} ${car.modelo}.`, 'success');
                                        } else if (car.estado === CarStatus.PRESTADO) {
                                            const prestacion = prestaciones.find(p => p.car.id === carId && p.status === PrestacionStatus.ACTIVA);
                                            if (prestacion) {
                                                Swal.fire({
                                                    title: 'Vehículo en Préstamo',
                                                    html: `Este vehículo ya está prestado a <strong>${prestacion.client.nombreCompleto}</strong>.<br/>¿Desea registrar su devolución?`,
                                                    icon: 'info',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Sí, finalizar préstamo',
                                                    cancelButtonText: 'No, cancelar'
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        handleFinishLoan(prestacion.id);
                                                    }
                                                });
                                            } else {
                                                Swal.fire('Error de Datos', 'El vehículo figura como prestado, pero no se encontró un préstamo activo. Por favor, revise los datos.', 'warning');
                                            }
                                        } else {
                                            Swal.fire('No Disponible', `El vehículo con patente ${car.patente} tiene estado "${car.estado}" y no puede ser prestado.`, 'warning');
                                        }
                                    } else { // qrScannerMode === 'finish'
                                        const prestacion = prestaciones.find(p => p.car.id === carId && p.status === PrestacionStatus.ACTIVA);
                                        if (prestacion) {
                                            handleFinishLoan(prestacion.id);
                                        } else {
                                            Swal.fire('Error', `No se encontró un préstamo activo para este vehículo. Su estado actual es "${car.estado}".`, 'error');
                                        }
                                    }
                                }}
                                onError={(error) => console.error(error?.message)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrestacionesManagement;