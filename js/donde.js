/* ==========================================================================
   Vytal — Dónde comprar: un mapa con TODOS los locales + listado filtrable.
   - Fondo: mapa estándar de OpenStreetMap (como cualquier buscador de sucursales).
   - Si el navegador o la vista previa bloquean ese fondo, se dibuja uno propio con
     los mismos colores, a partir de datos de OpenStreetMap incluidos en el sitio
     (data/calles.json: calles, avenidas, autopistas, costa y partidos del AMBA).
   - Locales: comercios reales con su dirección (datos de Google Maps, octubre 2026).
     Son de ejemplo: confirmar cuáles venden Vytal antes de publicar.
   ========================================================================== */
(() => {
  'use strict';
  const PUNTOS = [
    // Dietéticas · CABA
    { tipo: 'dietetica', zona: 'caba', nombre: 'Dietética Pistacho', dir: 'Av. Díaz Vélez 4507, Caballito, CABA', lat: -34.608593, lng: -58.430951, pid: 'ChIJjSOMbxzLvJURnlUA5naADPA' },
    { tipo: 'dietetica', zona: 'caba', nombre: 'Dietética Natural Soho', dir: 'Jorge Luis Borges 1805, Palermo, CABA', lat: -34.587388, lng: -58.427896, pid: 'ChIJAWEMzRK1vJUREl91qYWlcNE' },
    { tipo: 'dietetica', zona: 'caba', nombre: 'Mercado Natural Lafinur', dir: 'Lafinur 2914, Palermo Botánico, CABA', lat: -34.58145, lng: -58.415272, pid: 'ChIJc_12xMm1vJUR7NvN6i_NECE' },
    { tipo: 'dietetica', zona: 'caba', nombre: 'La Dietética Belgrano', dir: 'Av. Cabildo 2399, Belgrano, CABA', lat: -34.559122, lng: -58.458794, pid: 'ChIJ33cNueS1vJURE3eP9QKU__c' },
    { tipo: 'dietetica', zona: 'caba', nombre: 'New Garden Belgrano', dir: 'Av. Juramento 2612, Belgrano, CABA', lat: -34.563316, lng: -58.458712, pid: 'ChIJF10gQNS1vJUR6ZLU1erQJ5o' },
    { tipo: 'dietetica', zona: 'caba', nombre: 'Puna Dietética', dir: 'Av. Álvarez Thomas 3300, Villa Urquiza, CABA', lat: -34.57095, lng: -58.484228, pid: 'ChIJyxqhGD-3vJURyF8gwv5ECLQ' },
    { tipo: 'dietetica', zona: 'caba', nombre: 'Dietética La Gioconda', dir: 'Junín 1295, Recoleta, CABA', lat: -34.593249, lng: -58.396808, pid: 'ChIJiR_1opfKvJURP_Me79z7ygU' },
    { tipo: 'dietetica', zona: 'caba', nombre: 'Hoppy Dietética Recoleta', dir: 'Av. Córdoba 1429, Recoleta, CABA', lat: -34.599171, lng: -58.387449, pid: 'ChIJqTSAhHvLvJUR-Lm9nhu6SDQ' },
    // Dietéticas · GBA
    { tipo: 'dietetica', zona: 'gba', nombre: 'Naturvida', dir: 'Gral. Julio A. Roca 1489, Vicente López', lat: -34.526356, lng: -58.4818, pid: 'ChIJGQfSTUuxvJURJ59LISInJR4' },
    { tipo: 'dietetica', zona: 'gba', nombre: 'Dietética Callao San Isidro', dir: '9 de Julio 401, San Isidro', lat: -34.468953, lng: -58.510774, pid: 'ChIJc4Vhek6xvJUR8lcPrCee_kE' },
    { tipo: 'dietetica', zona: 'gba', nombre: 'La Natu Almacén Nutricional', dir: 'Av. Andrés Rolón 401, San Isidro', lat: -34.478076, lng: -58.529268, pid: 'ChIJWW3EqhaxvJUR5T7aMqKieOE' },
    { tipo: 'dietetica', zona: 'gba', nombre: 'Dietética Gran Lanús', dir: 'Anatole France 1884, Lanús', lat: -34.707604, lng: -58.388267, pid: 'ChIJA9knmSTNvJURxLSUsmQha88' },
    { tipo: 'dietetica', zona: 'gba', nombre: 'Dietética Buena Vida', dir: 'Bolívar 486, Ramos Mejía', lat: -34.644894, lng: -58.563097, pid: 'ChIJU39MfObHvJURtO4RhmPf7YI' },
    { tipo: 'dietetica', zona: 'gba', nombre: 'Honey Queen Dietética', dir: 'Bartolomé Mitre 51, Ramos Mejía', lat: -34.64164, lng: -58.563484, pid: 'ChIJmyTCBOXHvJUR2e2R9PKc58M' },
    { tipo: 'dietetica', zona: 'gba', nombre: 'Eco Natura Dietética', dir: 'Triunvirato 1444, Quilmes', lat: -34.740981, lng: -58.268053, pid: 'ChIJJXgUET8vo5UR9k4S2x3S4-o' },
    // Canchas de pádel
    { tipo: 'padel', zona: 'caba', nombre: 'Babolat Padel Center', dir: 'Av. Figueroa Alcorta 7101, Núñez, CABA', lat: -34.54736, lng: -58.443731, pid: 'ChIJcRCjape1vJURH5ylY7yPCWw' },
    { tipo: 'padel', zona: 'caba', nombre: 'Distrito Padel', dir: 'Av. Sarmiento 4270, Palermo, CABA', lat: -34.567231, lng: -58.405924, pid: 'ChIJ84IDjXq1vJURLFB3u6VoZKM' },
    { tipo: 'padel', zona: 'caba', nombre: 'Aráoz Padel', dir: 'Aráoz 2456, Palermo, CABA', lat: -34.58614, lng: -58.41591, pid: 'ChIJy_dWrn61vJUR01IdzPWyOIM' },
    { tipo: 'padel', zona: 'caba', nombre: 'World Padel Center Caballito', dir: 'Cucha Cucha 951, Caballito, CABA', lat: -34.611179, lng: -58.448594, pid: 'ChIJvy65fyHLvJURWRN1pjFUPQI' },
    { tipo: 'padel', zona: 'gba', nombre: 'EpicMax Club Deportivo', dir: 'Av. del Libertador 661, Vicente López', lat: -34.528358, lng: -58.470482, pid: 'ChIJK1zFCwC3vJURnlYnwZ7cqsk' },
    { tipo: 'padel', zona: 'gba', nombre: 'La Zona Sport Padel', dir: 'Francisco N. de Laprida 4556, Vicente López', lat: -34.552015, lng: -58.512761, pid: 'ChIJoecYWQC3vJUR4Ia_yWfcsE8' },
    { tipo: 'padel', zona: 'gba', nombre: 'Modena Padel Center', dir: 'Av. Bartolomé Mitre 1924, Avellaneda', lat: -34.669336, lng: -58.354502, pid: 'ChIJo57BGfMzo5UR068VwQdG6qw' },
    { tipo: 'padel', zona: 'gba', nombre: 'Avellaneda Padel Club', dir: 'Av. Rivadavia 640, Avellaneda', lat: -34.668466, lng: -58.388193, pid: 'ChIJQcfj77LNvJURd1TcDncAhLM' },
    // Gimnasios
    { tipo: 'gimnasio', zona: 'caba', nombre: 'SportClub Puerto Madero', dir: 'Juana Manso 295, Puerto Madero, CABA', lat: -34.600553, lng: -58.364002, pid: 'ChIJxYGjpDE1o5URaie8I-xiyDs' },
    { tipo: 'gimnasio', zona: 'caba', nombre: 'Megatlon Puerto Madero', dir: 'Av. Alicia Moreau de Justo 1600, Puerto Madero, CABA', lat: -34.616912, lng: -58.365187, pid: 'ChIJbfzZvNY0o5URSU9uCulm0D0' },
    { tipo: 'gimnasio', zona: 'caba', nombre: 'Coliseum Fitness Center', dir: 'Av. Corrientes 5645, Villa Crespo, CABA', lat: -34.595951, lng: -58.442834, pid: 'ChIJWdoUowzKvJURNyUMl38959I' },
    { tipo: 'gimnasio', zona: 'caba', nombre: 'Sportfitness Belgrano', dir: 'Blanco Encalada 2635, Belgrano, CABA', lat: -34.560402, lng: -58.461329, pid: 'ChIJgynuLQC1vJURlrFTgkWLRK0' },
    { tipo: 'gimnasio', zona: 'gba', nombre: 'Viva Training Club Martínez', dir: 'Av. Santa Fe 2836, Martínez', lat: -34.497113, lng: -58.497517, pid: 'ChIJYWjR63GxvJURSax2NcXYNHA' },
    { tipo: 'gimnasio', zona: 'gba', nombre: 'CrossFit Ramos Mejía', dir: 'Av. Gral. San Martín 680, Ramos Mejía', lat: -34.647657, lng: -58.557309, pid: 'ChIJPw0QgODHvJUR2a0rFiO6KBU' },
    // Kioscos universitarios
    { tipo: 'universidad', zona: 'caba', nombre: 'Kiosco UADE', lugar: 'UADE', dir: 'Lima 757, Monserrat, CABA', lat: -34.617048, lng: -58.381919, pid: 'ChIJNZvIarrKvJURp2WmvEzCLRo' },
    { tipo: 'universidad', zona: 'caba', nombre: 'Kiosco UCES', lugar: 'UCES', dir: 'Paraguay 1318, Recoleta, CABA', lat: -34.598317, lng: -58.385879, pid: 'ChIJf7mavLjKvJURW54DZvHhg70' },
    { tipo: 'universidad', zona: 'caba', nombre: 'Kiosco UCA', lugar: 'UCA Santa María de los Buenos Aires', dir: 'Av. Alicia Moreau de Justo 1300, Puerto Madero, CABA', lat: -34.613644, lng: -58.365791, pid: 'ChIJ7cyrKCo1o5URSYt2BByzoAc' },
    { tipo: 'universidad', zona: 'gba', nombre: 'Kiosco Universidad de San Andrés', lugar: 'Universidad de San Andrés', dir: 'Vito Dumas 284, Victoria, San Fernando', lat: -34.446423, lng: -58.531124, pid: 'ChIJkU6gyumvvJURC-xRQWUNIKs' },
  ];
  const TIPOS = {
    dietetica: { label: 'Dietética', color: '#7FA313' },
    padel: { label: 'Cancha de pádel', color: '#2F6FB0' },
    gimnasio: { label: 'Gimnasio', color: '#1C2E1C' },
    universidad: { label: 'Kiosco universitario', color: '#D9534F' },
  };
  const ZONAS = { caba: 'CABA', gba: 'GBA' };
  const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.3"/></svg>';
  // Google Maps abre la ficha exacta del local (nombre + dirección + id de lugar)
  const urlGoogle = (p) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((p.lugar || p.nombre) + ', ' + p.dir)}&query_place_id=${p.pid}`;

  const lista = document.querySelector('[data-lista-puntos]');
  const lienzo = document.querySelector('[data-mapa-puntos]');
  const vacio = document.querySelector('[data-lista-vacia]');
  if (!lista || !lienzo) return;

  const estado = { tipo: 'todos', zona: 'todas', activo: -1 };

  lista.innerHTML = PUNTOS.map((p, i) => `
    <li class="punto-venta" data-punto="${i}" tabindex="0" role="button" aria-label="Ver ${p.nombre} en el mapa">
      <span class="punto-venta__icono" style="--c:${TIPOS[p.tipo].color}">${PIN}</span>
      <div>
        <span class="punto-venta__tipo">${TIPOS[p.tipo].label} · ${ZONAS[p.zona]}</span>
        <h4>${p.nombre}</h4>
        <p>${p.dir}</p>
        <a class="punto-venta__link" href="${urlGoogle(p)}" target="_blank" rel="noopener">Cómo llegar →</a>
      </div>
    </li>`).join('');
  const items = [...lista.querySelectorAll('[data-punto]')];

  if (typeof window.L === 'undefined') { lienzo.innerHTML = '<p class="mapa__sin">No se pudo cargar el mapa. Usá “Cómo llegar” en cada local.</p>'; }
  const mapa = typeof window.L !== 'undefined' ? L.map(lienzo, { scrollWheelZoom: false, minZoom: 10, maxZoom: 18, zoomSnap: 0.5 }) : null;

  // ---------------------------------------------------------------- marcadores
  const marcadores = !mapa ? [] : PUNTOS.map((p, i) => {
    const icono = L.divIcon({ className: 'marcador', html: `<span class="marcador__pin" style="--c:${TIPOS[p.tipo].color}"></span>`, iconSize: [28, 36], iconAnchor: [14, 34], popupAnchor: [0, -32] });
    return L.marker([p.lat, p.lng], { icon: icono, title: p.nombre, riseOnHover: true, zIndexOffset: 1000 })
      .bindPopup(`<div class="popup-vytal"><span class="popup-vytal__tipo">${TIPOS[p.tipo].label} · ${ZONAS[p.zona]}</span><b>${p.nombre}</b><span>${p.dir}</span><a href="${urlGoogle(p)}" target="_blank" rel="noopener">Cómo llegar en Google Maps →</a></div>`)
      .on('click', () => marcar(i, true));
  });

  // ---------------------------------------------------------------- fondo
  if (mapa) {
    mapa.setView([-34.60, -58.44], 11);
    mapa.once('click', () => mapa.scrollWheelZoom.enable());
    mapa.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    const propio = fondoPropio(mapa);
    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">colaboradores de OpenStreetMap</a>',
    });
    let cargo = false;
    osm.on('tileload', () => { if (!cargo) { cargo = true; propio.quitar(); } });
    osm.on('tileerror', () => { if (!cargo && mapa.hasLayer(osm)) { mapa.removeLayer(osm); propio.mostrar(); } });
    osm.addTo(mapa);
    // si en 4 s no llegó ninguna imagen del fondo real, queda el propio
    setTimeout(() => { if (!cargo) { if (mapa.hasLayer(osm)) mapa.removeLayer(osm); propio.mostrar(); } }, 4000);
  }

  function marcar(i, desdeMapa = false) {
    estado.activo = i;
    items.forEach((el, j) => el.classList.toggle('is-activo', j === i));
    if (mapa) {
      if (!desdeMapa) mapa.flyTo([PUNTOS[i].lat, PUNTOS[i].lng], 16, { duration: 0.8 });
      marcadores[i].openPopup();
    }
    if (desdeMapa && items[i]) items[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  items.forEach((el, i) => {
    el.addEventListener('click', (e) => { if (e.target.closest('a')) return; marcar(i); });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); marcar(i); } });
  });

  // ---------------------------------------------------------------- filtros (zona × tipo)
  const botonesTipo = [...document.querySelectorAll('[data-filtro]')];
  const botonesZona = [...document.querySelectorAll('[data-zona]')];
  const visibles = () => PUNTOS.map((_, i) => i).filter((i) =>
    (estado.tipo === 'todos' || PUNTOS[i].tipo === estado.tipo) && (estado.zona === 'todas' || PUNTOS[i].zona === estado.zona));
  const encuadrar = (ver) => { if (mapa && ver.length) mapa.fitBounds(ver.map((i) => [PUNTOS[i].lat, PUNTOS[i].lng]), { padding: [36, 36], maxZoom: 15 }); };
  const aplicar = () => {
    botonesTipo.forEach((b) => { const on = b.dataset.filtro === estado.tipo; b.classList.toggle('is-activo', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    botonesZona.forEach((b) => { const on = b.dataset.zona === estado.zona; b.classList.toggle('is-activo', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    document.querySelectorAll('[data-filtro-cuenta]').forEach((el) => {
      const k = el.dataset.filtroCuenta;
      el.textContent = PUNTOS.filter((p) => (k === 'todos' || p.tipo === k) && (estado.zona === 'todas' || p.zona === estado.zona)).length;
    });
    const ver = visibles();
    items.forEach((el, i) => { el.hidden = !ver.includes(i); el.classList.remove('is-activo'); });
    if (vacio) vacio.hidden = ver.length > 0;
    lista.scrollTop = 0;
    if (mapa) {
      mapa.closePopup();
      marcadores.forEach((m, i) => { if (ver.includes(i)) m.addTo(mapa); else m.remove(); });
      encuadrar(ver);
    }
  };
  botonesTipo.forEach((b) => b.addEventListener('click', () => { estado.tipo = b.dataset.filtro; aplicar(); }));
  botonesZona.forEach((b) => b.addEventListener('click', () => { estado.zona = b.dataset.zona; aplicar(); }));
  aplicar();
  if (mapa) [300, 1200].forEach((t) => setTimeout(() => { mapa.invalidateSize(); if (estado.activo < 0) encuadrar(visibles()); }, t));

  // ---------------------------------------------------------------- fondo propio con estilo OpenStreetMap
  function fondoPropio(m) {
    const canvas = L.canvas({ padding: 0.4 });
    const grupo = L.layerGroup();
    const capas = { base: L.layerGroup().addTo(grupo), calles: L.layerGroup().addTo(grupo), nombres: L.layerGroup().addTo(grupo) };
    // colores del mapa estándar de OpenStreetMap
    const ESTILO = {
      1: { relleno: '#E892A2', borde: '#C24E6B', w: [2.5, 4, 7, 10], desde: 10 },   // autopista
      2: { relleno: '#FCD6A4', borde: '#B98A42', w: [1.6, 3, 6, 9], desde: 10 },    // avenida principal
      3: { relleno: '#F7FABF', borde: '#9AA04A', w: [1, 2.2, 4.5, 7.5], desde: 11 }, // secundaria
      4: { relleno: '#FFFFFF', borde: '#B7B1A6', w: [0, 1.4, 3.5, 6], desde: 13 },   // terciaria
      5: { relleno: '#FFFFFF', borde: '#CCC6BA', w: [0, 0.9, 2.6, 5], desde: 14 },   // calle
    };
    const grosor = (cls, z) => { const w = ESTILO[cls].w; return z < 12 ? w[0] : z < 14 ? w[1] : z < 16 ? w[2] : w[3]; };
    const limpiar = (n) => (n || '').split(' / ')[0].replace(/\s*\([^)]*\)/g, '').replace(/^Avenida /, 'Av. ').replace(/^Autopista /, 'Au. ').trim();
    const decodificar = (flat) => { const o = []; let a = 0, b = 0; for (let i = 0; i < flat.length; i += 2) { a += flat[i]; b += flat[i + 1]; o.push([a / 1e5, b / 1e5]); } return o; };
    let lineas = [], cargado = false, visible = false;

    const dibujarCalles = () => {
      if (!cargado || !visible) return;
      const z = m.getZoom();
      capas.calles.clearLayers();
      [5, 4, 3, 2, 1].forEach((cls) => {
        if (z < ESTILO[cls].desde) return;
        const w = grosor(cls, z); if (!w) return;
        const de = lineas.filter((l) => l.cls === cls);
        de.forEach((l) => L.polyline(l.pts, { renderer: canvas, color: ESTILO[cls].borde, weight: w + (z >= 14 ? 1.8 : 1), interactive: false, lineCap: 'round', lineJoin: 'round' }).addTo(capas.calles));
        de.forEach((l) => L.polyline(l.pts, { renderer: canvas, color: ESTILO[cls].relleno, weight: w, interactive: false, lineCap: 'round', lineJoin: 'round' }).addTo(capas.calles));
      });
      ponerNombres();
    };
    const ponerNombres = () => {
      capas.nombres.clearLayers();
      if (!cargado || !visible) return;
      const z = m.getZoom();
      if (z < 13) return;
      const vista = m.getBounds().pad(-0.03);
      const usados = []; let n = 0;
      const tope = z >= 15 ? 5 : z >= 14 ? 4 : 3;
      for (const l of lineas) {
        if (n > 80) break;
        if (!l.nombre || l.cls > tope) continue;
        const dentro = l.pts.filter((pt) => vista.contains(pt));
        if (dentro.length < 2) continue;
        const a = m.latLngToContainerPoint(dentro[0]), b = m.latLngToContainerPoint(dentro[dentro.length - 1]);
        if (a.distanceTo(b) < l.nombre.length * 6.4 * 1.2) continue;
        const mid = L.point((a.x + b.x) / 2, (a.y + b.y) / 2);
        if (usados.some((u) => u.distanceTo(mid) < 80)) continue;
        let ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
        usados.push(mid); n++;
        L.marker(m.containerPointToLatLng(mid), { interactive: false, keyboard: false,
          icon: L.divIcon({ className: 'calle-nombre' + (l.cls <= 2 ? ' calle-nombre--av' : ''), html: `<span style="transform:translate(-50%,-50%) rotate(${ang.toFixed(1)}deg)">${l.nombre}</span>`, iconSize: [0, 0] }) }).addTo(capas.nombres);
      }
    };
    const cargar = () => fetch('data/calles.json').then((r) => r.json()).then((d) => {
      lineas = [...d.M, ...d.m].map(([cls, ni, flat]) => ({ cls, nombre: limpiar(d.n[ni]), pts: decodificar(flat) }))
        .sort((x, y) => x.cls - y.cls);
      const costa = d.costa.slice().reverse();
      L.polygon(costa.concat([[-34.85, -58.0], [-34.30, -58.0], [-34.30, costa[0][1]]]), { renderer: canvas, stroke: false, fillColor: '#AAD3DF', fillOpacity: 1, interactive: false }).addTo(capas.base);
      (d.barrios || []).forEach((pa) => {
        pa.a.forEach((anillo) => L.polygon(anillo, { renderer: canvas, color: '#A79BC2', weight: 1.4, dashArray: '6 4', fill: false, interactive: false }).addTo(capas.base));
        L.marker(pa.c, { interactive: false, keyboard: false, icon: L.divIcon({ className: 'mapa-etiqueta mapa-etiqueta--partido', html: `<span>${pa.n.replace(/ De /g, ' de ')}</span>`, iconSize: [0, 0] }) }).addTo(capas.base);
      });
      L.marker([-34.605, -58.445], { interactive: false, icon: L.divIcon({ className: 'mapa-etiqueta mapa-etiqueta--caba', html: '<span>Ciudad de Buenos Aires</span>', iconSize: [0, 0] }) }).addTo(capas.base);
      L.marker([-34.56, -58.33], { interactive: false, icon: L.divIcon({ className: 'mapa-etiqueta mapa-etiqueta--agua', html: '<span>Río de la Plata</span>', iconSize: [0, 0] }) }).addTo(capas.base);
      cargado = true;
      dibujarCalles();
    }).catch(() => {});
    m.on('zoomend', dibujarCalles);
    m.on('moveend', ponerNombres);
    return {
      mostrar() { if (visible) return; visible = true; lienzo.classList.add('mapa__lienzo--propio'); grupo.addTo(m); if (!cargado) cargar(); else dibujarCalles(); },
      quitar() { visible = false; lienzo.classList.remove('mapa__lienzo--propio'); m.removeLayer(grupo); },
    };
  }
})();
