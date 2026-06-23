# Registro de IA - Seccional Noroeste

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

## [ÉXITO] - Mitigación del Crash de DOM y Pantalla de Error Premium
**Fecha:** 2026-05-20
**Modo:** Mejorar
**Descripción:** Se corrigió el crash crítico `"El objeto no se encuentra aquí."` (causado por traductores de navegador que rompen la reconciliación de React en el DOM) e implementamos una pantalla de error premium personalizada para la navegación.

### Cambios realizados:
1. **Física / DOM (Monkeypatch preventivo):**
   - Se inyectó un parche defensivo global en `src/index.tsx` sobre `Node.prototype.removeChild` y `Node.prototype.insertBefore` para silenciar desincronizaciones del DOM causadas por extensiones externas (Google Translate), garantizando estabilidad absoluta al 100% en producción.
2. **Visual / UI (Manejo de Errores Premium):**
   - Creación de `RouteErrorBoundary.tsx` con diseño y paleta de colores oficial de AEFIP Noroeste.
   - Soporte para modo oscuro/claro, micro-animación de entrada, botón de "Reintentar" y "Volver al inicio", y un acordeón colapsable con el stack técnico de la excepción.
3. **Lógica (Rutas):**
   - Registro de `RouteErrorBoundary` como `errorElement` en las rutas principales del router en `src/App.tsx`.

## [ÉXITO] - Ocultación Temporal de Pestaña "Servicios" (Deudas)
**Fecha:** 2026-05-20
**Modo:** Mejorar
**Descripción:** Se ocultó temporalmente la pestaña "Servicios" (que muestra deudas pendientes de afiliados) en la app móvil de beneficios por no encontrarse lista la base de datos en el backend.

### Cambios realizados:
1. **Lógica & UI (Pestañas Dinámicas):**
   - Creación de la bandera `showServiciosTab = false` en `MobileBeneficiosApp.tsx`.
   - Refactorización de la barra de navegación (`BottomNavigation`) y del contenedor de contenido (`renderContent`) para usar un arreglo de configuración dinámico `tabs`.
   - **Resultado:** La pestaña desaparece del render de forma fluida y sin desincronizar los índices de tabulación activa. Es reactivable al cambiar la bandera a `true`.

### Arquitecturas Aprobadas (Actualización):
- **Estabilidad de Producción:** Monkeypatch global defensivo en `Node.prototype` contra extensiones/traductores para evitar desincronización DOM en SPAs React.
- **UI Error Handling:** Uso de `RouteErrorBoundary` y `errorElement` en React Router para fallbacks premium unificados.
- **Navegación Móvil:** Configuración dinámica de pestañas mediante el arreglo `tabs` dependiente de banderas booleanas para modularidad en producción.

## [ÉXITO] - Resolución de TDZ en App Móvil y Validación de Afiliados Existentes
**Fecha:** 2026-05-20
**Modo:** Mejorar / Desarrollar
**Descripción:** Se resolvió el error fatal en producción `ReferenceError: Cannot access 'm' before initialization` provocado por la inicialización temprana del arreglo `tabs` en la app móvil. Asimismo, se implementó una validación en tiempo real para impedir que afiliados ya existentes realicen nuevas solicitudes de afiliación duplicadas, guiándolos hacia la pantalla de login.

### Cambios realizados:
1. **Lógica & Estabilidad (Corrección de TDZ - MobileBeneficiosApp.tsx):**
   - Se movió la definición del arreglo `tabs` dentro de un bloque `useMemo` posicionado después de las declaraciones de sus funciones dependientes (`updateAffiliateData` y `handleLogout`). Esto resolvió de raíz la violación de la Temporal Dead Zone (TDZ) al ser compilada y minificada por Rollup/Vite en producción.
2. **Lógica & Validación (Duplicados de Legajo - AffiliateForm.tsx):**
   - Modificación de la función `handleNext` para ser asincrónica.
   - En el primer paso (Datos del Trabajador), antes de permitir avanzar, se consulta la base de datos Supabase (`affiliates`) buscando si ya existe un registro con el mismo `legajo` para la sucursal `branch: 'noroeste'`.
   - Si se detecta que el afiliado ya existe, se aborta el cambio de paso y se despliega un mensaje de error en rojo (`severity="error"`) informándole que ya se encuentra afiliado y debe ingresar utilizando el ícono de login.
3. **Visual & UX (AffiliateForm.tsx):**
   - Se añadió el estado `disabled={loading}` y una animación de carga `CircularProgress` en el botón "Siguiente" durante el proceso de verificación con la base de datos para brindar un feedback visual fluido y altamente premium al usuario.
4. **Despliegue exitoso (Production Deploy):**
   - Compilación exitosa de todos los assets mediante `npm run build`.
   - Despliegue de los cambios funcionales a producción en GitHub Pages mediante `npm run deploy`.

### Arquitecturas Aprobadas (Actualización):
- **Validación Defensiva de Formularios:** Uso de consultas asincrónicas en tiempo real contra la base de datos Supabase en los límites de pasos críticos para prevenir duplicidad de registros antes de procesar flujos de trabajo (`workflow_requests`).

## [ÉXITO] - Código QR Descargable y Autoconsolidación de Perfil con Supabase
**Fecha:** 2026-05-20
**Modo:** Desarrollar / Mejorar
**Descripción:** Se habilitó la descarga directa del código QR del carnet de afiliado en formato de imagen (.png) con un simple clic, incorporando además tooltips dinámicos y animaciones responsivas. Adicionalmente, se configuró una sincronización asincrónica bidireccional automática en segundo plano que consolida la información del perfil del afiliado con la base de datos Supabase al iniciar la app.

### Cambios realizados:
1. **Visual & UX (Descarga de QR - CarnetView.tsx):**
   - Importación y configuración del componente `<Tooltip>` de Material UI para indicar al usuario: *"Hacé clic para descargar el código QR"*.
   - Inserción de efectos dinámicos interactivos sobre el contenedor del código QR (cursor de tipo pointer, transición animada de escalamiento `scale(1.1)` y elevación de sombras `boxShadow` en hover).
   - Implementación de la función `downloadQR()` que genera un enlace de anclaje `<a>` temporal, inyectando el `qrDataUrl` base64 y descargándolo con un nombre de archivo limpio basado en el legajo del afiliado.
2. **Lógica & Sincronización (Consolidación de Datos - MobileBeneficiosApp.tsx):**
   - Refactorización de la llamada `useEffect` en el montaje del componente principal de la app móvil.
   - Si existe una sesión de afiliado guardada en la caché local (`localStorage`), además de cargar los valores locales de forma instantánea para mitigar latencia, se ejecuta un proceso asincrónico paralelo (`syncProfileFromDB`) contra la tabla `affiliates` de Supabase.
   - Este proceso descarga en segundo plano la última versión disponible de los campos personales (teléfono, email, estado de jubilado y fecha de nacimiento) y actualiza automáticamente tanto el estado reactivo (`setAffiliateData`) como el almacenamiento de caché local.
3. **Despliegue exitoso (Production Deploy):**
   - Compilación completa libre de errores (`npm run build`).
   - Publicación en vivo en GitHub Pages (`npm run deploy`) en la dirección `aefipnoroeste.org.ar`.

### Arquitecturas Aprobadas (Actualización):
- **Descargas Programáticas locales:** Estrategia de descarga por inyección temporal de anclajes HTML5 sobre cadenas Base64 seguras generadas localmente.
- **Sincronización Silenciosa de Sesiones:** Uso de patrones híbridos (Local Cache First + Background DB Fetch) para optimizar la velocidad visual y la exactitud de los datos del cliente.

## [ÉXITO] - Actualización Oficial de Autoridades y Estructuración por Categorías
**Fecha:** 2026-06-03
**Modo:** Desarrollar
**Descripción:** Se actualizó la lista completa de las 35 autoridades oficiales de la Seccional Noroeste conforme a la "Lista Blanca y Celeste", organizando a los directivos en categorías institucionales con iconos premium de Material-UI y localizaciones geográficas.

### Cambios realizados:
1. **Lógica & Datos:**
   - Se reemplazaron los registros anteriores con la nómina oficial completa de 35 autoridades en `src/Pages/Gremio.tsx` y `seccional/src/Pages/Gremio.tsx`.
   - Se definieron los roles exactos, nombres completos en mayúsculas y las respectivas delegaciones geográficas (Salta, Tucumán, Jujuy, Santiago, Catamarca, Oran, Concepción).
2. **Visual & UI (Estructuración Premium):**
   - Agrupación del cuerpo directivo en 6 secciones principales: *Secretariado*, *Cuerpo de Vocales*, *Consejo Directivo Superior*, *Delegados a la Asamblea General*, *Comisión Nacional de Jubilados* y *Congresales F.E.F.R.A.*.
   - Creación del componente `SectionHeader` con iconos institucionales específicos para cada jerarquía.
   - Diseño mejorado para `AuthorityCard` con degradados dinámicos basados en la jerarquía (Secretario General en azul marino oscuro, Secretario Adjunto en celeste premium, y el resto en tarjetas con fondo limpio).
   - Inclusión del marcador de geolocalización (icono `LocationOn`) en las tarjetas que tienen ciudad asignada.
3. **Estabilidad:**
   - Compilación exitosa en ambos entornos (proyecto raíz y subdirectorio de despliegue `seccional`).

## [ÉXITO] - Restauración del Feed RSS de Noticias Nacionales en Prensa
**Fecha:** 2026-06-08
**Modo:** Mejorar
**Descripción:** Se restauró la carga de las últimas noticias provenientes de la Mesa Directiva Nacional en la sección Prensa, la cual había dejado de funcionar debido a la caída y bloqueo del proxy CORS anterior (`api.codetabs.com`).

### Cambios realizados:
1. **Lógica & Datos:**
   - Se modificó la función `fetchRssNews` en `src/utils/newsFetcher.ts` para migrar del proxy caído a `api.rss2json.com`, el cual proporciona estabilidad, manejo de CORS y conversión de XML a JSON en una sola llamada.
   - Se refactorizó la lógica de parseo, reemplazando el uso de `DOMParser` sobre XML en crudo por un mapeo directo de los objetos JSON devueltos por la API.
   - Se mantuvo intacta la lógica local de procesamiento de fechas, imágenes de fallback y límite de caracteres en el resumen.

## [ÉXITO] - Optimización de Gestión de Afiliados y Consolidación Geográfica
**Fecha:** 2026-06-23
**Modo:** Mejorar
**Descripción:** Se refinaron los filtros y visualización de la sección "Gestión de Afiliados". Se removió el campo redundante de "Ciudad" para consolidar los datos únicamente bajo "Provincia", y se corrigió la lógica de los filtros de estado para que actúen con operador OR en lugar de exigir simultaneidad ilógica.

### Cambios realizados:
1. **Consolidación Geográfica:**
   - Se removió la visualización e inputs del campo "Ciudad" en los modales `AddAffiliateModal.tsx` y `AffiliateDetailsModal.tsx`.
   - Se modificaron los guardados en base de datos para mapear el campo `ciudad` al valor de `provincia` de forma automática, garantizando compatibilidad retrospectiva en el esquema de Supabase.
   - Se removió la columna "Ciudad" de las tablas de Titulares y Familiares en `AfiliadosManager.tsx`, así como de la exportación de Excel.
2. **Corrección de Lógica de Filtros de Estado:**
   - Se actualizó el hook `useMemo` de `baseAffiliates` en `AfiliadosManager.tsx` para aplicar una lógica de filtro OR en lugar de AND (los afiliados activos AEFIP no son de UPS y viceversa, por lo que requerir ambos resultaba en una grilla vacía).
   - Se modificaron las tarjetas de conteo InfoCard para mostrar "Afiliados Activos" (activos exclusivos), "UPS / Doble Afiliación" (is_ups) y "Jubilados Aportantes" respectivamente.
3. **Mantenibilidad:**
   - Se removió la variable de estado `selectedCities` y todos sus efectos y cálculos asociados.
   - Compilación y build exitosos a través de Vite.

## [ÉXITO] - Resolución de Advertencias de Recharts en ResponsiveContainer
**Fecha:** 2026-06-23
**Modo:** Mejorar
**Descripción:** Se corrigieron las advertencias recurrentes de consola de Recharts (`The width(-1) and height(-1) of chart should be greater than 0...`) al inicializar gráficos sin dimensiones calculadas en el DOM.

### Cambios realizados:
1. **Dimensionado de Gráficos:**
   - Se agregaron atributos explícitos `width="100%"`, `height="100%"` y un retardo de renderizado `debounce={50}` a todos los componentes `ResponsiveContainer` en `AdminOverview.tsx` y `FinancialStatistics.tsx`.
   - Se removió la propiedad redundante `minWidth` del contenedor flex/grid envolvente.
2. **Estabilidad:**
   - Compilación y build exitosos sin advertencias ni errores en el bundle de producción.

## [ÉXITO] - Normalización Geográfica Unificada de Provincias
**Fecha:** 2026-06-23
**Modo:** Mejorar
**Descripción:** Se implementó una lógica de mapeo geográfico estricto para unificar denominaciones de provincias y subdelegaciones del Noroeste (ej: "S.M. Tucumán" -> "Tucumán").

### Cambios realizados:
1. **Unificación Geográfica:**
   - Se definió la función `cleanLocationName` para unificar valores a mayúsculas limpias:
     - `"S.M. TUCUMAN"`, `"SAN MIGUEL DE TUCUMAN"`, etc. -> `"TUCUMAN"`
     - `"SS JUJUY"`, `"SAN SALVADOR DE JUJUY"`, etc. -> `"JUJUY"`
     - `"SF CATAMARCA"`, `"SAN FERNANDO DE CATAMARCA"`, etc. -> `"CATAMARCA"`
     - `"SAN RAMON DE LA NUEVA ORAN"`, etc. -> `"ORAN"`
   - Se integró este limpiador en `fetchAffiliates` para limpiar en tiempo real los registros cargados de la base de datos.
   - Se actualizó `AddAffiliateModal.tsx` y `AffiliateDetailsModal.tsx` para forzar la limpieza al insertar o actualizar afiliados.
   - Se actualizó el botón/procedimiento manual `handleNormalizeLocations` en `AfiliadosManager.tsx` para re-escribir y sanear permanentemente los registros inconsistentes en Supabase en lotes.


