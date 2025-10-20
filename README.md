# Sistema de Prestaciones

Una aplicación web interna para gestionar las operaciones de prestaciones de vehículos, incluyendo inventario, clientes y ventas.

---

## 🚀 Funcionalidades Principales

-   **Sistema de Autenticación:** Inicio de sesión seguro con roles de usuario definidos (Administrador y Empleado).
-   **Panel de Administrador:** Un centro de control centralizado para acceder a todos los módulos de gestión.
-   **Gestión de Vehículos (CRUD):**
    -   **Control Total del Inventario:** Permite crear, ver, editar y eliminar vehículos de demostración o usados.
    -   **Formulario Detallado:** Campos para marca, modelo (seleccionable de una lista), versión, año, kilometraje, patente, chasis, motor, sucursal y más.
    -   **Carga de Fotos:** Sistema para subir entre 2 y 4 fotos por vehículo.
    -   **Listado Avanzado:** Tabla responsiva con indicadores de estado (`Disponible`, `Prestado`, `Vendido`) visualmente diferenciados por colores.
    -   **Historial de Actividad:** Registro de todas las operaciones (crear, editar, eliminar) con acciones para ver detalles, imprimir, descargar y borrar.

-   **Gestión de Clientes (CRUD):**
    -   **Base de Datos Centralizada:** Permite crear, ver, editar y eliminar clientes.
    -   **Búsqueda Rápida:** Buscador integrado para encontrar clientes por nombre o DNI.
    -   **Historial Completo:** Registra toda la actividad relacionada con los clientes, con el mismo conjunto de acciones avanzadas.

-   **Gestión de Prestaciones v2.0 (¡Mejorado!):**
    -   **Control de Préstamos:** Flujo completo para prestar vehículos de demostración a clientes registrados.
    -   **Seguimiento de Estado:** Actualiza automáticamente el estado del vehículo a "Prestado" y lo revierte a "Disponible" al registrar la devolución.
    -   **Fotos en Devolución:** Al registrar la devolución de un vehículo, el sistema ahora solicita 2 fotos del estado del mismo, las cuales quedan guardadas en el historial del préstamo.
    -   **Historial Detallado:** Muestra un listado de todas las prestaciones, diferenciando visualmente entre `Activas` y `Finalizadas`.
    -   **Reportes Avanzados:** Nuevo módulo para generar reportes estadísticos web con filtros por rango de fechas, vehículo o cliente.
    -   **Exportación a Excel:** Descarga los datos del reporte generado en un archivo `.xlsx` con dos hojas: un resumen de estadísticas y los datos completos.
    -   **Descarga de Ficha en PDF:** El botón de descarga en el historial ahora genera un archivo `.pdf` con un diseño profesional de la ficha del préstamo, ideal para archivar o compartir.

-   **Gestión de Códigos QR (¡Nuevo!):**
    -   **Generación Automática:** Al crear un vehículo, el sistema genera un código QR único para identificarlo.
    -   **Escaneo desde Celular a PC:** Permite iniciar o finalizar préstamos de una forma innovadora. El usuario escanea un QR en la pantalla de la PC con su celular para emparejar los dispositivos, y luego escanea el QR del vehículo con el celular para que la información aparezca automáticamente en la aplicación de escritorio.

-   **Gestión de Usuarios (CRUD):**
    -   **Control de Acceso:** Permite al administrador crear, editar y eliminar cuentas de usuario.
    -   **Asignación de Roles:** Define los permisos de cada usuario asignando roles (`Administrador`, `Empleado`).
    -   **Seguridad:** Impide la eliminación del usuario `admin` principal. Adicionalmente, la contraseña del usuario `sofiaadmin` solo puede ser modificada por el mismo usuario, requiriendo la contraseña actual para confirmar el cambio. Los botones de eliminar en todos los módulos de gestión ahora solo son visibles y utilizables por usuarios con rol de `Administrador`.

---

## 🛠️ Pila Tecnológica

-   **Frontend:** React con TypeScript
-   **Estilos:** Tailwind CSS

---

## 🏁 Cómo Empezar

Simplemente abre el archivo `index.html` en tu navegador web. No se requiere ningún paso de compilación o instalación.

### Credenciales de Acceso

-   **Administrador:**
    -   **Usuario:** `admin`
    -   **Contraseña:** `admin`
-   **Empleado:**
    -   **Usuario:** `empleado`
    -   **Contraseña:** `empleado`
    -   *(Nota: El panel de empleado aún no está implementado)*.