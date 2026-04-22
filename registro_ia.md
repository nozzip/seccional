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

### Arquitecturas Aprobadas (Actualización):
- **PWA:** Se utiliza una implementación estándar de Service Worker y Manifest para permitir la instalación nativa en dispositivos móviles (Android/iOS). Rutas configuradas como relativas para compatibilidad con subdirectorios de hosting.
