# Registro de IA - Seccional Noroeste

## [ÉXITO] - Restricción de Permisos Administrativos y Seguridad de Datos (Prensa y Convenios)
**Fecha:** 2026-05-20
**Modo:** Mejorar / Desarrollar
**Descripción:** Se restringió de forma estricta y segura el acceso a los privilegios administrativos en toda la aplicación (tanto visualmente como en las consultas de base de datos) únicamente al **DNI 34185803** (Administrador del Sistema) y **Ramiro García Salado Kuhl** (Legajo: `042418/00`, CUIL: `23276817159`). Se corrigieron vulnerabilidades importantes en las secciones de Convenios (donde los botones de edición y agregado se mostraban a afiliados comunes) y Prensa (donde se podían agregar/eliminar noticias sin comprobar roles centralizados).

### Cambios realizados:
1. **Lógica de Autenticación Unificada (`src/utils/auth.ts`):**
   - Implementación de la utilidad centralizada `isUserAdmin(user)` para determinar la identidad de los dos únicos administradores aprobados por DNI, Legajo, CUIL, Email y coincidencia de nombres oficiales.
2. **Corrección de Asignación de Roles en Login (`FormLogin.tsx`):**
   - Modificación del login de afiliados para asignar el rol `"admin"` en caliente a Ramiro mediante `isUserAdmin`, sorteando que su registro inicial en base de datos figure como `"user"`.
3. **Navegación y Rutas Protegidas (`App.tsx`, `Navbar.tsx`, `Drawer.tsx`):**
   - Actualización de `ProtectedRoute` para bloquear de raíz la ruta `/admin` basándose en `isUserAdmin`.
   - Remoción del acceso y visibilidad visual del panel de administración ("Admin") en la navegación móvil y de escritorio para afiliados ordinarios.
4. **Seguridad en Convenios / Beneficios (`GridBeneficios.tsx`, `BenefitEditModal.tsx`):**
   - Ocultación del botón flotante `Fab` ("Agregar beneficio") y del botón de edición ("lápiz") en el diálogo de detalles para cualquier usuario no administrador.
   - Enlace y validación local rígida de todas las operaciones de modificación (`handleSave`, `handleDelete`, `handleFileUpload`, `handleAddRubro`) con `isUserAdmin` para evitar bypass de seguridad.
5. **Seguridad en Prensa y Noticias (`Prensa.tsx`, `AddNewsDialog.tsx`, `PrensaCard.tsx`):**
   - Uso de `isUserAdmin` para mostrar/ocultar el botón `Fab` de publicación.
   - Restricción lógica estricta en el cargador (`AddNewsDialog`) y borrador (`PrensaCard`) para anular mutaciones de Supabase si el usuario actual no es un administrador autorizado.

### Arquitecturas Aprobadas (Actualización):
- **Privilegios y Autenticación:** Utilización del utilitario de validación unificada `isUserAdmin(user)` para todas las interfaces y operaciones críticas de mutación de base de datos.
- **Validación del Compilador:** La aplicación compila con cero errores en TypeScript (`npx tsc --noEmit`) y empaqueta exitosamente para producción (`npm run build`).

## [ÉXITO] - Adaptación a Dominio Personalizado (CNAME) y Forzado de Actualizaciones PWA
**Fecha:** 2026-05-18
**Modo:** Mejorar
**Descripción:** Se adaptó la aplicación para soportar plenamente el dominio personalizado `aefipnoroeste.org.ar` en GitHub Pages, corrigiendo errores 404/Site not found y ERR_FAILED en la PWA instalada previamente al unificar la carga mediante rutas relativas universales (`base: "./"` y `start_url: "."`). Esto permite que la app funcione de manera simultánea tanto en la raíz del dominio personalizado como en el subdirectorio `/seccional/` de GitHub Pages sin romper la caché local de los dispositivos móviles.

### Cambios realizados:
1. **Conservación de Dominio DNS (CNAME):**
   - Creación de `public/CNAME` con el valor `aefipnoroeste.org.ar`. Se copia automáticamente a `dist/` durante el build y se despliega con `gh-pages -d dist`, previniendo que futuras subidas borren la configuración y den error 404 "Site not found".
2. **Ajuste de Base URL para Dominio Raíz (vite.config.js):**
   - Se cambió `base` en `vite.config.js` de `/seccional/` a `/` para alinear la carga de assets y bundles de React a la raíz del dominio.
3. **PWA y Service Worker en la Raíz (public/manifest.json, public/sw.js):**
   - Ajuste de `start_url` a `/` en `public/manifest.json` para que la app instalada comience desde el dominio principal.
   - Ajuste de comprobación de navegación en `public/sw.js` para interceptar tanto `/` como `/seccional/` y aplicar la estrategia de Network-First con auto-reload al instante de activarse un nuevo SW.
4. **Recursos Estáticos (public/404.html):**
   - Modificación de rutas absolutas de recursos en `public/404.html` a rutas relativas (`./`), alineándolas con la estructura de `index.html`.
5. **Lógica de Build (postbuild.js) y Registro (src/index.tsx):**
   - Script `postbuild.js` inyecta `CACHE_NAME` y comentarios únicos en cada build.
   - Registro en `index.tsx` configurado con `updateViaCache: 'none'`, escuchas de `visibilitychange` (para actualizar al maximizar) y `controllerchange` (para forzar recarga de página en caliente).

## [Ãƒâ€°XITO] - ImplementaciÃƒÂ³n de BotÃƒÂ³n de Descarga PWA
**Fecha:** 2026-04-22
**Modo:** Desarrollar
**DescripciÃƒÂ³n:** Se reemplazÃƒÂ³ el botÃƒÂ³n "Conocenos" por "Descargar la App" en la pÃƒÂ¡gina de Inicio para facilitar la instalaciÃƒÂ³n de la PWA.

### Cambios realizados:
1. **Visual:** Reemplazo de botÃƒÂ³n en `Inicio.tsx` con icono de descarga (`GetAppIcon`). El botÃƒÂ³n se oculta automÃƒÂ¡ticamente si la app ya estÃƒÂ¡ instalada.
2. **LÃƒÂ³gica:** 
   - ImplementaciÃƒÂ³n de escucha del evento `beforeinstallprompt` en `Inicio.tsx`.
   - DetecciÃƒÂ³n inteligente de sistema operativo (Android/iOS) para mostrar instrucciones personalizadas.
   - CreaciÃƒÂ³n de `public/sw.js` (Service Worker) para habilitar capacidades PWA.
   - Registro del Service Worker en `src/index.tsx`.
3. **Activos:**
   - GeneraciÃƒÂ³n de icono PWA de alta resoluciÃƒÂ³n (`public/icon-512.png`) basado en la simbologÃƒÂ­a oficial de AEFIP.
   - ActualizaciÃƒÂ³n de `public/manifest.json` con el nombre exacto "AEFIP Seccional Noroeste" y `start_url` a `#/app`.
4. **Perfil y AutenticaciÃƒÂ³n:**
   - IntegraciÃƒÂ³n de Supabase en `MobileAppView.tsx`.
   - La pestaÃƒÂ±a de Perfil ahora detecta el estado de sesiÃƒÂ³n y muestra el formulario de login si el usuario no estÃƒÂ¡ autenticado.
   - Muestra datos dinÃƒÂ¡micos del afiliado y opciÃƒÂ³n de cerrar sesiÃƒÂ³n tras el login.
5. **Correcciones:**
   - Se cambiaron las rutas de `manifest.json`, iconos y registro de Service Worker a rutas relativas (`./`) para asegurar la compatibilidad con el subdirectorio `/seccional/` en GitHub Pages.
   - Se actualizÃƒÂ³ el `apple-touch-icon` en `index.html`.

## [Ãƒâ€°XITO] - ActualizaciÃƒÂ³n de Identidad Visual (Logo)
**Fecha:** 2026-04-22
**Modo:** Mejorar
**DescripciÃƒÂ³n:** Se actualizÃƒÂ³ el logo oficial de la PWA utilizando el archivo de alta resoluciÃƒÂ³n proporcionado por el usuario.

### Cambios realizados:
1. **Activos:** Se reemplazÃƒÂ³ `icon-512.png` por el nuevo `Logo PNG.png` para asegurar la mejor calidad visual en dispositivos mÃƒÂ³viles.
2. **PWA:** Se actualizÃƒÂ³ `manifest.json` para incluir la variante de 192x192, mejorando la compatibilidad con diferentes launchers de Android e iOS.

## [Ãƒâ€°XITO] - Sistema de Privilegios y Acceso Administrativo
**Fecha:** 2026-04-23
**Modo:** Desarrollar
**DescripciÃƒÂ³n:** Se implementÃƒÂ³ un sistema de roles para restringir el acceso al panel de administraciÃƒÂ³n y permitir un acceso especial para el superusuario.

### Cambios realizados:
1. **LÃƒÂ³gica:**
   - **Login Condicional:** En `FormLogin.tsx`, se detecta el DNI del administrador (`34185803`). Al ingresarlo, se despliega dinÃƒÂ¡micamente un campo de contraseÃƒÂ±a.
   - **ValidaciÃƒÂ³n de Superusuario:** Se configurÃƒÂ³ la clave `Lecongy@290` para el administrador. Al loguearse con ÃƒÂ©xito, se asigna el rol `admin` en el objeto del usuario guardado en `localStorage`.
   - **Roles de Afiliados:** A los afiliados normales que se loguean vÃƒÂ­a Supabase se les asigna automÃƒÂ¡ticamente el rol `user`.
2. **Visual:**
   - **Navbar y Drawer:** Se modificaron `Navbar.tsx` y `Drawer.tsx` para filtrar los enlaces de navegaciÃƒÂ³n. La pestaÃƒÂ±a "Admin" ahora solo es visible si el usuario tiene el rol `admin`.
   - **Feedback de Login:** Mensajes personalizados en el formulario de login dependiendo de si se estÃƒÂ¡ intentando acceder como admin o como afiliado.
3. **Seguridad (Rutas):**
   - **ProtectedRoute:** Se implementÃƒÂ³ un componente `ProtectedRoute` en `App.tsx` que envuelve la ruta `/admin`. Si un usuario sin privilegios intenta acceder vÃƒÂ­a URL, es redirigido al inicio.

### Arquitecturas Aprobadas (ActualizaciÃƒÂ³n):
- **Privilegios:** Sistema basado en roles (`admin` / `user`) almacenados en el estado de sesiÃƒÂ³n local. ProtecciÃƒÂ³n de rutas a nivel de React Router.
- **PWA:** Rutas relativas y Service Worker configurado para actualizaciones forzadas (`v7`).

## [Ãƒâ€°XITO] - Carga de ImÃƒÂ¡genes de Convenios Salta a Supabase
**Fecha:** 2026-04-28
**Modo:** Desarrollar
**DescripciÃƒÂ³n:** Se subieron las imÃƒÂ¡genes locales de `public/Convenios Salta` a Supabase Storage y se actualizaron los registros en la tabla `benefits`.

### Cambios realizados:
1. **Activos:** Se subieron 24 imÃƒÂ¡genes (`2.png` a `25.png`) al bucket `benefits` de Supabase.
2. **LÃƒÂ³gica/Datos:** 
   - Se actualizaron las URLs de los `thumbnails` en la base de datos para que apunten a los nuevos archivos en Supabase.
   - Se unificÃƒÂ³ la categorÃƒÂ­a a "Salta" para todos los beneficios contenidos en la carpeta procesada (incluyendo los que originalmente estaban marcados como Jujuy en los mocks, siguiendo la estructura de carpetas actual).
   - Se utilizÃƒÂ³ el ID del nombre del archivo para mapear correctamente cada beneficio.

### Arquitecturas Aprobadas (ActualizaciÃƒÂ³n):
- **Almacenamiento:** Uso del bucket `benefits` en Supabase para activos de convenios.

## [Ãƒâ€°XITO] - Cargador DinÃƒÂ¡mico con Porcentaje en Prensa
**Fecha:** 2026-04-29
**Modo:** Mejorar
**DescripciÃƒÂ³n:** Se aÃƒÂ±adiÃƒÂ³ un sistema de feedback visual avanzado (barra de progreso + porcentaje) sobre el skeleton loader en la secciÃƒÂ³n de Prensa para mitigar la percepciÃƒÂ³n de lentitud en la carga de noticias del MDN.

### Cambios realizados:
1. **Visual:** 
   - CreaciÃƒÂ³n del componente `LoadingProgress` en `PrensaCard.tsx` con estÃƒÂ©tica premium (gradientes, animaciones de pulso y tipografÃƒÂ­a monoespaciada para el %).
   - Barra de progreso con gradiente de `primary` a `secondary`.
2. **LÃƒÂ³gica:**
   - ImplementaciÃƒÂ³n de un simulador de progreso inteligente que desacelera al acercarse al 100%, sincronizado con el ciclo de vida de la peticiÃƒÂ³n `fetch`.
   - Manejo de estados `progress` y `loading` para una transiciÃƒÂ³n fluida una vez que los datos estÃƒÂ¡n listos.
3. **UX:** Se aÃƒÂ±adiÃƒÂ³ un delay de 400ms tras alcanzar el 100% para permitir que el usuario perciba la finalizaciÃƒÂ³n del proceso antes de revelar el contenido.

## [Ãƒâ€°XITO] - Sistema de Carga de Noticias para Administradores
**Fecha:** 2026-04-29
**Modo:** Desarrollar
**DescripciÃƒÂ³n:** Se implementÃƒÂ³ una funcionalidad completa para que los administradores puedan publicar noticias locales que se integran automÃƒÂ¡ticamente en el grid de Prensa junto con el feed oficial del MDN.

### Cambios realizados:
1. **Base de Datos:**
   - CreaciÃƒÂ³n de la tabla `news` en Supabase con campos para tÃƒÂ­tulo, resumen, imagen y link externo.
   - ConfiguraciÃƒÂ³n de polÃƒÂ­ticas RLS para lectura pÃƒÂºblica y escritura restringida a usuarios autenticados.
2. **LÃƒÂ³gica de IntegraciÃƒÂ³n:**
   - Se refactorizÃƒÂ³ `newsFetcher.ts` para realizar una carga hÃƒÂ­brida: noticias locales de Supabase (con prioridad) y noticias del feed RSS de AEFIP Nacional.
   - IdentificaciÃƒÂ³n de noticias locales vs externas mediante el flag `isLocal`.
3. **Visual y UX:**
   - **BotÃƒÂ³n de AcciÃƒÂ³n:** Se aÃƒÂ±adiÃƒÂ³ un `Fab` (Floating Action Button) con el icono `+` en la pÃƒÂ¡gina de Prensa, visible ÃƒÂºnicamente para usuarios con rol `admin`.
   - **DiÃƒÂ¡logo de Carga:** CreaciÃƒÂ³n de `AddNewsDialog.tsx` que permite la carga de textos y la subida de imÃƒÂ¡genes directamente a Supabase Storage.
   - **Refresco DinÃƒÂ¡mico:** Se implementÃƒÂ³ una lÃƒÂ³gica de `refreshKey` en `Prensa.tsx` para recargar el listado instantÃƒÂ¡neamente tras una publicaciÃƒÂ³n exitosa.
4. **Seguridad y Permisos:**
  - **VinculaciÃƒÂ³n de DNI:** Se configurÃƒÂ³ explÃƒÂ­citamente el DNI `34185803` como administrador autorizado tanto en el frontend como en las validaciones de carga.
  - **CorrecciÃƒÂ³n de SesiÃƒÂ³n:** Se unificÃƒÂ³ el uso de `current_affiliate` en el `localStorage` para la detecciÃƒÂ³n de roles, asegurando la consistencia con el sistema de login global.
  - **Doble ValidaciÃƒÂ³n:** Se aÃƒÂ±adiÃƒÂ³ una capa de validaciÃƒÂ³n en el cliente dentro de `AddNewsDialog.tsx` para prevenir intentos de inserciÃƒÂ³n no autorizados.
  - **Refinamiento Visual:** Se corrigiÃƒÂ³ un error de renderizado en el borde punteado de la carga de imÃƒÂ¡genes y se eliminÃƒÂ³ el glitch del texto `alt` "titilado" en las tarjetas de prensa mediante el uso de atributos vacÃƒÂ­os y manejo de errores mejorado.
5. **Lectura Detallada de Noticias:**
  - **Nueva Ruta:** ImplementaciÃƒÂ³n de la pÃƒÂ¡gina `NoticiaDetalle.tsx` vinculada a `/prensa/:id`.
  - **Formato de ArtÃƒÂ­culo:** DiseÃƒÂ±o optimizado para lectura larga con tipografÃƒÂ­a de alta legibilidad, soporte para saltos de lÃƒÂ­nea (`pre-wrap`) y visualizaciÃƒÂ³n de imÃƒÂ¡genes destacadas.
  - **NavegaciÃƒÂ³n Inteligente:** Los botones de "Leer MÃƒÂ¡s" detectan automÃƒÂ¡ticamente si la noticia es externa (RSS) o local (Supabase), redirigiendo al usuario al sitio oficial o a la pÃƒÂ¡gina interna respectivamente.
6. **GestiÃƒÂ³n de Contenido (Borrado):**
  - **Icono de Papelera:** Se integrÃƒÂ³ un botÃƒÂ³n de eliminaciÃƒÂ³n (`DeleteIcon`) en la esquina superior derecha de las tarjetas de noticias locales, visible solo para administradores.
  - **ConfirmaciÃƒÂ³n de Seguridad:** ImplementaciÃƒÂ³n de flujo de confirmaciÃƒÂ³n nativo para prevenir eliminaciones accidentales.
  - **SincronizaciÃƒÂ³n en Tiempo Real:** Tras la eliminaciÃƒÂ³n en Supabase, la grilla se actualiza automÃƒÂ¡ticamente mediante el disparo del `onRefresh`.
  - **EstabilizaciÃƒÂ³n de ImÃƒÂ¡genes:** Se optimizÃƒÂ³ la lÃƒÂ³gica de fallbacks en `newsFetcher.ts` y `PrensaCard.tsx` para evitar parpadeos visuales al cargar noticias sin imagen, asegurando transiciones suaves y el uso correcto del logo institucional como placeholder estÃƒÂ¡tico.
  - **Correcciones TÃƒÂ©cnicas:** Se resolviÃƒÂ³ un error de anidamiento HTML (`h5` dentro de `h2`) en el diÃƒÂ¡logo de noticias y se previno un bucle infinito en el manejo de errores de imagen (`onError`) que saturaba la red con peticiones 404.
  - **Compatibilidad de Rutas:** Se ajustaron las referencias a recursos estÃƒÂ¡ticos (logos) para utilizar `import.meta.env.BASE_URL`, asegurando que funcionen correctamente bajo el subdirectorio `/seccional/` definido en la configuraciÃƒÂ³n de Vite.
  - **Banner de Detalle:** Se incorporÃƒÂ³ una imagen de encabezado obligatoria en `NoticiaDetalle.tsx` que utiliza el logo institucional como fallback, manteniendo la integridad visual de los artÃƒÂ­culos sin fotos.
  - **Perfil de Afiliado Extendido:** Se habilitÃ³ la posibilidad de que los afiliados completen su perfil (Email, TelÃ©fono, Fecha de Nacimiento) desde la PWA, con persistencia en Supabase y sincronizaciÃ³n en tiempo real. (Nota: Se eliminÃ³ la secciÃ³n de Capacidades Digitales por solicitud del usuario).
  - **CorrecciÃƒÂ³n TÃƒÂ©cnica (TS):** Se resolviÃƒÂ³ un error de compilaciÃƒÂ³n en `PerfilView.tsx` mediante la correcta importaciÃƒÂ³n de la interfaz `AffiliateData`.



**Modo:** Mejorar
**DescripciÃ³n:** Se resolviÃ³ un error crÃ­tico de compilaciÃ³n por falta del mÃ³dulo InfoCard en AfiliadosManager.tsx mediante la creaciÃ³n de un componente reutilizable y estÃ©ticamente superior.

### Cambios realizados:
1. **Componentes:** CreaciÃ³n de InfoCard.tsx en src/Components/Admin/. Este componente utiliza un diseÃ±o premium con avatares, bordes suavizados y feedback visual de selecciÃ³n (hover effects y glassmorphism sutil).
2. **RefactorizaciÃ³n:** Se reemplazaron las tarjetas de estadÃ­sticas manuales en AfiliadosManager.tsx por el nuevo componente InfoCard, unificando la lÃ³gica visual y mejorando la mantenibilidad.
3. **UX:** Se mejorÃ³ el feedback visual al filtrar por categorÃ­as de afiliados (Aefip, UPS, Jubilados), haciendo que la tarjeta seleccionada destaque con el color temÃ¡tico correspondiente.

### Arquitecturas Aprobadas (ActualizaciÃ³n):
- **UI Admin:** Uso de InfoCard para resÃºmenes de datos y mÃ©tricas clave en paneles administrativos.

## [ÉXITO] - Simplificación del Perfil de Afiliado
**Fecha:** 2026-04-29
**Modo:** Mejorar
**Descripción:** Se eliminó la sección de 'Capacidades Digitales' del perfil del afiliado por no ser considerada de utilidad para el usuario final, simplificando la interfaz y la lógica de datos.

### Cambios realizados:
1. **Visual:** Se eliminaron los switches y el bloque informativo de 'Capacidades Digitales' en PerfilView.tsx.
2. **Lógica:** Se limpiaron las referencias a capacidades_digitales en el estado local, lógica de guardado, persistencia en localStorage y mapeo de login en MobileBeneficiosApp.tsx y MobileLogin.tsx.
3. **Tipos:** Se eliminó el campo del contrato de interfaz AffiliateData en mobile.ts para mantener la integridad del código.

## [ÉXITO] - Migración de Convenios e Interfaz de Beneficios
**Fecha:** 2026-05-18
**Modo:** Mejorar / Desarrollar
**Descripción:** Se migró la totalidad de imágenes de convenios para Catamarca, Jujuy, Santiago del Estero y Tucumán a Supabase Storage y se optimizó la interfaz de tarjetas y de creación de rubros.

### Cambios realizados:
1. **Lógica & Datos (Migración):**
   - Subida de 36 imágenes locales a Supabase Storage en el bucket `benefits` bajo la ruta organizada `convenios/<provincia>/<archivo>.png`.
   - Normalización de acentos para Tucumán (`Tucumán` -> `Tucuman`) en las rutas de almacenamiento para cumplir con las restricciones de Supabase Storage.
   - Asociación del 100% de las imágenes con sus respectivos registros de beneficios en la tabla `benefits` de Supabase mediante un script de Node emparejando por nombre normalizado.
2. **Visual & Accesibilidad (Hotel Colonial):**
   - Se cambió el color de fondo estático blanco (`bgcolor: "#fff"`) del contenedor de la imagen en la tarjeta por `bgcolor: "background.paper"` (dinámico por tema). Esto solucionó el problema donde el logo de "Hotel Colonial" (que tiene texto blanco sobre fondo transparente) era completamente invisible (blanco sobre blanco) en la tarjeta, pero visible en el modal que es naturalmente oscuro.
3. **Visual & UI (Filas de la tarjeta):**
   - Se aumentó `ITEMS_PER_PAGE` de `9` a `15` en `GridBeneficios.tsx` para mostrar 5 filas de 3 tarjetas por página en lugar de 3 filas, aumentando la cantidad de convenios mostrados a la vez.
4. **Lógica & Interactividad (Modal Settings):**
   - Se agregó un botón de acción "+" al lado del campo "Nuevo Rubro" en `BenefitEditModal.tsx`.
   - Al hacer clic, se inserta inmediatamente el nuevo rubro de forma segura en la tabla `benefit_categories` de Supabase, se añade al listado local de rubros y se autoselecciona en el desplegable de rubros adyacente para ahorrar pasos al usuario.
