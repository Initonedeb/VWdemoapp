
# Tecnologías y Lenguajes Utilizados

Este documento detalla los lenguajes de programación y tecnologías empleadas en cada una de las secciones principales del sistema de gestión de préstamos de vehículos.

## 1. Frontend (Interfaz de Usuario)

La interfaz de usuario, con la que interactúan los empleados y administradores, está construida como una Single Page Application (SPA).

*   **Lenguajes:**
    *   **TypeScript (TSX):** Es el lenguaje principal para el desarrollo del frontend. Se utiliza junto con React para crear componentes de interfaz de usuario dinámicos y tipados. El uso de TypeScript permite detectar errores en tiempo de compilación y mejora la mantenibilidad del código.
    *   **HTML:** Proporciona la estructura semántica fundamental de la aplicación web.
    *   **CSS (implícito):** Aunque no se vean archivos `.css` directamente, el estilo se gestiona a través de las librerías de componentes de React y posiblemente CSS-in-JS, definiendo la apariencia visual de la aplicación.

*   **Framework y Librerías:**
    *   **React:** Es la librería principal para construir la interfaz de usuario basada en componentes reutilizables.
    *   **Vite:** Se utiliza como la herramienta de construcción y servidor de desarrollo, ofreciendo una experiencia de desarrollo rápida y eficiente.

*   **Funciones:**
    *   Renderizar las diferentes vistas de la aplicación (Login, gestión de autos, clientes, préstamos, etc.).
    *   Manejar las interacciones del usuario (clics en botones, llenado de formularios).
    *   Realizar peticiones a la API del backend para obtener y enviar datos.
    *   Gestionar el estado de la aplicación (quién está logueado, qué datos se están mostrando).

## 2. Backend (Servidor)

El backend es el encargado de la lógica de negocio, el acceso a la base de datos y la comunicación con el frontend.

*   **Lenguaje:**
    *   **JavaScript (Node.js):** Se utiliza para escribir la lógica del servidor. Al ser JavaScript, permite unificar el lenguaje en todo el stack de la aplicación.

*   **Framework y Librerías:**
    *   **Express.js:** Es el framework de Node.js utilizado para construir la API REST. Simplifica la creación de rutas (endpoints), la gestión de peticiones HTTP y el manejo de middlewares.
    *   **node-sqlite3:** Librería para interactuar con la base de datos SQLite.

*   **Funciones:**
    *   Proveer endpoints para operaciones CRUD (Crear, Leer, Actualizar, Borrar) sobre las entidades del sistema: autos, clientes, usuarios y préstamos.
    *   Gestionar la autenticación y autorización de usuarios.
    *   Procesar y guardar archivos (imágenes de vehículos, documentos, etc.).
    *   Generar y servir los códigos QR de los vehículos.

## 3. Base de Datos

Es el sistema donde se almacena toda la información persistente de la aplicación.

*   **Lenguaje:**
    *   **SQL:** Se utiliza para definir la estructura de la base de datos (tablas, columnas, relaciones) y para realizar consultas sobre los datos. El archivo `prestamosautos.sql` contiene el volcado (dump) del esquema de la base de datos.

*   **Sistema Gestor de Base de Datos (SGBD):**
    *   **SQLite:** Es el motor de base de datos utilizado. Es una base de datos ligera, basada en un archivo (`db.js` probablemente la configura y `prestaciones-log.json` podría ser un log o la propia base de datos en formato json), lo que simplifica la configuración y el despliegue de la aplicación.

*   **Funciones:**
    *   Almacenar de forma persistente los datos de usuarios, clientes, autos, préstamos y sus relaciones.
    *   Garantizar la integridad y consistencia de los datos.

## 4. Archivos de Configuración y Documentación

Estos archivos son esenciales para la configuración del proyecto y su correcta ejecución y entendimiento.

*   **Lenguajes/Formatos:**
    *   **JSON (JavaScript Object Notation):** Se utiliza en archivos como `package.json`, `tsconfig.json` y `prestaciones-log.json`. Definen las dependencias del proyecto, la configuración del compilador de TypeScript y otros metadatos.
    *   **Markdown (.md):** Se usa para la documentación del proyecto, como en este mismo archivo, `README.md`, `explicacion.md`, etc.
