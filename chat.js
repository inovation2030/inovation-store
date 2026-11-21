/* Asistente Inovation Store — bot de atención a clientes, 100% en el navegador.
   Sin API ni backend: responde con los precios y datos REALES de la tienda.
   Nunca inventa precios ni productos. Trato siempre de usted, muy amable:
   bienvenida cálida, despedida cálida, y "con mucho gusto" en todo.
   Sabe armar paquetes (edredón + sábanas + almohadas) con su total, y
   recuerda el último producto/paquete para contestar seguimientos como
   "¿y en king?" o "¿cuánto es todo?". */
(function () {
  'use strict';

  var WHATSAPP_PAGE = 'contacto.html';

  /* Enlace de WhatsApp Business. */
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
  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* Precios REALES de la tienda (MXN) */
  var EDREDON_P = {individual: 999, matrimonial: 1099, queen: 1199, king: 1299, 'king jumbo': 1499};
  var SABANA_P = {individual: 500, matrimonial: 600, queen: 700, king: 800, 'king jumbo': 800};
  var ALM_PAR_STD = 1500, ALM_PAR_KING = 1700;

  var SIZES = ['king jumbo', 'individual', 'matrimonial', 'queen', 'king'];
  function detectSize(n) {
    for (var i = 0; i < SIZES.length; i++) {
      if (n.indexOf(SIZES[i]) !== -1) return SIZES[i];
    }
    return null;
  }
  function sizeLabel(s) {
    return s === 'king jumbo' ? 'King Jumbo' : s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* Colores de edredón: cara principal, reverso y color de sábana que combina.
     sheet: null = no hay sábanas en ese color (se sugiere Crema). */
  var DUVET_COLORS = [
    {key: 'azul marino', name: 'Azul Marino', rev: 'Gris carbón', sheet: 'Marine'},
    {key: 'gris', name: 'Gris', rev: 'Gris Oxford', sheet: null},
    {key: 'beige', name: 'Beige', rev: 'Chocolate', sheet: 'Beage'},
    {key: 'blanco', name: 'Blanco', rev: 'Blanco', sheet: 'Crema'},
    {key: 'negro', name: 'Negro', rev: 'Gris carbón', sheet: 'Black'},
    {key: 'rayas', name: 'Blanco con Rayas', rev: 'Gris claro', sheet: 'Crema'}
  ];
  function detectColors(n) {
    var out = [];
    DUVET_COLORS.forEach(function (c) {
      if (n.indexOf(c.key) !== -1) out.push(c);
    });
    if (!out.length && n.indexOf('marino') !== -1) out.push(DUVET_COLORS[0]);
    return out;
  }

  /* Memoria de la conversación (solo dura mientras la página está abierta) */
  var lastProduct = null; /* 'edredon' | 'sabana' */
  var lastPackage = null; /* {size, colors} */
  var lastPackageTotal = 0;
  function clearPackage() { lastPackage = null; lastPackageTotal = 0; }

  function buildPackage(size, colors) {
    var main = colors[0];
    var lines = [], total = 0;
    var pe = EDREDON_P[size]; total += pe;
    var rev = main.rev ? ' (reversible, reverso ' + main.rev + ')' : '';
    lines.push('· Edredón hipoalergénico ' + main.name + rev + ' · ' + sizeLabel(size) + ' — $' + fmt(pe) + ' MXN');
    var ps = SABANA_P[size]; total += ps;
    if (main.sheet) {
      lines.push('· Sábanas estilo egipcio color ' + main.sheet + ' · ' + sizeLabel(size) + ' — $' + fmt(ps) + ' MXN');
    } else {
      lines.push('· Sábanas estilo egipcio color Crema · ' + sizeLabel(size) + ' — $' + fmt(ps) + ' MXN (en gris no las manejamos; el Crema combina muy bien con el gris)');
    }
    total += ALM_PAR_STD;
    lines.push('· Par de almohadas de bambú Memory Foam Standard — $' + fmt(ALM_PAR_STD) + ' MXN');
    var txt = '¡Con mucho gusto! Le armo su paquete en ' + colors.map(function (c) { return c.name.toLowerCase(); }).join(' y ') + ', en tamaño ' + sizeLabel(size) + ':<br>' + lines.join('<br>') + '<br><b>Total del paquete: $' + fmt(total) + ' MXN</b>';
    if (colors.length > 1 && main.rev && colors[1].name === 'Gris' && main.rev.indexOf('Gris carbón') === 0) {
      txt += '<br>El edredón ya trae las dos caras que me pide: Azul Marino y su reverso Gris carbón.';
    }
    txt += '<br>¿Su cama es ' + sizeLabel(size) + ' o de otro tamaño? Con mucho gusto se lo ajusto. Y como su paquete es de más de $1,000 MXN, el envío es gratis. También puede verlo armado en 3D aquí: ' + link('viste-tu-cama.html', 'Viste tu Cama 3D');
    lastPackage = {size: size, colors: colors};
    lastPackageTotal = total;
    return txt;
  }

  var PRICE_EDREDON = 'Edredones hipoalergénicos: Individual $999 · Matrimonial $1,099 · Queen $1,199 · King $1,299 · King Jumbo $1,499 MXN. <br>Ver todos: ' + link('edredones.html', 'Edredones');
  var PRICE_SABANA = 'Sábanas estilo egipcio: Individual $500 · Matrimonial $600 · Queen $700 · King $800 MXN. <br>Ver colores y tamaños: ' + link('sabanas.html', 'Sábanas');
  var PRICE_ALMOHADA = 'Almohadas de bambú Memory Foam: Standard $800 una / $1,500 el par · King $900 una / $1,700 el par. <br>Ver: ' + link('almohadas.html', 'Almohadas de bambú');
  var PRICE_CORTINA = 'Cortinas Blackout Thermal, 17 colores (Chocolate, Turquesa, Verde salvia, Turquesa marino, Rojo, Piedra, Negro, Morado, Marrón, Marrón cebada, Marino, Gris carbón, Ciruela, Gris, Mineral, Pink y Perla):<br>· 1.01 × 1.60 m: $550 (1 panel) / $850 (2 paneles)<br>· 1.01 × 2.13 m: $650 / $950<br>· 1.01 × 2.41 m: $750 / $1,150<br>· 1.01 × 2.74 m: $800 / $1,350<br>· 2.54 × 2.13 m: $1,600<br>Ver: ' + link('cortinas.html', 'Cortinas Blackout');

  function getBotReply(raw) {
    var n = normalize(raw);

    if (!n) return 'Escríbame su duda y con mucho gusto le ayudo. Por ejemplo: "¿Cuánto cuesta un edredón Queen?" o "¿Me arma un paquete en azul marino y gris?"';

    /* Saludos — bienvenida cálida */
    if (has(n, ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'saludos'])) {
      return '¡Hola! Qué gusto saludarle. Bienvenido a Inovation Store, será un placer atenderle. ¿En qué le puedo ayudar? Con mucho gusto le doy precios de edredones, sábanas, almohadas y cortinas, le armo un paquete con su total, le explico Viste tu Cama o le ayudo con envíos y pagos.';
    }
    if (has(n, ['gracias'])) return '¡Con mucho gusto! Ha sido un placer atenderle. Si necesita algo más, aquí estoy para servirle. También puede escribirnos por WhatsApp en ' + link(WHATSAPP_PAGE, 'Contacto') + '. ¡Que tenga un excelente día!';
    if (has(n, ['adios', 'hasta luego', 'bye', 'nos vemos', 'me despido'])) return '¡Muchas gracias por su visita a Inovation Store! Ha sido un verdadero placer atenderle. Que tenga un excelente día y lo esperamos pronto. ¡Hasta luego!';

    /* Paquetes — armar un combo con su total */
    if (has(n, ['paquete', 'combo', 'kit', 'juego completo', 'todo en', 'armame', 'armes', 'hazme'])) {
      var colors = detectColors(n);
      var size = detectSize(n) || 'queen';
      if (!colors.length) {
        return '¡Con mucho gusto le armo su paquete! ¿En qué colores le gustaría? Por ejemplo: azul marino y gris, beige, blanco o negro. Y dígame, ¿su cama es Individual, Matrimonial, Queen, King o King Jumbo?';
      }
      return buildPackage(size, colors);
    }

    /* Seguimiento: "¿cuánto es todo?" después de un paquete */
    if (lastPackageTotal > 0 && has(n, ['cuanto es todo', 'cuanto seria todo', 'cuanto sale todo', 'total del paquete', 'cuanto es en total', 'cuanto seria en total'])) {
      return 'Con mucho gusto: el total de su paquete es de <b>$' + fmt(lastPackageTotal) + ' MXN</b>. ¿Le gustaría que se lo ajuste a otro tamaño o que le agregue las cortinas Blackout?';
    }

    /* Seguimiento: solo un tamaño ("¿y en king?") — usa el último producto o paquete */
    var onlySize = detectSize(n);
    if (onlySize && !has(n, ['edredon', 'sabana', 'almohada', 'cortina', 'paquete', 'combo', 'cama', 'precio', 'cuesta', 'cuanto'])) {
      if (lastPackage) {
        return buildPackage(onlySize, lastPackage.colors);
      }
      if (lastProduct === 'edredon') {
        return 'Con mucho gusto: el edredón ' + sizeLabel(onlySize) + ' cuesta $' + fmt(EDREDON_P[onlySize]) + ' MXN. ' + link('edredones.html', 'Ver edredones');
      }
      if (lastProduct === 'sabana') {
        return 'Con mucho gusto: las sábanas ' + sizeLabel(onlySize) + ' cuestan $' + fmt(SABANA_P[onlySize]) + ' MXN. ' + link('sabanas.html', 'Ver sábanas');
      }
    }

    /* Viste tu cama */
    if (has(n, ['viste tu cama', 'viste', 'configurador', 'disena tu cama', 'disenar mi cama', '3d'])) {
      clearPackage();
      return 'Viste tu Cama es nuestro configurador 3D: usted elige tamaño de cama, color de sábanas, tipo y color de edredón, almohadas y complementos, y ve su cama en vivo con el total actualizado. En Queen, el total base es $1,899 MXN (edredón $1,199 + sábanas $700); con par de almohadas de bambú queda en $3,399 MXN. Pruébelo aquí: ' + link('viste-tu-cama.html', 'Viste tu Cama 3D');
    }

    /* Edredones — con tamaño si lo menciona */
    if (has(n, ['edredon', 'edredones', 'colcha', 'cobertor'])) {
      clearPackage();
      lastProduct = 'edredon';
      if (has(n, ['king jumbo', 'jumbo'])) return 'El edredón King Jumbo cuesta $1,499 MXN. ' + link('edredones.html', 'Ver edredones');
      if (has(n, ['individual'])) return 'El edredón Individual cuesta $999 MXN. ' + link('edredones.html', 'Ver edredones');
      if (has(n, ['matrimonial'])) return 'El edredón Matrimonial cuesta $1,099 MXN. ' + link('edredones.html', 'Ver edredones');
      if (has(n, ['queen'])) return 'El edredón Queen cuesta $1,199 MXN. ' + link('edredones.html', 'Ver edredones');
      if (has(n, ['king'])) return 'El edredón King cuesta $1,299 MXN. ' + link('edredones.html', 'Ver edredones');
      return PRICE_EDREDON;
    }

    /* Almohadas — antes que sábanas, porque "almohada de bambú" contiene "bambú" */
    if (has(n, ['almohada', 'almohadas', 'memory foam'])) {
      clearPackage();
      return PRICE_ALMOHADA;
    }

    /* Sábanas */
    if (has(n, ['sabana', 'sabanas', 'juego de sabanas', 'egipcia', 'egipcio', 'bambu'])) {
      clearPackage();
      lastProduct = 'sabana';
      if (has(n, ['bambu', 'bambú'])) return 'Las sábanas de bambú las encuentra aquí: ' + link('sabanas-bambu.html', 'Sábanas de Bambú') + '. Las de estilo egipcio cuestan: Individual $500 · Matrimonial $600 · Queen $700 · King $800 MXN.';
      if (has(n, ['individual'])) return 'Las sábanas Individual cuestan $500 MXN. ' + link('sabanas.html', 'Ver sábanas');
      if (has(n, ['matrimonial'])) return 'Las sábanas Matrimonial cuestan $600 MXN. ' + link('sabanas.html', 'Ver sábanas');
      if (has(n, ['queen'])) return 'Las sábanas Queen cuestan $700 MXN. ' + link('sabanas.html', 'Ver sábanas');
      if (has(n, ['king'])) return 'Las sábanas King cuestan $800 MXN. ' + link('sabanas.html', 'Ver sábanas');
      return PRICE_SABANA;
    }

    /* Cortinas */
    if (has(n, ['cortina', 'cortinas', 'blackout', 'thermal'])) {
      clearPackage();
      return PRICE_CORTINA;
    }

    /* Cubrecolchón / protector */
    if (has(n, ['cubrecolchon', 'cubrecolchones'])) return 'El cubrecolchón cuesta $999 MXN. Ver: ' + link('cubrecolchones.html', 'Cubrecolchones');
    if (has(n, ['protector'])) return 'El protector de colchón impermeable cuesta $649 MXN. Ver: ' + link('protectores.html', 'Protectores de colchón');

    /* Producto que NO vendemos — ser honesto, no dar la lista de precios */
    if (has(n, ['colchon']) && !has(n, ['cubrecolchon', 'protector'])) {
      return 'No vendemos colchones, pero sí cubrecolchones ($999) y protectores de colchón ($649). Ver: ' + link('cubrecolchones.html', 'Cubrecolchones') + ' · ' + link('protectores.html', 'Protectores');
    }

    /* Envíos — cargos reales: gratis en compras de más de $1,000 */
    if (has(n, ['envio', 'envios', 'entrega', 'llega', 'tarda', 'mandan', 'mandar', 'donde entregan'])) {
      return 'Hacemos envíos a todo México. En compras de más de $1,000 MXN, el envío es gratis. Si su compra es menor, el cargo de envío es:<br>· $150 MXN a domicilio en cualquier parte del área metropolitana<br>· $50 MXN si la entrega es en alguna estación del Metro, Metrobús, Mexibús, Tren Ligero o Suburbano<br>· $250 MXN al interior de la República<br>¿Le gustaría ver algún producto? ' + link('tienda.html', 'Ir a la Tienda');
    }

    /* Precio genérico */
    if (has(n, ['precio', 'precios', 'costo', 'cuesta', 'cuestan', 'cuanto vale', 'cuanto cuesta', 'oferta', 'ofertas', 'descuento', 'promocion', 'promociones'])) {
      if (has(n, ['oferta', 'descuento', 'promocion'])) return 'Nuestras ofertas actuales están aquí: ' + link('ofertas.html', 'Ofertas') + '. ¿De qué producto quiere el precio? Edredones desde $999, sábanas desde $500, almohadas de bambú desde $800 y cortinas desde $550.';
      return 'Con mucho gusto, estos son nuestros precios:<br>· ' + PRICE_EDREDON + '<br>· ' + PRICE_SABANA + '<br>· ' + PRICE_ALMOHADA + '<br>· Cortinas Blackout Thermal desde $550. ' + link('cortinas.html', 'Ver cortinas');
    }

    /* Pagos */
    if (has(n, ['pago', 'pagos', 'pagar', 'mercado pago', 'apple pay', 'codi', 'tarjeta', 'efectivo', 'transferencia'])) {
      return 'Aceptamos Mercado Pago, Apple Pay, CoDi y saldo de su Inovation Pass. La compra es totalmente segura. Puede pagar desde su carrito (botón arriba a la derecha).';
    }

    /* Garantía */
    if (has(n, ['garantia', 'devolucion', 'devoluciones', 'cambio', 'cambios', 'reembolso'])) {
      return 'Todos nuestros productos tienen Garantía de 10 años y compra segura. Si necesita un cambio o devolución, escríbanos por WhatsApp y con gusto le ayudamos: ' + link(WHATSAPP_PAGE, 'Contacto por WhatsApp');
    }

    /* Inovation Pass */
    if (has(n, ['pass', 'puntos', 'monedero', 'saldo', 'recompensa', 'recompensas'])) {
      return 'Inovation Pass es nuestro monedero electrónico: usted gana 15% en puntos con cada compra y los usa como saldo. Saldo actual de la tarjeta: $100.00 MXN. Más información y calculadora de puntos: ' + link('pass.html', 'Inovation Pass');
    }

    /* Contacto / WhatsApp / horario */
    if (has(n, ['whatsapp', 'contacto', 'contactar', 'hablar con alguien', 'asesor', 'humano', 'persona', 'telefono', 'numero'])) {
      return 'Puede escribirnos por WhatsApp Business: en ' + link(WHATSAPP_PAGE, 'Contacto') + ' está nuestro código QR, escanee con su celular y con gusto le atendemos.';
    }
    if (has(n, ['horario', 'abierto', 'atienden', 'hora'])) {
      return 'Nuestra tienda en línea está abierta las 24 horas. Por WhatsApp le respondemos lo antes posible: ' + link(WHATSAPP_PAGE, 'Contacto');
    }

    /* Historia / nosotros */
    if (has(n, ['historia', 'nosotros', 'quienes son', 'empresa', 'fundada', '2016'])) {
      return 'Nacimos en 2016 como un pequeño emprendimiento. Nuestra primera venta fueron dos juegos de sábanas estilo egipcio. Hoy somos un referente en productos hipoalergénicos para su recámara. Lea nuestra historia completa: ' + link('historia.html', 'Nuestra Historia');
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
    return 'Le ofrezco una disculpa, no tengo esa información y no quiero darle un dato incorrecto. Con mucho gusto le ayudo con precios de edredones, sábanas, almohadas y cortinas, paquetes con su total, Viste tu Cama, envíos, pagos, garantía e Inovation Pass. Para cualquier otra duda, escríbanos por WhatsApp: ' + link(WHATSAPP_PAGE, 'Contacto por WhatsApp');
  }

  /* ---------- Interfaz (solo en navegador) ---------- */
  var QUICK = [
    'Armar un paquete',
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
      '<div class="chat-input"><input type="text" id="chatText" placeholder="Escriba su duda…" autocomplete="off"><button type="button" id="chatSend">Enviar</button></div>';
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
        addMsg(msgs, '¡Hola! Bienvenido a Inovation Store. Soy su asistente personal y será un placer atenderle. ¿En qué le puedo ayudar? Puede preguntarme por precios, paquetes, Viste tu Cama, envíos o pagos.', 'bot');
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
