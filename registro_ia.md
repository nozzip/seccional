# Registro de IA - Seccional Noroeste

## [ÉXITO] - Implementación de Botón de Descarga PWA
**Fecha:** 2026-04-22
**Modo:** Desarrollar
**Descripción:** Se reemplazó el botón "Conocenos" por "Descargar la App" en la página de Inicio para facilitar la instalación de la PWA.

### Cambios realizados:
1. **Visual:** Reemplazo de botón en `Inicio.tsx` con icono de descarga (`GetAppIcon`). El botón se oculta automáticamente si la app ya está instalada.
2. **Lógica:** 
   - Implementación de escucha del evento `beforeinstallprompt` en `Inicio.tsx`.
   - Detección inteligente de sistema operativo (Android/iOS) para mostrar instrucciones personalizadas.
   - Creación de `public/sw.js` (Service Worker) para habilitar capacidades PWA.
   - Registro del Service Worker en `src/index.tsx`.
3. **Activos:**
   - Generación de icono PWA de alta resolución (`public/icon-512.png`) basado en la simbología oficial de AEFIP.
   - Actualización de `public/manifest.json` con el nombre exacto "AEFIP Seccional Noroeste" y `start_url` a `#/app`.
4. **Perfil y Autenticación:**
   - Integración de Supabase en `MobileAppView.tsx`.
   - La pestaña de Perfil ahora detecta el estado de sesión y muestra el formulario de login si el usuario no está autenticado.
   - Muestra datos dinámicos del afiliado y opción de cerrar sesión tras el login.
5. **Correcciones:**
   - Se cambiaron las rutas de `manifest.json`, iconos y registro de Service Worker a rutas relativas (`./`) para asegurar la compatibilidad con el subdirectorio `/seccional/` en GitHub Pages.
   - Se actualizó el `apple-touch-icon` en `index.html`.

## [ÉXITO] - Actualización de Identidad Visual (Logo)
**Fecha:** 2026-04-22
**Modo:** Mejorar
**Descripción:** Se actualizó el logo oficial de la PWA utilizando el archivo de alta resolución proporcionado por el usuario.

### Cambios realizados:
1. **Activos:** Se reemplazó `icon-512.png` por el nuevo `Logo PNG.png` para asegurar la mejor calidad visual en dispositivos móviles.
2. **PWA:** Se actualizó `manifest.json` para incluir la variante de 192x192, mejorando la compatibilidad con diferentes launchers de Android e iOS.

## [ÉXITO] - Sistema de Privilegios y Acceso Administrativo
**Fecha:** 2026-04-23
**Modo:** Desarrollar
**Descripción:** Se implementó un sistema de roles para restringir el acceso al panel de administración y permitir un acceso especial para el superusuario.

### Cambios realizados:
1. **Lógica:**
   - **Login Condicional:** En `FormLogin.tsx`, se detecta el DNI del administrador (`34185803`). Al ingresarlo, se despliega dinámicamente un campo de contraseña.
   - **Validación de Superusuario:** Se configuró la clave `Lecongy@290` para el administrador. Al loguearse con éxito, se asigna el rol `admin` en el objeto del usuario guardado en `localStorage`.
   - **Roles de Afiliados:** A los afiliados normales que se loguean vía Supabase se les asigna automáticamente el rol `user`.
2. **Visual:**
   - **Navbar y Drawer:** Se modificaron `Navbar.tsx` y `Drawer.tsx` para filtrar los enlaces de navegación. La pestaña "Admin" ahora solo es visible si el usuario tiene el rol `admin`.
   - **Feedback de Login:** Mensajes personalizados en el formulario de login dependiendo de si se está intentando acceder como admin o como afiliado.
3. **Seguridad (Rutas):**
   - **ProtectedRoute:** Se implementó un componente `ProtectedRoute` en `App.tsx` que envuelve la ruta `/admin`. Si un usuario sin privilegios intenta acceder vía URL, es redirigido al inicio.

### Arquitecturas Aprobadas (Actualización):
- **Privilegios:** Sistema basado en roles (`admin` / `user`) almacenados en el estado de sesión local. Protección de rutas a nivel de React Router.
- **PWA:** Rutas relativas y Service Worker configurado para actualizaciones forzadas (`v7`).

