# Vytal — Tienda online

Sitio de Vytal (Energía + Foco · Lima Limón · Pack x4). HTML, CSS y JavaScript puros: no necesita instalar nada ni compilar.

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Tienda: compra del Pack x4, cotización de envío, carrito, preguntas frecuentes |
| `formula.html` | La fórmula: ingredientes, momentos y beneficios (destino del QR de la lata) |
| `donde.html` | Dónde comprar: mapa con todos los locales y filtros por zona y tipo |
| `contacto.html` | Formulario de contacto |

## Publicar con GitHub Pages

1. Crear un repositorio nuevo en GitHub (por ejemplo `vytal-web`).
2. Subir **todo el contenido de esta carpeta** a la raíz del repositorio (con *Add file → Upload files*, arrastrando todas las carpetas y archivos).
3. Ir a **Settings → Pages**, en *Source* elegir **Deploy from a branch**, rama `main`, carpeta `/ (root)`, y guardar.
4. En uno o dos minutos el sitio queda en `https://TU-USUARIO.github.io/vytal-web/`.
5. Para usar un dominio propio (ej. `vytal.com.ar`), cargarlo en **Settings → Pages → Custom domain** y configurar el DNS como indica GitHub.

> El archivo `.nojekyll` es necesario: evita que GitHub procese el sitio y oculte archivos.

## Dónde se cambia cada cosa

- **Precio, descuento del pack, número de WhatsApp y tarifas de envío:** al principio del bloque "Tienda" en `js/main.js` (`PRODUCTO`, `PACKS`, `WHATSAPP`, `ZONAS_ENVIO`).
- **Locales del mapa:** lista `PUNTOS` al principio de `js/donde.js` (nombre, dirección, coordenadas, zona y tipo).
- **Textos de ingredientes (ventanas emergentes):** lista `INGREDIENTES` en `js/main.js`.
- **Estilos:** `css/tokens.css` (colores y tipografía de marca), `css/styles.css` (base) y `css/tienda.css` (tienda y ajustes).

## Pendiente antes de lanzar

- Reemplazar el número de WhatsApp de prueba (`5491100000000`) en `js/main.js` y en los cuatro HTML.
- Confirmar qué locales del mapa venden Vytal (hoy son comercios reales usados como ejemplo).
- Reemplazar las tarifas de envío de referencia por las reales de Correo Argentino.
- Conectar el botón "Finalizar compra" a una pasarela de pago (hoy envía el pedido por WhatsApp).
- Conectar los formularios de Vytal+, contacto y reseñas a un servicio de envío de datos (hoy solo muestran el mensaje de éxito).
- Apuntar el QR de la lata a `formula.html`.

## Créditos de datos

- Mapa base: © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright).
- Calles de respaldo: [alephcero/bsas_urban_area_streets](https://github.com/alephcero/bsas_urban_area_streets) (OpenStreetMap).
- Límites de partidos: [codeforamerica/click_that_hood](https://github.com/codeforamerica/click_that_hood).
- Animaciones: GSAP y Lenis (en `vendor/`).
