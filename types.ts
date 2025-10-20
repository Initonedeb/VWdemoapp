export enum UserRole {
  ADMIN = 'Admin',
  VENTAS = 'Ventas',
  POSVENTA = 'Posventa',
}

export interface User {
  id: number;
  username: string;
  password_dont_display: string;
  role: UserRole;
}

export enum CarStatus {
  DISPONIBLE = 'Disponible',
  PRESTADO = 'Prestado',
  VENDIDO = 'Vendido',
}

export enum Sector {
  VENTAS = 'Ventas',
  SERVICIOS = 'Servicios',
  TALLER = 'Taller',
}

export enum Category {
  SUSTITUTO = 'Sustituto',
  DUENO = 'Dueño',
  DEMO = 'Demo',
}

export interface Car {
  id: number;
  marca: string;
  modelo: string;
  version: string;
  ano: number;
  kilometraje: number;
  estado: CarStatus;
  patente: string;
  chasis: string;
  motor: string;
  garantia: boolean;
  sector: Sector;
  categoria: Category;
  sucursal: string;
  fotos: string[];
  qr_code_url?: string;
}

export enum CivilStatus {
  SOLTERO = 'Soltero/a',
  CASADO = 'Casado/a',
  DIVORCIADO = 'Divorciado/a',
  VIUDO = 'Viudo/a',
  OTRO = 'Otro',
}

export interface Client {
  id: number;
  nombreCompleto: string;
  fechaNacimiento: string;
  dni: string;
  carnetManejo: string;
  direccion: string;
  celular: string;
  email: string;
  cuil: string;
  estadoCivil: CivilStatus;
  fotoCarnetFrente: string;
  fotoCarnetDorso: string;
}

export enum PrestacionStatus {
  ACTIVA = 'Activa',
  FINALIZADA = 'Finalizada',
  FIRMADA_Y_FINALIZADA = 'Firmada y Finalizada',
}

export enum FuelLevel {
  RESERVA = 'reserva',
  UN_CUARTO = '1/4 tanque',
  MEDIO = '1/2 tanque',
  TRES_CUARTOS = '3/4 tanque',
  LLENO = 'lleno',
}

export interface Prestacion {
  id: number;
  car: Car;
  client: Client;
  loanDate: string;
  returnDate?: string;
  status: PrestacionStatus;
  gestionadoPor?: string;
  autorizadoPor?: string;
  fotosDevolucion?: string[];
  ficha_firmada_path?: string;
  combustible_salida?: FuelLevel;
  combustible_regreso?: FuelLevel;
  km_salida?: number;
  km_regreso?: number;
  observaciones_devolucion?: string;
  rueda_auxilio?: boolean;
}