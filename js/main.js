/* ==========================================================================
   Vytal — main.js. Dirección de arte aprobada en direccion-de-arte.html.
   ========================================================================== */
(() => {
  'use strict';
  const d = document;
  const html = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const safe = (fn) => { try { fn(); } catch (e) { console.warn('[vytal]', e); } };

  const M = { ease: 'power3.out', easeIO: 'power2.inOut', pop: 'back.out(1.3)', dur: 0.95, stagger: 0.08, dist: 30, lerp: 0.1 };

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    ScrollTrigger.config({ ignoreMobileResize: true });
  } else {
    html.classList.remove('js');
  }

  // ---------------------------------------------------------------------
  // Lenis
  // ---------------------------------------------------------------------
  let lenis = null;
  if (hasGSAP && !RM && window.Lenis && M.lerp) {
    lenis = new Lenis({ lerp: M.lerp, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el, instant) => {
    // Comprar ya tiene su propio espacio para el menú: se alinea al borde para que la foto llene la pantalla.
    // El resto: la sección queda centrada en el espacio libre debajo de la cabecera; si es más alta que la
    // pantalla, se recorta parte del aire de arriba para que se vea el contenido y no el relleno.
    let off = 0;
    if (el.id !== 'comprar') {
      const cab = $('.cabecera');
      const h = cab ? cab.offsetHeight : 0;
      const libre = window.innerHeight - h;
      const alto = el.offsetHeight;
      if (alto <= libre) off = -(h + (libre - alto) / 2);
      else {
        const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0;
        off = -h + Math.min(Math.max(padTop - 28, 0), alto - libre);
      }
    }
    if (lenis) lenis.scrollTo(el, { offset: off, duration: instant ? 0 : 1.3, immediate: !!instant });
    else el.scrollIntoView({ behavior: RM || instant ? 'auto' : 'smooth' });
  };
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || a.target === '_blank') return;
    let url; try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;
    const hash = url.hash;
    const el = hash.length > 1 && d.getElementById(hash.slice(1));
    if (!el) return;
    e.preventDefault();
    cerrarMenu();
    scrollToEl(el);
    history.replaceState(null, '', hash);
  });

  // ---------------------------------------------------------------------
  // Nav: fondo al bajar + menú móvil
  // ---------------------------------------------------------------------
  const nav = $('[data-nav]');
  const onScrollNav = () => { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 10); };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  const menuMovil = $('[data-menu-movil]');
  const btnMenu = $('[data-abrir-menu]');
  const abrirMenu = () => { if (!menuMovil) return; menuMovil.classList.add('is-open'); btnMenu && btnMenu.setAttribute('aria-expanded', 'true'); lenis && lenis.stop(); };
  const cerrarMenu = () => { if (!menuMovil) return; menuMovil.classList.remove('is-open'); btnMenu && btnMenu.setAttribute('aria-expanded', 'false'); lenis && lenis.start(); };
  btnMenu && btnMenu.addEventListener('click', () => { menuMovil.classList.contains('is-open') ? cerrarMenu() : abrirMenu(); });
  $$('[data-cerrar-menu]').forEach((a) => a.addEventListener('click', cerrarMenu));

  // ---------------------------------------------------------------------
  // Modal Vytal+
  // ---------------------------------------------------------------------
  const overlay = $('[data-modal-vytalmas]');
  const abrirModal = () => { if (!overlay) return; overlay.classList.add('is-open'); lenis && lenis.stop(); };
  const cerrarModalFn = () => { if (!overlay) return; overlay.classList.remove('is-open'); lenis && lenis.start(); };
  if (overlay) {
    // Aparece al entrar al sitio, una vez por visita: con varias páginas no se repite en cada una
    let visto = false;
    try { visto = sessionStorage.getItem('vytal-vm-visto') === '1'; } catch (err) { /* sin storage: se muestra */ }
    if (!visto) {
      setTimeout(abrirModal, 150);
      try { sessionStorage.setItem('vytal-vm-visto', '1'); } catch (err) { /* nada */ }
    }
    $$('[data-abrir-vytalmas]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); cerrarMenu(); abrirModal(); }));
    $$('[data-cerrar-modal]').forEach((b) => b.addEventListener('click', cerrarModalFn));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrarModalFn(); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') { cerrarModalFn(); cerrarCarrito(); cerrarModalIngrediente(); cerrarMediosPago(); } });
    const form = $('[data-form-vytalmas]');
    const checkVm = form && $('.vm__check input', form);
    checkVm && checkVm.addEventListener('change', () => checkVm.closest('.vm__check').classList.remove('is-error'));
    form && form.addEventListener('submit', (e) => {
      e.preventDefault();
      const check = $('.vm__check', form);
      const checkInput = check && $('input', check);
      if (check) check.classList.toggle('is-error', !checkInput.checked);
      if (!form.checkValidity()) { form.reportValidity(); return; }
      $('[data-modal-caja]').classList.add('is-exito');
      setTimeout(cerrarModalFn, 2600);
    });
  }

  // ---------------------------------------------------------------------
  // Reseñas: todavía no hay; las estrellas vacías abren el formulario.
  // Nota: la reseña no se guarda en ningún lado todavía (falta el sistema de reseñas del servidor).
  // ---------------------------------------------------------------------
  const modalResena = $('[data-modal-resena]');
  if (modalResena) {
    const formResena = $('[data-form-resena]', modalResena);
    const exitoResena = $('[data-resena-exito]', modalResena);
    const errorPuntaje = $('[data-resena-error]', modalResena);
    const abrirResena = (puntaje) => {
      formResena.reset(); formResena.hidden = false; exitoResena.hidden = true; errorPuntaje.hidden = true;
      if (puntaje) { const r = $(`#rs-${puntaje}`, modalResena); if (r) r.checked = true; }
      modalResena.classList.add('is-open'); lenis && lenis.stop();
      setTimeout(() => { const f = $(puntaje ? '#rs-nombre' : `#rs-5`, modalResena); f && f.focus(); }, 60);
    };
    const cerrarResena = () => { modalResena.classList.remove('is-open'); lenis && lenis.start(); };
    $$('[data-abrir-resena]').forEach((b) => b.addEventListener('click', () => abrirResena(0)));
    $$('[data-resena-estrella]').forEach((b) => b.addEventListener('click', () => abrirResena(+b.dataset.resenaEstrella)));
    $$('[data-cerrar-resena]').forEach((b) => b.addEventListener('click', cerrarResena));
    modalResena.addEventListener('click', (e) => { if (e.target === modalResena) cerrarResena(); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarResena(); });
    $$('input[name="puntaje"]', formResena).forEach((r) => r.addEventListener('change', () => { errorPuntaje.hidden = true; }));
    formResena.addEventListener('submit', (e) => {
      e.preventDefault();
      const tienePuntaje = !!$('input[name="puntaje"]:checked', formResena);
      errorPuntaje.hidden = tienePuntaje;
      if (!tienePuntaje) return;
      if (!formResena.checkValidity()) { formResena.reportValidity(); return; }
      formResena.hidden = true; exitoResena.hidden = false;
      setTimeout(cerrarResena, 2600);
    });
  }

  // ---------------------------------------------------------------------
  // Formulario de contacto
  // ---------------------------------------------------------------------
  const formContacto = $('[data-form-contacto]');
  formContacto && formContacto.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!formContacto.checkValidity()) { formContacto.reportValidity(); return; }
    formContacto.hidden = true;
    const exito = $('[data-contacto-exito]');
    if (exito) exito.hidden = false;
  });

  // ---------------------------------------------------------------------
  // Tienda: packs, precio, carrito (sin pasarela de pago todavía: el pedido
  // se cierra por WhatsApp). El carrito se recuerda entre páginas de la visita.
  // ---------------------------------------------------------------------
  const PRODUCTO = { nombre: 'Vytal Lima Limón', precio: 4690 };
  // Online se vende solo el pack x4. descuento: 0.10 = 10% menos sobre el precio de 4 latas.
  const PACKS = {
    4: { nombre: 'Pack x4', latas: 4, descuento: 0, img: 'img/pack-x4.jpg' },
  };
  const WHATSAPP = '5491100000000';
  const DESC_VYTALMAS = 0.05;
  const IVA = 1.21; // 21%, alícuota general de IVA en Argentina
  const fmt = (n) => '$' + Math.round(n).toLocaleString('es-AR');
  const fmtCentavos = (n) => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const precioPack = (n) => PACKS[n].latas * PRODUCTO.precio * (1 - PACKS[n].descuento);

  const carrito = { cantidad: 1, items: [] };
  try { const g = JSON.parse(sessionStorage.getItem('vytal-carrito') || '[]'); if (Array.isArray(g)) carrito.items = g.filter((it) => PACKS[it.pack] && it.cantidad > 0); } catch (err) { /* carrito vacío */ }
  const guardarCarrito = () => { try { sessionStorage.setItem('vytal-carrito', JSON.stringify(carrito.items)); } catch (err) { /* nada */ } };

  // Envío: cotización de referencia de Correo Argentino según código postal y cantidad de packs.
  // VALORES INVENTADOS para el prototipo: reemplazar por la tarifa real o por la API del correo.
  const ZONAS_ENVIO = [
    { nombre: 'CABA', desde: 1000, hasta: 1499, domicilio: 6900, sucursal: 4900, dias: [2, 4] },
    { nombre: 'GBA', desde: 1500, hasta: 1999, domicilio: 8400, sucursal: 5900, dias: [3, 5] },
    { nombre: 'Interior', desde: 2000, hasta: 3999, domicilio: 11200, sucursal: 7800, dias: [4, 7] },
    { nombre: 'Interior', desde: 5000, hasta: 7999, domicilio: 11200, sucursal: 7800, dias: [4, 7] },
    { nombre: 'Norte y Litoral', desde: 4000, hasta: 4999, domicilio: 14500, sucursal: 9900, dias: [5, 9] },
    { nombre: 'Patagonia', desde: 8000, hasta: 9999, domicilio: 14500, sucursal: 9900, dias: [5, 9] },
  ];
  const EXTRA_POR_PACK = { domicilio: 1300, sucursal: 900 }; // cada pack adicional pesa ~1,6 kg
  const cotizar = (cp, packs) => {
    const z = ZONAS_ENVIO.find((x) => cp >= x.desde && cp <= x.hasta);
    if (!z) return null;
    const extra = Math.max(packs - 1, 0);
    return {
      zona: z.nombre,
      domicilio: { precio: z.domicilio + extra * EXTRA_POR_PACK.domicilio, dias: z.dias },
      sucursal: { precio: z.sucursal + extra * EXTRA_POR_PACK.sucursal, dias: [z.dias[0], z.dias[1] - 1] },
    };
  };
  let envio = null; // { cp, tipo: 'domicilio' | 'sucursal' }
  try { envio = JSON.parse(sessionStorage.getItem('vytal-envio') || 'null'); } catch (err) { envio = null; }
  const guardarEnvio = () => { try { sessionStorage.setItem('vytal-envio', JSON.stringify(envio)); } catch (err) { /* nada */ } };
  const ETIQ_ENVIO = { domicilio: 'A domicilio', sucursal: 'Retiro en sucursal' };

  const cantidadEl = $('[data-cantidad-valor]');
  const precioTotalEl = $('[data-precio-total]');
  const precioBotonEl = $('[data-precio-boton]');
  const precioDetalleEl = $('[data-precio-detalle]');
  const precioSinImpEl = $('[data-precio-sin-impuestos]');
  const precioVytalmasEl = $('[data-precio-vytalmas]');
  const ayudaEl = $('[data-cantidad-ayuda]');
  const barraDetalleEl = $('[data-barra-detalle]');
  const fotoPresentacionEl = $('[data-foto-presentacion]');
  const fotoFondoEl = $('[data-foto-fondo]');
  const visualEl = $('[data-presentacion-visual]');
  const presentacionActiva = 4;

  // Precios de cada tarjeta de pack
  Object.keys(PACKS).forEach((n) => {
    const p = PACKS[n];
    const precioEl = $(`[data-pack-precio="${n}"]`);
    const unitEl = $(`[data-pack-unit="${n}"]`);
    const ahorroEl = $(`[data-pack-ahorro="${n}"]`);
    if (precioEl) precioEl.textContent = fmt(precioPack(n));
    if (unitEl) unitEl.textContent = `${fmt(precioPack(n) / p.latas)} c/u`;
    if (ahorroEl && p.descuento > 0) { ahorroEl.hidden = false; ahorroEl.textContent = `Ahorrás ${Math.round(p.descuento * 100)}%`; }
  });

  // Cambia la foto principal. Los packs vienen recortados, sin fondo.
  const ponerFoto = (foto) => {
    if (!fotoPresentacionEl || fotoPresentacionEl.getAttribute('src') === foto.src) return;
    fotoPresentacionEl.style.opacity = '0';
    setTimeout(() => {
      fotoPresentacionEl.src = foto.src;
      fotoPresentacionEl.alt = foto.alt || '';
      if (fotoFondoEl && !foto.recorte) fotoFondoEl.src = foto.src;
      visualEl && visualEl.classList.toggle('es-recorte', !!foto.recorte);
      fotoPresentacionEl.style.opacity = '1';
    }, 150);
  };

  // Galería: fotos de la lata y del pack (esta última viene recortada, sin fondo)
  $$('[data-miniatura]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-miniatura]').forEach((o) => o.classList.toggle('is-activa', o === b));
    ponerFoto({ src: b.dataset.src, alt: b.dataset.alt || '', recorte: !!b.dataset.recorte });
  }));

  const pintarPrecio = () => {
    const pack = PACKS[presentacionActiva];
    const totalUnidades = carrito.cantidad * pack.latas;
    const total = carrito.cantidad * precioPack(presentacionActiva);
    if (precioTotalEl) precioTotalEl.textContent = fmt(total);
    if (precioBotonEl) precioBotonEl.textContent = fmt(total);
    if (precioSinImpEl) precioSinImpEl.textContent = fmtCentavos(total / IVA);
    if (precioVytalmasEl) precioVytalmasEl.textContent = fmt(total * (1 - DESC_VYTALMAS));
    if (precioDetalleEl) precioDetalleEl.textContent = carrito.cantidad === 1 ? 'Pack x4 · 4 latas de 354 ml' : `${carrito.cantidad} packs x4 · ${totalUnidades} latas`;
    if (ayudaEl) ayudaEl.textContent = `${totalUnidades} latas`;
    if (barraDetalleEl) barraDetalleEl.textContent = `${carrito.cantidad > 1 ? carrito.cantidad + ' packs · ' : ''}${fmt(total)}`;
    pintarMediosDePago(total);
  };
  $('[data-cantidad-mas]') && $('[data-cantidad-mas]').addEventListener('click', () => {
    carrito.cantidad = Math.min(carrito.cantidad + 1, 24);
    if (cantidadEl) cantidadEl.textContent = carrito.cantidad;
    pintarPrecio();
  });
  $('[data-cantidad-menos]') && $('[data-cantidad-menos]').addEventListener('click', () => {
    carrito.cantidad = Math.max(carrito.cantidad - 1, 1);
    if (cantidadEl) cantidadEl.textContent = carrito.cantidad;
    pintarPrecio();
  });

  // ---------------------------------------------------------------------
  // Modal "Medios de pago"
  // ---------------------------------------------------------------------
  const modalMedios = $('[data-modal-medios]');
  const pintarMediosDePago = (total) => {
    if (!modalMedios) return;
    $$('[data-medios-base], [data-medios-base-4]', modalMedios).forEach((e) => { e.textContent = fmt(total); });
    const mpEl = $('[data-medios-mp]', modalMedios);
    const trEl = $('[data-medios-transferencia]', modalMedios);
    const vmEl = $('[data-medios-vytalmas]', modalMedios);
    if (mpEl) mpEl.textContent = fmt(total);
    if (trEl) trEl.textContent = fmt(total);
    if (vmEl) vmEl.textContent = fmt(total * (1 - DESC_VYTALMAS));
  };
  const abrirMediosPago = () => { if (!modalMedios) return; modalMedios.classList.add('is-open'); lenis && lenis.stop(); };
  const cerrarMediosPago = () => { if (!modalMedios) return; modalMedios.classList.remove('is-open'); lenis && lenis.start(); };
  $('[data-abrir-medios-pago]') && $('[data-abrir-medios-pago]').addEventListener('click', abrirMediosPago);
  $$('[data-cerrar-modal-medios]').forEach((b) => b.addEventListener('click', cerrarMediosPago));
  modalMedios && modalMedios.addEventListener('click', (e) => { if (e.target === modalMedios) cerrarMediosPago(); });

  pintarPrecio();

  const carritoDrawer = $('[data-carrito]');
  const scrim = $('[data-scrim]');
  const abrirCarrito = () => { if (!carritoDrawer) return; carritoDrawer.classList.add('is-open'); scrim && scrim.classList.add('is-open'); carritoDrawer.setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); };
  const cerrarCarrito = () => { if (!carritoDrawer) return; carritoDrawer.classList.remove('is-open'); scrim && scrim.classList.remove('is-open'); carritoDrawer.setAttribute('aria-hidden', 'true'); lenis && lenis.start(); };
  $$('[data-abrir-carrito]').forEach((b) => b.addEventListener('click', abrirCarrito));
  $$('[data-cerrar-carrito]').forEach((b) => b.addEventListener('click', cerrarCarrito));
  scrim && scrim.addEventListener('click', cerrarCarrito);
  if (!overlay) d.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarCarrito(); });

  const itemsEl = $('[data-carrito-items]');
  const pintarCarrito = () => {
    const totalEl = $('[data-carrito-total]');
    const subtotalEl = $('[data-carrito-subtotal]');
    const descuentoEl = $('[data-carrito-descuento]');
    const cuentaEl = $('[data-cuenta-carrito]');
    const finalizarEl = $('[data-finalizar]');
    const totalUnidades = carrito.items.reduce((a, it) => a + it.cantidad * PACKS[it.pack].latas, 0);
    const totalPacks = carrito.items.reduce((a, it) => a + it.cantidad, 0);
    const subtotal = carrito.items.reduce((a, it) => a + it.cantidad * precioPack(it.pack), 0);
    const cot = envio && totalPacks ? cotizar(envio.cp, totalPacks) : null;
    const costoEnvio = cot ? cot[envio.tipo].precio : 0;
    const descuento = subtotal * DESC_VYTALMAS;
    const total = subtotal - descuento + costoEnvio; // total del pedido − 5% Vytal+ + envío
    const envioFila = $('[data-carrito-envio]');
    if (envioFila) {
      envioFila.hidden = !cot;
      if (cot) {
        $('[data-carrito-envio-label]').textContent = `Envío ${envio.tipo === 'domicilio' ? 'a domicilio' : 'a sucursal'} · ${cot.zona} (CP ${envio.cp})`;
        $('[data-carrito-envio-precio]').textContent = fmt(costoEnvio);
      }
    }
    const envioAviso = $('[data-carrito-envio-aviso]');
    if (envioAviso) envioAviso.hidden = !!cot || !totalPacks;
    if (cuentaEl) { cuentaEl.textContent = totalPacks; cuentaEl.hidden = totalPacks === 0; } // cantidad de packs, no de latas
    if (totalEl) totalEl.textContent = fmt(total);
    if (subtotalEl) subtotalEl.textContent = fmt(subtotal);
    if (descuentoEl) descuentoEl.textContent = '−' + fmt(descuento);
    if (finalizarEl) {
      const lineas = carrito.items.map((it) => `• ${it.cantidad} × ${PRODUCTO.nombre} ${PACKS[it.pack].nombre} (${it.cantidad * PACKS[it.pack].latas} latas)`);
      if (cot) lineas.push(`• Envío Correo Argentino ${ETIQ_ENVIO[envio.tipo].toLowerCase()}, CP ${envio.cp}: ${fmt(costoEnvio)}`);
      const texto = `Hola! Quiero hacer este pedido:\n${lineas.join('\n')}\nSubtotal: ${fmt(subtotal)}\nDescuento Vytal+ (−5%): −${fmt(descuento)}${cot ? '' : '\nEnvío: a cotizar'}\nTotal: ${fmt(total)}`;
      finalizarEl.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
      finalizarEl.setAttribute('aria-disabled', carrito.items.length ? 'false' : 'true');
    }
    if (!itemsEl) return;
    if (!carrito.items.length) { itemsEl.innerHTML = '<p class="carrito-vacio">Todavía no agregaste nada.</p>'; return; }
    itemsEl.innerHTML = carrito.items.map((it, i) => {
      const p = PACKS[it.pack];
      return `
      <div class="carrito-item">
        <img src="${p.img}" alt="" width="58" height="58">
        <div class="carrito-item__info"><b>${PRODUCTO.nombre} · ${p.nombre}</b><span>${it.cantidad * p.latas} ${it.cantidad * p.latas === 1 ? 'lata' : 'latas'} de 354 ml</span>
          <div class="carrito-item__acciones">
            <button type="button" data-item-menos="${i}" aria-label="Restar uno">−</button><output>${it.cantidad}</output><button type="button" data-item-mas="${i}" aria-label="Sumar uno">+</button>
            <button type="button" class="carrito-item__quitar" data-item-quitar="${i}">Quitar</button>
          </div>
        </div>
        <span class="carrito-item__precio">${fmt(it.cantidad * precioPack(it.pack))}</span>
      </div>`;
    }).join('');
  };
  itemsEl && itemsEl.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const i = +(b.dataset.itemMenos ?? b.dataset.itemMas ?? b.dataset.itemQuitar);
    const it = carrito.items[i];
    if (!it) return;
    if ('itemMas' in b.dataset) it.cantidad = Math.min(it.cantidad + 1, 24);
    else if ('itemMenos' in b.dataset) it.cantidad -= 1;
    else it.cantidad = 0;
    carrito.items = carrito.items.filter((x) => x.cantidad > 0);
    guardarCarrito();
    pintarCarrito();
  });

  const agregarAlCarrito = () => {
    const existente = carrito.items.find((it) => it.pack === presentacionActiva);
    if (existente) existente.cantidad = Math.min(existente.cantidad + carrito.cantidad, 24);
    else carrito.items.push({ pack: presentacionActiva, cantidad: carrito.cantidad });
    guardarCarrito();
    pintarCarrito();
    abrirCarrito();
  };
  $('[data-agregar-carrito]') && $('[data-agregar-carrito]').addEventListener('click', agregarAlCarrito);
  pintarCarrito();

  // ---------------------------------------------------------------------
  // Barra fija de compra (celular): aparece siempre que el botón principal no está a la vista
  // ---------------------------------------------------------------------
  const barra = $('[data-barra-compra]');
  const botonPrincipal = $('[data-agregar-carrito]');
  if (barra && botonPrincipal && 'IntersectionObserver' in window) {
    const barraBtn = $('[data-barra-agregar]', barra);
    barraBtn && barraBtn.addEventListener('click', agregarAlCarrito);
    const pie = $('.pie');
    let pasoBoton = false, enPie = false;
    const actualizarBarra = () => {
      const ver = pasoBoton && !enPie;
      barra.classList.toggle('is-visible', ver);
      barra.setAttribute('aria-hidden', ver ? 'false' : 'true');
      barraBtn && (barraBtn.tabIndex = ver ? 0 : -1);
      d.body.classList.toggle('con-barra', ver);
    };
    new IntersectionObserver(([en]) => { pasoBoton = !en.isIntersecting; actualizarBarra(); }).observe(botonPrincipal);
    pie && new IntersectionObserver(([en]) => { enPie = en.isIntersecting; actualizarBarra(); }).observe(pie);
  }

  // ---------------------------------------------------------------------
  // Código postal: cotización de referencia de Correo Argentino (a domicilio y a sucursal)
  // ---------------------------------------------------------------------
  const cpInput = $('#cp-input');
  const cpResultado = $('[data-cp-resultado]');
  const rangoDias = (d) => `${d[0]} a ${d[1]} días hábiles`;
  const pintarCotizacion = () => {
    if (!cpInput || !cpResultado) return;
    const cp = +cpInput.value.trim();
    const cot = cotizar(cp, carrito.cantidad);
    if (!cot) { cpResultado.innerHTML = 'Ingresá un código postal válido de 4 dígitos.'; cpResultado.classList.remove('is-ok'); return; }
    const elegido = envio && envio.cp === cp ? envio.tipo : 'domicilio';
    if (!envio || envio.cp !== cp) { envio = { cp, tipo: elegido }; guardarEnvio(); pintarCarrito(); }
    const opcion = (tipo, titulo) => `
      <label class="envio-op${elegido === tipo ? ' is-elegido' : ''}">
        <input type="radio" name="envio-tipo" value="${tipo}"${elegido === tipo ? ' checked' : ''}>
        <span class="envio-op__txt"><b>${titulo}</b><small>${rangoDias(cot[tipo].dias)}</small></span>
        <span class="envio-op__precio">${fmt(cot[tipo].precio)}</span>
      </label>`;
    cpResultado.classList.add('is-ok');
    cpResultado.innerHTML = `
      <span class="envio__cabecera"><span class="envio__correo">Correo Argentino</span> CP ${cp} · ${cot.zona}${carrito.cantidad > 1 ? ` · ${carrito.cantidad} packs` : ''}</span>
      ${opcion('domicilio', 'A domicilio')}
      ${opcion('sucursal', 'Retiro en sucursal')}`;
  };
  const cpBtn = $('[data-cp-verificar]');
  cpBtn && cpBtn.addEventListener('click', pintarCotizacion);
  cpInput && cpInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); pintarCotizacion(); } });
  cpInput && cpInput.addEventListener('input', () => { cpInput.value = cpInput.value.replace(/\D/g, '').slice(0, 4); });
  cpResultado && cpResultado.addEventListener('change', (e) => {
    if (e.target.name !== 'envio-tipo' || !envio) return;
    envio.tipo = e.target.value; guardarEnvio(); pintarCarrito(); pintarCotizacion();
  });
  // al cambiar la cantidad de packs, la cotización se actualiza
  $$('[data-cantidad-mas], [data-cantidad-menos]').forEach((b) => b.addEventListener('click', () => { if (cpResultado && cpResultado.classList.contains('is-ok')) pintarCotizacion(); }));
  if (cpInput && envio && envio.cp) { cpInput.value = String(envio.cp); pintarCotizacion(); }

  // ---------------------------------------------------------------------
  // Ingredientes interactivos: tocar un punto abre su ficha con foto,
  // deslizar la lata recorre el resaltado. Copy real de vytal.pages.dev.
  // ---------------------------------------------------------------------
  const INGREDIENTES = [
    { key: 'cafeina', titulo: 'Cafeína natural + L‑teanina', tagline: 'Energía estable, sin picos ni caídas.',
      texto: 'La cafeína de origen natural, del extracto de té verde, aporta la energía. La L‑teanina se incorpora para moderar el nerviosismo asociado a la cafeína, y la taurina acompaña el aporte energético.',
      momento: 'Maratón de estudio', foto: 'img/foto-estudio.jpg', pos: '88% 50%' },
    { key: 'vitaminab', titulo: 'Vitamina B', tagline: 'Menos cansancio, energía todo el día.',
      texto: 'Las vitaminas del complejo B están orientadas a reducir el cansancio y la fatiga, para sostener la energía a lo largo del día.',
      momento: 'Jornada larga de trabajo', foto: 'img/foto-trabajo.jpg', pos: '8% 50%' },
    { key: 'ginseng', titulo: 'Ginseng', tagline: 'Concentración y foco mental.',
      texto: 'El ginseng panax es un adaptógeno orientado a la concentración: claridad para rendir en el estudio y en el trabajo.',
      momento: 'Retomar el foco', foto: 'img/foto-tarde.jpg', pos: '40% 50%' },
    { key: 'azucar', titulo: '0 azúcar, 0 calorías', tagline: 'Toda la energía, sin azúcar.',
      texto: 'Sin azúcar agregada, sin sodio y con 0 calorías. Endulzada con sucralosa. Una energía para tu día a día, sin sellos de advertencia en el envase.',
      momento: 'Después de entrenar', foto: 'img/foto-entreno.jpg', pos: '42% 50%' },
  ];
  const puntos = $$('.punto');
  let ingredienteActivo = -1;
  const resaltarIngrediente = (idx) => {
    if (!puntos.length) return;
    idx = ((idx % puntos.length) + puntos.length) % puntos.length;
    ingredienteActivo = idx;
    puntos.forEach((p, i) => { p.classList.toggle('is-activo', i === idx); p.setAttribute('aria-pressed', i === idx ? 'true' : 'false'); });
  };

  // Modal con foto, igual al de vytal.pages.dev
  const modalIng = $('[data-modal-ingrediente]');
  const pintarModalIngrediente = (idx) => {
    const data = INGREDIENTES[idx];
    if (!data || !modalIng) return;
    $('[data-mi-foto]', modalIng).src = data.foto;
    $('[data-mi-foto]', modalIng).alt = data.titulo;
    $('[data-mi-foto]', modalIng).style.objectPosition = data.pos || '50% 50%';
    $('[data-mi-num]', modalIng).textContent = String(idx + 1).padStart(2, '0');
    $('[data-mi-momento-foto]', modalIng).textContent = data.momento;
    $('[data-mi-contador]', modalIng).textContent = `Ingrediente ${idx + 1} / ${INGREDIENTES.length}`;
    $('[data-mi-titulo]', modalIng).textContent = data.titulo;
    $('[data-mi-tagline]', modalIng).textContent = data.tagline;
    $('[data-mi-desc]', modalIng).textContent = data.texto;
    $('[data-mi-momento]', modalIng).textContent = data.momento;
  };
  const abrirModalIngrediente = (idx) => {
    resaltarIngrediente(idx);
    pintarModalIngrediente(ingredienteActivo);
    if (!modalIng) return;
    modalIng.classList.add('is-open');
    lenis && lenis.stop();
  };
  const cerrarModalIngrediente = () => {
    if (!modalIng) return;
    modalIng.classList.remove('is-open');
    lenis && lenis.start();
  };
  if (modalIng) {
    $$('[data-cerrar-modal-ingrediente]').forEach((b) => b.addEventListener('click', cerrarModalIngrediente));
    modalIng.addEventListener('click', (e) => { if (e.target === modalIng) cerrarModalIngrediente(); });
    const btnAnt = $('[data-mi-anterior]'), btnSig = $('[data-mi-siguiente]');
    btnAnt && btnAnt.addEventListener('click', () => abrirModalIngrediente(ingredienteActivo - 1));
    btnSig && btnSig.addEventListener('click', () => abrirModalIngrediente(ingredienteActivo + 1));
  }

  puntos.forEach((p, i) => {
    p.addEventListener('click', () => abrirModalIngrediente(i));
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirModalIngrediente(i); } });
  });

  // Las tarjetas de "Momentos Vytal" abren la misma ficha del ingrediente correspondiente
  $$('.momento[data-ingrediente]').forEach((card) => {
    const idx = INGREDIENTES.findIndex((ing) => ing.key === card.dataset.ingrediente);
    if (idx > -1) card.addEventListener('click', () => abrirModalIngrediente(idx));
  });

  // Deslizar la lata: un swipe horizontal (mouse o dedo) recorre el resaltado
  const lataPin = $('[data-pin-lata]');
  if (lataPin && puntos.length) {
    let startX = null;
    const onStart = (x) => { startX = x; };
    const onEnd = (x) => {
      if (startX === null) return;
      const delta = x - startX;
      if (Math.abs(delta) > 36) resaltarIngrediente(ingredienteActivo + (delta < 0 ? 1 : -1));
      startX = null;
    };
    lataPin.addEventListener('pointerdown', (e) => onStart(e.clientX));
    lataPin.addEventListener('pointerup', (e) => onEnd(e.clientX));
    lataPin.addEventListener('click', () => abrirModalIngrediente(ingredienteActivo + 1));
    lataPin.style.cursor = 'grab';
  }

  // ---------------------------------------------------------------------
  // Si no hay GSAP: contadores fijos y nada más que animar
  // ---------------------------------------------------------------------
  if (!hasGSAP) return;

  if (RM) {
    $$('[data-count]').forEach((el) => { el.textContent = el.dataset.count; });
    return;
  }

  // ---------------------------------------------------------------------
  // Firma de la portada: isotipo + título por líneas + cinta hasta el botón
  // ---------------------------------------------------------------------
  gsap.set('.hero__line-in', { yPercent: 130, y: 0 });
  gsap.set('.nav__logo img', { scale: 0.8, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set('.ingredientes__lata-wrap', { scale: 0.4, opacity: 0, rotate: -22, transformOrigin: '50% 100%' });
  gsap.set('.punto', { scale: 0.5, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set('.ingredientes__disco', { scale: 0.6, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set('.ingredientes__orbita', { opacity: 0 });

  const trazarCamino = () => {
    const svg = $('.portada .camino');
    const desde = $('[data-camino-desde]');
    const hasta = $('[data-camino-hasta]');
    if (!svg || !desde || !hasta) return null;
    const h = svg.getBoundingClientRect();
    const a = desde.getBoundingClientRect();
    const b = hasta.getBoundingClientRect();
    const x1 = a.left + a.width * 0.5 - h.left, y1 = a.top + a.height * 0.3 - h.top;
    const x2 = b.left + b.width * 0.5 - h.left, y2 = b.top - h.top;
    const ym = (y1 + y2) / 2;
    svg.setAttribute('viewBox', `0 0 ${h.width} ${h.height}`);
    const path = $('path', svg);
    path.setAttribute('d', `M${x1},${y1} C${x1 - 60},${ym} ${x2 + 90},${ym} ${x2},${y2}`);
    return path;
  };
  const dibujarCamino = (path) => {
    if (!path) return gsap.timeline();
    const L = path.getTotalLength();
    return gsap.timeline().fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: M.dur * 1.5, ease: M.ease });
  };

  function heroIntro() {
    const camino = trazarCamino();
    gsap.timeline({ defaults: { ease: M.ease } })
      .to('.hero__line-in', { yPercent: 0, duration: M.dur * 1.25, stagger: M.stagger * 1.3 }, 0.15)
      .to('.ingredientes__disco', { scale: 1, opacity: 1, duration: M.dur * 1.2, ease: M.ease }, 0.1)
      .to('.ingredientes__orbita', { opacity: 1, duration: M.dur * 1.4 }, 0.2)
      .to('.ingredientes__lata-wrap', { scale: 1, opacity: 1, rotate: -2, duration: M.dur * 1.3, ease: M.pop }, 0.35)
      .to('.punto', { scale: 1, opacity: 1, duration: M.dur * 0.9, stagger: 0.09, ease: M.pop }, 0.75)
      .from('.hero__lead', { y: M.dist * 0.7, opacity: 0, duration: M.dur }, 0.4)
      .from('.hero__badges li', { y: M.dist * 0.6, opacity: 0, duration: M.dur * 0.8, stagger: 0.06 }, 0.5)
      .from('.hero__actions > *', { y: M.dist * 0.7, opacity: 0, duration: M.dur, stagger: M.stagger }, 0.6)
      .from('.cabecera', { y: -30, opacity: 0, duration: M.dur }, 0.2)
      .to('.nav__logo img', { scale: 1, opacity: 1, duration: M.dur, ease: M.pop }, 0.3)
      .from('.hero__scroll', { opacity: 0, duration: M.dur }, 0.8)
      .add(dibujarCamino(camino), '-=0.35');
  }
  Promise.race([d.fonts ? d.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]).then(() => {
    heroIntro();
    ScrollTrigger.refresh();
  });

  let anchoCamino = window.innerWidth, rCamino;
  window.addEventListener('resize', () => {
    if (window.innerWidth === anchoCamino) return;
    anchoCamino = window.innerWidth;
    clearTimeout(rCamino);
    rCamino = setTimeout(() => safe(() => {
      const path = trazarCamino();
      if (path) gsap.set(path, { strokeDasharray: 'none', strokeDashoffset: 0 });
    }), 200);
  });

  // ---------------------------------------------------------------------
  // Revelado general
  // ---------------------------------------------------------------------
  gsap.set('[data-reveal]', { y: M.dist, opacity: 0 });
  safe(() => {
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: M.dur, ease: M.ease, stagger: Math.min(M.stagger, 0.6 / batch.length), overwrite: true }),
    });
  });

  // ---------------------------------------------------------------------
  // Trazos que se dibujan
  // ---------------------------------------------------------------------
  safe(() => {
    $$('[data-draw]').forEach((svg) => {
      const lines = $$('path, line, polyline, circle, ellipse, rect', svg);
      lines.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
      gsap.to(lines, { strokeDashoffset: 0, duration: M.dur * 1.5, stagger: M.stagger, ease: M.ease,
        scrollTrigger: { trigger: svg, start: 'top 85%', once: true } });
    });
  });

  // ---------------------------------------------------------------------
  // Contadores (cifras reales del HTML)
  // ---------------------------------------------------------------------
  safe(() => {
    $$('[data-count]').forEach((el) => {
      const destino = +el.dataset.count;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: destino, duration: 1.4, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.v); },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });
  });

  // El primer ingrediente queda seleccionado por defecto (igual que vytal.pages.dev)
  safe(() => { if (puntos.length) resaltarIngrediente(0); });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
