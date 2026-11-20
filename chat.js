/* Asistente Inovation Store — bot de atención a clientes, 100% en el navegador.
   Sin API ni backend: responde por palabras clave con los precios y datos
   REALES de la tienda. Si no sabe algo, lo dice y ofrece WhatsApp/contacto.
   Nunca inventa precios ni productos. */
(function () {
  'use strict';

  var WHATSAPP_PAGE = 'contacto.html';

  /* Enlace de WhatsApp Business. Por ahora abre contacto.html (donde está
     el QR). Cuando Alberto dé su número, cambiar aquí a:
     'https://wa.me/<numero>' — NO inventar un número. */
  var WA_LINK = 'https://wa.me/525636858623?text=Hola%20Inovation%20Store%2C%20quiero%20informaci%C3%B3n%20sobre%20sus%20productos';

  function normalize(s) {
    return (s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function has(n, words) {
    for (var i = 0; i < words.length; i++) {
      if (n.indexOf(words[i]) !== -1) return true;
    }
    return false;
  }
  function link(href, text) {
    return '<a href="' + href + '">' + text + '</a>';
  }

  var PRICE_EDREDON = 'Edredones hipoalergénicos: Individual $999 · Matrimonial $1,099 · Queen $1,199 · King $1,299 · King Jumbo $1,499 MXN. <br>Ver todos: ' + link('edredones.html', 'Edredones');
  var PRICE_SABANA = 'Sábanas estilo egipcio: Individual $500 · Matrimonial $600 · Queen $700 · King $800 MXN. <br>Ver colores y tamaños: ' + link('sabanas.html', 'Sábanas');
  var PRICE_ALMOHADA = 'Almohadas de bambú Memory Foam: Standard $800 una / $1,500 el par · King $900 una / $1,700 el par. <br>Ver: ' + link('almohadas.html', 'Almohadas de bambú');
  var PRICE_CORTINA = 'Cortinas Blackout Thermal, 17 colores (Chocolate, Turquesa, Verde salvia, Turquesa marino, Rojo, Piedra, Negro, Morado, Marrón, Marrón cebada, Marino, Gris carbón, Ciruela, Gris, Mineral, Pink y Perla):<br>· 1.01 × 1.60 m: $550 (1 panel) / $850 (2 paneles)<br>· 1.01 × 2.13 m: $650 / $950<br>· 1.01 × 2.41 m: $750 / $1,150<br>· 1.01 × 2.74 m: $800 / $1,350<br>· 2.54 × 2.13 m: $1,600<br>Ver: ' + link('cortinas.html', 'Cortinas Blackout');

  function getBotReply(raw) {
    var n = normalize(raw);

    if (!n) return 'Escríbeme tu duda y con gusto te ayudo. Por ejemplo: "¿Cuánto cuesta un edredón Queen?" o "¿Hacen envíos?"';

    /* Saludos */
    if (has(n, ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'saludos'])) {
      return '¡Hola! Bienvenido a Inovation Store. Soy tu asistente. ¿En qué te ayudo? Puedo darte precios de edredones, sábanas, almohadas y cortinas, explicarte Viste tu Cama o ayudarte con envíos y pagos.';
    }
    if (has(n, ['gracias'])) return '¡Con gusto! Si necesitas algo más, aquí estoy. También puedes escribirnos por WhatsApp en ' + link(WHATSAPP_PAGE, 'Contacto') + '.';
    if (has(n, ['adios', 'hasta luego', 'bye', 'nos vemos'])) return '¡Gracias por visitar Inovation Store! Que tengas un excelente día.';

    /* Viste tu cama */
    if (has(n, ['viste tu cama', 'viste', 'configurador', 'disena tu cama', 'disenar mi cama', '3d'])) {
      return 'Viste tu Cama es nuestro configurador 3D: eliges tamaño de cama, color de sábanas, tipo y color de edredón, almohadas y complementos, y ves tu cama en vivo con el total actualizado. El total por defecto en Queen es $3,599 MXN. Pruébalo aquí: ' + link('viste-tu-cama.html', 'Viste tu Cama 3D');
    }

    /* Edredones — con tamaño si lo menciona */
    if (has(n, ['edredon', 'edredones', 'colcha', 'cobertor'])) {
      if (has(n, ['king jumbo', 'jumbo'])) return 'El edredón King Jumbo cuesta $1,499 MXN. ' + link('edredones.html', 'Ver edredones');
      if (has(n, ['individual'])) return 'El edredón Individual cuesta $999 MXN. ' + link('edredones.html', 'Ver edredones');
      if (has(n, ['matrimonial'])) return 'El edredón Matrimonial cuesta $1,099 MXN. ' + link('edredones.html', 'Ver edredones');
      if (has(n, ['queen'])) return 'El edredón Queen cuesta $1,199 MXN. ' + link('edredones.html', 'Ver edredones');
      if (has(n, ['king'])) return 'El edredón King cuesta $1,299 MXN. ' + link('edredones.html', 'Ver edredones');
      return PRICE_EDREDON;
    }

    /* Almohadas — antes que sábanas, porque "almohada de bambú" contiene "bambú" */
    if (has(n, ['almohada', 'almohadas', 'memory foam'])) {
      return PRICE_ALMOHADA;
    }

    /* Sábanas */
    if (has(n, ['sabana', 'sabanas', 'juego de sabanas', 'egipcia', 'egipcio', 'bambu'])) {
      if (has(n, ['bambu', 'bambú'])) return 'Las sábanas de bambú las encuentras aquí: ' + link('sabanas-bambu.html', 'Sábanas de Bambú') + '. Las de estilo egipcio cuestan: Individual $500 · Matrimonial $600 · Queen $700 · King $800 MXN.';
      if (has(n, ['individual'])) return 'Las sábanas Individual cuestan $500 MXN. ' + link('sabanas.html', 'Ver sábanas');
      if (has(n, ['matrimonial'])) return 'Las sábanas Matrimonial cuestan $600 MXN. ' + link('sabanas.html', 'Ver sábanas');
      if (has(n, ['queen'])) return 'Las sábanas Queen cuestan $700 MXN. ' + link('sabanas.html', 'Ver sábanas');
      if (has(n, ['king'])) return 'Las sábanas King cuestan $800 MXN. ' + link('sabanas.html', 'Ver sábanas');
      return PRICE_SABANA;
    }

    /* Cortinas */
    if (has(n, ['cortina', 'cortinas', 'blackout', 'thermal'])) {
      return PRICE_CORTINA;
    }

    /* Cubrecolchón / protector */
    if (has(n, ['cubrecolchon', 'cubrecolchones'])) return 'El cubrecolchón cuesta $999 MXN. Ver: ' + link('cubrecolchones.html', 'Cubrecolchones');
    if (has(n, ['protector'])) return 'El protector de colchón impermeable cuesta $649 MXN. Ver: ' + link('protectores.html', 'Protectores de colchón');

    /* Producto que NO vendemos — ser honesto, no dar la lista de precios */
    if (has(n, ['colchon']) && !has(n, ['cubrecolchon', 'protector'])) {
      return 'No vendemos colchones, pero sí cubrecolchones ($999) y protectores de colchón ($649). Ver: ' + link('cubrecolchones.html', 'Cubrecolchones') + ' · ' + link('protectores.html', 'Protectores');
    }

    /* Precio genérico */
    if (has(n, ['precio', 'precios', 'costo', 'cuesta', 'cuestan', 'cuanto vale', 'cuanto cuesta', 'oferta', 'ofertas', 'descuento', 'promocion', 'promociones'])) {
      if (has(n, ['oferta', 'descuento', 'promocion'])) return 'Nuestras ofertas actuales están aquí: ' + link('ofertas.html', 'Ofertas') + '. ¿De qué producto quieres el precio? Edredones desde $999, sábanas desde $500, almohadas de bambú desde $800 y cortinas desde $550.';
      return 'Con gusto, estos son nuestros precios:<br>· ' + PRICE_EDREDON + '<br>· ' + PRICE_SABANA + '<br>· ' + PRICE_ALMOHADA + '<br>· Cortinas Blackout Thermal desde $550. ' + link('cortinas.html', 'Ver cortinas');
    }

    /* Envíos */
    if (has(n, ['envio', 'envios', 'entrega', 'llega', 'tarda', 'mandan', 'mandar', 'donde entregan'])) {
      return 'Hacemos envíos automatizados a todo México. El envío es gratis en pedidos participantes (lo verás en tu carrito). ¿Quieres ver algún producto? ' + link('tienda.html', 'Ir a la Tienda');
    }

    /* Pagos */
    if (has(n, ['pago', 'pagos', 'pagar', 'mercado pago', 'apple pay', 'codi', 'tarjeta', 'efectivo', 'transferencia'])) {
      return 'Aceptamos Mercado Pago, Apple Pay, CoDi y saldo de tu Inovation Pass. La compra es segura. Puedes pagar desde tu carrito (botón arriba a la derecha).';
    }

    /* Garantía */
    if (has(n, ['garantia', 'devolucion', 'devoluciones', 'cambio', 'cambios', 'reembolso'])) {
      return 'Todos nuestros productos tienen Garantía de 10 años y compra segura. Si necesitas un cambio o devolución, escríbenos por WhatsApp y te ayudamos: ' + link(WHATSAPP_PAGE, 'Contacto por WhatsApp');
    }

    /* Inovation Pass */
    if (has(n, ['pass', 'puntos', 'monedero', 'saldo', 'recompensa', 'recompensas'])) {
      return 'Inovation Pass es nuestro monedero electrónico: ganas 15% en puntos con cada compra y los usas como saldo. Saldo actual de la tarjeta: $100.00 MXN. Más información y calculadora de puntos: ' + link('pass.html', 'Inovation Pass');
    }

    /* Contacto / WhatsApp / horario */
    if (has(n, ['whatsapp', 'contacto', 'contactar', 'hablar con alguien', 'asesor', 'humano', 'persona', 'telefono', 'numero'])) {
      return 'Puedes escribirnos por WhatsApp Business: en ' + link(WHATSAPP_PAGE, 'Contacto') + ' está nuestro código QR, escanéalo con tu celular y te atendemos.';
    }
    if (has(n, ['horario', 'abierto', 'atienden', 'hora'])) {
      return 'Nuestra tienda en línea está abierta las 24 horas. Por WhatsApp te respondemos lo antes posible: ' + link(WHATSAPP_PAGE, 'Contacto');
    }

    /* Historia / nosotros */
    if (has(n, ['historia', 'nosotros', 'quienes son', 'empresa', 'fundada', '2016'])) {
      return 'Nacimos en 2016 como un pequeño emprendimiento. Nuestra primera venta fueron dos juegos de sábanas estilo egipcio. Hoy somos un referente en productos hipoalergénicos para tu recámara. Lee nuestra historia completa: ' + link('historia.html', 'Nuestra Historia');
    }

    /* Hipoalergénico / salud */
    if (has(n, ['hipoalergenico', 'alergia', 'alergias', 'carbon', 'salud'])) {
      return 'Todos nuestros productos son hipoalergénicos y libres de carbón: el carbón activado filtra el aire y elimina alérgenos y partículas, para una recámara más saludable. Más en: ' + link('historia.html', 'Nuestra Historia');
    }

    /* Tienda / catálogo */
    if (has(n, ['tienda', 'catalogo', 'productos', 'que venden', 'que tienen'])) {
      return 'Vendemos blancos para el hogar: edredones, sábanas estilo egipcio y de bambú, almohadas Memory Foam de bambú, cubrecolchones, protectores y cortinas blackout. Todo aquí: ' + link('tienda.html', 'Tienda');
    }

    /* Videos */
    if (has(n, ['video', 'videos', 'tutorial', 'como se usa'])) {
      return 'Tenemos videos y tutoriales aquí: ' + link('videos.html', 'Videos');
    }

    /* No sabe — honesto, sin inventar */
    return 'No tengo esa información, y no quiero darte un dato incorrecto. Te ayudo con precios de edredones, sábanas, almohadas y cortinas, Viste tu Cama, envíos, pagos, garantía e Inovation Pass. Para cualquier otra duda, escríbenos por WhatsApp: ' + link(WHATSAPP_PAGE, 'Contacto por WhatsApp');
  }

  /* ---------- Interfaz (solo en navegador) ---------- */
  var QUICK = [
    'Precios de edredones',
    'Viste tu cama',
    'Envíos',
    'Métodos de pago',
    'Hablar por WhatsApp'
  ];

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function addMsg(container, text, who) {
    var m = el('div', 'chat-msg ' + who, text);
    container.appendChild(m);
    container.scrollTop = container.scrollHeight;
  }

  function initChat() {
    if (document.getElementById('chatFab')) return; /* ya cargado */

    /* Botón flotante de WhatsApp (abajo a la izquierda, para no tapar
       el botón del bot que va abajo a la derecha) */
    var wa = el('a', 'wa-fab', '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path fill="#fff" d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 2 6.5L4 29l7.7-2c1.8 1 3.9 1.5 6 1.5h.3c6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22.5c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-4.6 1.2 1.2-4.5-.3-.4c-1-1.6-1.5-3.4-1.5-5.2C5.3 9.9 10.2 5 16 5s10.7 4.9 10.7 10.9S21.8 25.5 16 25.5zm6-8.2c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.7.2-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.7-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.1 3.1 1.3 3.3c.2.2 2.2 3.4 5.4 4.7.8.3 1.4.5 1.8.7.8.2 1.5.2 2 .1.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.7-.5z"/></svg><span class="wa-fab-label">WhatsApp</span>');
    wa.href = WA_LINK;
    wa.id = 'waFab';
    wa.setAttribute('aria-label', 'Chatear por WhatsApp Business');
    wa.setAttribute('target', WA_LINK.indexOf('http') === 0 ? '_blank' : '');
    wa.setAttribute('rel', 'noopener');
    document.body.appendChild(wa);

    var fab = el('button', 'chat-fab', '💬 <span class="chat-fab-label">¿Necesitas ayuda?</span>');
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Abrir asistente de Inovation Store');
    document.body.appendChild(fab);

    var panel = el('div', 'chat-panel');
    panel.id = 'chatPanel';
    panel.setAttribute('aria-label', 'Asistente Inovation Store');
    panel.innerHTML =
      '<div class="chat-head"><b>Asistente Inovation Store</b><span>En línea · responde al instante</span><button type="button" class="chat-close" aria-label="Cerrar chat">✕</button></div>' +
      '<div class="chat-msgs" id="chatMsgs"></div>' +
      '<div class="chat-quick" id="chatQuick"></div>' +
      '<div class="chat-input"><input type="text" id="chatText" placeholder="Escribe tu duda…" autocomplete="off"><button type="button" id="chatSend">Enviar</button></div>';
    document.body.appendChild(panel);

    var msgs = panel.querySelector('#chatMsgs');
    var input = panel.querySelector('#chatText');
    var quick = panel.querySelector('#chatQuick');

    QUICK.forEach(function (q) {
      var b = el('button', 'chat-chip', q);
      b.type = 'button';
      b.addEventListener('click', function () { send(q); });
      quick.appendChild(b);
    });

    function send(text) {
      text = (text || '').trim();
      if (!text) return;
      addMsg(msgs, escapeHtml(text), 'user');
      input.value = '';
      var typing = el('div', 'chat-msg bot chat-typing', 'Escribiendo…');
      msgs.appendChild(typing);
      msgs.scrollTop = msgs.scrollHeight;
      setTimeout(function () {
        typing.remove();
        addMsg(msgs, getBotReply(text), 'bot');
      }, 600);
    }
    function escapeHtml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    fab.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      fab.classList.toggle('open', open);
      if (open && !msgs.children.length) {
        addMsg(msgs, '¡Hola! Soy el asistente de Inovation Store. ¿En qué te ayudo? Puedes preguntarme por precios, Viste tu Cama, envíos o pagos.', 'bot');
        input.focus();
      }
    });
    panel.querySelector('.chat-close').addEventListener('click', function () {
      panel.classList.remove('open');
      fab.classList.remove('open');
    });
    panel.querySelector('#chatSend').addEventListener('click', function () { send(input.value); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(input.value); });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initChat);
    } else {
      initChat();
    }
  }

  /* Exportar la lógica para pruebas en Node */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getBotReply: getBotReply, normalize: normalize, WA_LINK: WA_LINK };
  }
})();
