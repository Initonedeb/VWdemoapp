-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-10-2025 a las 17:20:22
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `prestamosautos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cars`
--

CREATE TABLE `cars` (
  `id` int(11) NOT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `version` varchar(100) DEFAULT NULL,
  `ano` int(11) DEFAULT NULL,
  `kilometraje` int(11) DEFAULT NULL,
  `estado` enum('Disponible','Prestado','Vendido') NOT NULL DEFAULT 'Disponible',
  `patente` varchar(15) NOT NULL,
  `chasis` varchar(50) DEFAULT NULL,
  `motor` varchar(50) DEFAULT NULL,
  `garantia` tinyint(1) DEFAULT 1,
  `sector` enum('Ventas','Servicios','Taller') DEFAULT NULL,
  `categoria` enum('Sustituto','Dueño','Demo') NOT NULL,
  `sucursal` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `qr_code_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cars`
--

INSERT INTO `cars` (`id`, `marca`, `modelo`, `version`, `ano`, `kilometraje`, `estado`, `patente`, `chasis`, `motor`, `garantia`, `sector`, `categoria`, `sucursal`, `created_at`, `updated_at`, `qr_code_path`) VALUES
(3, 'Volkswagen', 'T-Cross', 'Trendline 170 TSI', 2025, 7, 'Disponible', '2FSX6', '1234abcd', 'ms54788', 1, 'Ventas', 'Dueño', 'Adolfo de la Vega 379', '2025-09-18 20:58:16', '2025-09-29 11:22:07', NULL),
(8, 'Volkswagen', 'T-Cross', 'Comfortline 1.4 TSI', 2025, 55, 'Disponible', '123asd654', 'lkjhgf098', 'aaassdd', 1, 'Ventas', 'Demo', 'Adolfo de la Vega 379', '2025-09-29 13:00:33', '2025-10-03 14:59:17', NULL),
(18, 'Volkswagen', 'Polo', 'Track', 2025, 101, 'Disponible', 'SO345LA', '12345ABD', 'XYZ987ss', 0, 'Ventas', 'Demo', 'San Lorenzo 254', '2025-10-03 11:36:54', '2025-10-13 13:32:18', NULL),
(20, 'Volkswagen', 'Tiguan', 'Allspace Comfortline', 2018, 2, 'Disponible', 'ad345d000', '000123', '123000', 0, 'Ventas', 'Demo', 'San Lorenzo 254', '2025-10-03 15:42:04', '2025-10-03 15:42:04', '/uploads/qrcodes/car_QR_20.png'),
(21, 'Volkswagen', 'Saveiro', 'Trendline', 2016, 250, 'Disponible', '99999', '88888888', '77777', 0, 'Ventas', 'Demo', 'San Lorenzo 254', '2025-10-03 15:44:32', '2025-10-13 13:23:53', '/uploads/qrcodes/car_QR_21.png'),
(22, 'Volkswagen', 'Taos', 'Highline', 2015, 100, 'Prestado', '0000000000000', '00000000000', '000000', 0, 'Ventas', 'Demo', 'San Lorenzo 254', '2025-10-07 15:08:04', '2025-10-13 14:10:03', '/uploads/qrcodes/car_QR_22.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `car_photos`
--

CREATE TABLE `car_photos` (
  `id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `car_photos`
--

INSERT INTO `car_photos` (`id`, `car_id`, `photo_url`, `created_at`) VALUES
(13, 3, 'data:image/jpeg;base64', '2025-09-26 15:07:27'),
(14, 3, '/9j/4AAQSkZJRgABAQEBMAEwAAD/4gvgSUNDX1BST0ZJTEUAAQEAAAvQAAAAAAIAAABtbnRyUkdCIFhZWiAH3wACAA8AAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAA9tYAAQAAAADTLQAAAAA9DrLerpOXvptnJs6MCkPOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBkZXNj', '2025-09-26 15:07:27'),
(15, 3, 'data:image/jpeg;base64', '2025-09-26 15:07:27'),
(16, 3, '/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIbGNtcwIQAABtbnRyUkdCIFhZWiAH4gADABQACQAOAB1hY3NwTVNGVAAAAABzYXdzY3RybAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWhhbmSdkQA9QICwPUB0LIGepSKOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNj', '2025-09-26 15:07:27'),
(19, 8, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAQAElEQVR4AeydB4AUNRfHX5Jp267SFRQEC6hYsCEWxIqFz8LZAEFUVEQBKQqWs4JdQUSkqVQPARFFEBQQ7NhQsIAC0stxZcv05HtzFAEBaUe5y7DZnZ3JvLz8spN/XrK3UJCbJCAJSAKSgCQgCRzyBKSgH/JNKCsgCUgCkoAkIAkAlK6gS8KSgCQgC', '2025-09-29 13:00:33'),
(20, 8, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIbGNtcwIQAABtbnRyUkdCIFhZWiAH4gADABQACQAOAB1hY3NwTVNGVAAAAABzYXdzY3RybAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWhhbmSdkQA9QICwPUB0LIGepSKOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNj', '2025-09-29 13:00:33'),
(27, 18, '7fc07a35-2d23-4335-936a-1e346a680045.jpg', '2025-10-03 11:36:54'),
(28, 18, '291228e1-9586-4188-afbc-90e84f198a31.png', '2025-10-03 11:36:54'),
(31, 20, '54729781-6a8a-453e-aa8d-e8dc3fdc7943.png', '2025-10-03 15:42:04'),
(32, 20, '26de0474-d086-4b62-876a-7bfdf491b271.png', '2025-10-03 15:42:04'),
(33, 21, '1109c646-093f-4491-8623-704f86a810e5.jpg', '2025-10-03 15:44:32'),
(34, 21, '2b8832c5-bccb-4e8b-bdc4-c847f82e9771.png', '2025-10-03 15:44:32'),
(35, 22, '31497dd9-cc63-4b1e-9670-96433c7bf343.jpg', '2025-10-07 15:08:05'),
(36, 22, '028356cb-1d87-4576-a4bc-8115ac11bf3f.png', '2025-10-07 15:08:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `nombreCompleto` varchar(100) NOT NULL,
  `fechaNacimiento` date DEFAULT NULL,
  `dni` varchar(15) NOT NULL,
  `carnetManejo` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `celular` varchar(25) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `cuil` varchar(15) DEFAULT NULL,
  `estadoCivil` enum('Soltero/a','Casado/a','Divorciado/a','Viudo/a','Otro') DEFAULT NULL,
  `fotoCarnetFrente` varchar(255) DEFAULT NULL,
  `fotoCarnetDorso` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clients`
--

INSERT INTO `clients` (`id`, `nombreCompleto`, `fechaNacimiento`, `dni`, `carnetManejo`, `direccion`, `celular`, `email`, `cuil`, `estadoCivil`, `fotoCarnetFrente`, `fotoCarnetDorso`, `created_at`, `updated_at`) VALUES
(2, 'Juan Moreno', '2025-09-16', '333434', '3443555', 'Av. Siemjgjggjjhgjhg', '11-5555-1234', 'jhffjhf.perez@example.com', '3317775555', 'Divorciado/a', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBMAEwAAD/4gvgSUNDX1BST0ZJTEUAAQEAAAvQAAAAAAIAAABtbnRyUkdCIFhZWiAH3wACAA8AAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAA9tYAAQAAAADTLQAAAAA9DrLerpOXvptnJs6MCkPOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBkZXNj', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIbGNtcwIQAABtbnRyUkdCIFhZWiAH4gADABQACQAOAB1hY3NwTVNGVAAAAABzYXdzY3RybAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWhhbmSdkQA9QICwPUB0LIGepSKOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNj', '2025-09-18 20:13:38', '2025-09-18 20:19:47'),
(3, 'adasd', '2025-09-07', '123213', '7878', 'asasdjhdkjh', '2314564', 'lucaslopez@gmail.com', '456456', 'Soltero/a', 'uploads\\fotoCarnetFrente-1758233542397.png', 'uploads\\fotoCarnetDorso-1758233542426.png', '2025-09-18 22:02:05', '2025-09-18 22:12:22'),
(4, 'aaaaaaaaaaaaaaa', '2000-10-23', '2222222222222', '55555555555555555', 'ffffffffffffffffffffffffffff', '444444444444', 'juan.perez@44example.com', '34444444444445', 'Casado/a', 'uploads\\fotoCarnetFrente-1758233928065.jpg', 'uploads\\fotoCarnetDorso-1758233928070.png', '2025-09-18 22:18:48', '2025-10-03 14:12:40'),
(6, 'bbbbbbbbbb', '2000-10-06', '3333333333', '3333333333333', 'AV 333333', '33333333333', '33333333@gmail', '1333333331', 'Soltero/a', 'uploads\\fotoCarnetFrente-1759835501684.jpg', 'uploads\\fotoCarnetDorso-1759835501690.png', '2025-10-07 11:11:41', '2025-10-07 11:11:41'),
(7, 'cccccccccccc', '2000-10-05', '111111111111', '111111111', '11111111111', '111111111111', '1111111@gmail', '11111111111111', 'Soltero/a', 'uploads\\fotoCarnetFrente-1759835599815.jpg', 'uploads\\fotoCarnetDorso-1759835599820.png', '2025-10-07 11:13:19', '2025-10-07 11:13:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestaciones`
--

CREATE TABLE `prestaciones` (
  `id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `loanDate` date NOT NULL,
  `returnDate` date DEFAULT NULL,
  `status` enum('Activa','Finalizada','Finalizada y firmada') NOT NULL,
  `gestionadoPor` varchar(100) DEFAULT NULL,
  `autorizadoPor` varchar(100) DEFAULT NULL,
  `ficha_escaneada_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ficha_firmada_path` varchar(255) DEFAULT NULL,
  `combustible_salida` enum('reserva','1/4 tanque','1/2 tanque','3/4 tanque','lleno') DEFAULT NULL,
  `combustible_regreso` enum('reserva','1/4 tanque','1/2 tanque','3/4 tanque','lleno') DEFAULT NULL,
  `km_salida` int(11) DEFAULT NULL,
  `km_regreso` int(11) DEFAULT NULL,
  `observaciones_devolucion` text DEFAULT NULL,
  `rueda_auxilio` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `prestaciones`
--

INSERT INTO `prestaciones` (`id`, `car_id`, `client_id`, `loanDate`, `returnDate`, `status`, `gestionadoPor`, `autorizadoPor`, `ficha_escaneada_url`, `created_at`, `updated_at`, `ficha_firmada_path`, `combustible_salida`, `combustible_regreso`, `km_salida`, `km_regreso`, `observaciones_devolucion`, `rueda_auxilio`) VALUES
(5, 3, 3, '2025-09-26', '2025-09-29', 'Finalizada y firmada', 'sofia', 'nico', 'uploads\\fichaPrestamo-1759144927298-175030591.jpg', '2025-09-26 14:43:44', '2025-09-29 11:22:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 18, 4, '2025-10-03', '2025-10-03', 'Finalizada', 'Sofia', 'Nicolas', NULL, '2025-10-03 14:24:03', '2025-10-03 14:24:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, 18, 4, '2025-10-03', '2025-10-07', 'Finalizada', 'Sofia', 'Nicolas', NULL, '2025-10-03 14:30:48', '2025-10-07 11:08:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 18, 6, '2025-10-07', '2025-10-07', '', 'Sofia', 'Nicolas', NULL, '2025-10-07 11:15:52', '2025-10-07 11:16:11', 'uploads\\fichaFirmada-1759835771075.jpg', NULL, NULL, NULL, NULL, NULL, NULL),
(27, 21, 7, '2025-10-07', '2025-10-07', '', 'Sofia', 'Nicolas', NULL, '2025-10-07 11:17:23', '2025-10-07 15:10:09', 'uploads\\fichaFirmada-1759849809862.png', NULL, NULL, NULL, NULL, NULL, NULL),
(28, 21, 7, '2025-10-13', '2025-10-13', '', 'Sofia', 'Nicolas', NULL, '2025-10-13 13:12:40', '2025-10-13 13:13:21', 'uploads\\fichaFirmada-1760361201355.jpg', '3/4 tanque', '1/2 tanque', NULL, NULL, NULL, NULL),
(29, 21, 6, '2025-10-13', '2025-10-13', '', 'Sofia', 'Nicolas', NULL, '2025-10-13 13:22:51', '2025-10-13 13:23:53', 'uploads\\fichaFirmada-1760361833861.png', 'lleno', '1/2 tanque', 200, 250, NULL, NULL),
(30, 18, 2, '2025-10-13', '2025-10-13', '', 'Sofia', 'Nicolas', NULL, '2025-10-13 13:31:37', '2025-10-13 13:32:18', 'uploads\\fichaFirmada-1760362338972.png', '1/2 tanque', 'lleno', 88, 101, '..', 1),
(31, 22, 6, '2025-10-13', NULL, 'Activa', 'Sofia', 'Nicolas', NULL, '2025-10-13 14:10:03', '2025-10-13 14:10:03', NULL, 'lleno', NULL, 100, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestacion_fotos`
--

CREATE TABLE `prestacion_fotos` (
  `id` int(11) NOT NULL,
  `prestacion_id` int(11) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `prestacion_fotos`
--

INSERT INTO `prestacion_fotos` (`id`, `prestacion_id`, `photo_url`, `created_at`) VALUES
(33, 22, 'uploads\\fotosDevolucion-1759501477728.jpg', '2025-10-03 14:24:37'),
(34, 22, 'uploads\\fotosDevolucion-1759501477734.jpg', '2025-10-03 14:24:37'),
(35, 23, 'uploads\\fotosDevolucion-1759501872255.jpg', '2025-10-03 14:31:12'),
(36, 23, 'uploads\\fotosDevolucion-1759501872265.png', '2025-10-03 14:31:12'),
(41, 23, 'uploads\\fotosDevolucion-1759835300638.jpg', '2025-10-07 11:08:20'),
(42, 23, 'uploads\\fotosDevolucion-1759835300649.png', '2025-10-07 11:08:20'),
(43, 26, 'uploads\\fotosDevolucion-1759835763447.jpg', '2025-10-07 11:16:03'),
(44, 26, 'uploads\\fotosDevolucion-1759835763449.jpg', '2025-10-07 11:16:03'),
(45, 27, 'uploads\\fotosDevolucion-1759849800637.jpg', '2025-10-07 15:10:00'),
(46, 27, 'uploads\\fotosDevolucion-1759849800639.jpg', '2025-10-07 15:10:00'),
(47, 28, 'uploads\\fotosDevolucion-1760361193337.jpg', '2025-10-13 13:13:13'),
(48, 28, 'uploads\\fotosDevolucion-1760361193345.jpg', '2025-10-13 13:13:13'),
(49, 29, 'uploads\\fotosDevolucion-1760361825830.jpg', '2025-10-13 13:23:45'),
(50, 29, 'uploads\\fotosDevolucion-1760361825835.jpg', '2025-10-13 13:23:45'),
(51, 30, 'uploads\\fotosDevolucion-1760362330952.jpg', '2025-10-13 13:32:10'),
(52, 30, 'uploads\\fotosDevolucion-1760362330959.jpg', '2025-10-13 13:32:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Admin','Ventas','Posventa') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `created_at`) VALUES
(1, 'sofiaadmin', '$2b$10$xVy0Wp2d/Fi1PHtfM/qaH.5a.FO14om08lu72flMlwPiCV5Yw6CN2', 'Admin', '2025-09-18 21:15:48'),
(2, 'Matias', '$2b$10$ABUIQilzO9/U6W2oO9AKgu88AHlCLI7Ee3rxg2wgT5DQr71BTtk92', 'Admin', '2025-09-18 21:28:37'),
(3, 'maxi', '$2b$10$3z2ITNbfKwPJ2iPbcKLx5.dOVdMqGoH39paG3.4ZY/0DnwQOsqzRC', 'Posventa', '2025-09-19 13:24:00');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patente` (`patente`),
  ADD UNIQUE KEY `chasis` (`chasis`);

--
-- Indices de la tabla `car_photos`
--
ALTER TABLE `car_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `car_id` (`car_id`);

--
-- Indices de la tabla `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `cuil` (`cuil`);

--
-- Indices de la tabla `prestaciones`
--
ALTER TABLE `prestaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `car_id` (`car_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indices de la tabla `prestacion_fotos`
--
ALTER TABLE `prestacion_fotos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prestacion_id` (`prestacion_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cars`
--
ALTER TABLE `cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `car_photos`
--
ALTER TABLE `car_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `prestaciones`
--
ALTER TABLE `prestaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `prestacion_fotos`
--
ALTER TABLE `prestacion_fotos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `car_photos`
--
ALTER TABLE `car_photos`
  ADD CONSTRAINT `car_photos_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `prestaciones`
--
ALTER TABLE `prestaciones`
  ADD CONSTRAINT `prestaciones_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`),
  ADD CONSTRAINT `prestaciones_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`);

--
-- Filtros para la tabla `prestacion_fotos`
--
ALTER TABLE `prestacion_fotos`
  ADD CONSTRAINT `prestacion_fotos_ibfk_1` FOREIGN KEY (`prestacion_id`) REFERENCES `prestaciones` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
