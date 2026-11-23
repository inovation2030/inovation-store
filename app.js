
function money(n){return '$'+Number(n).toLocaleString('es-MX')+' MXN'}
function getCart(){try{return JSON.parse(localStorage.getItem('inovation_cart')||'[]')}catch(e){return[]}}
function saveCart(c){localStorage.setItem('inovation_cart',JSON.stringify(c));updateCartCount()}

/* ---------- Envío en el carrito ---------- */
/* Cargos reales: $150 a domicilio en área metropolitana, $50 en estación
   (Metro, Metrobús, Mexibús, Tren Ligero, Suburbano), $250 al interior.
   En compras de más de $1,000 MXN el envío es gratis: el cargo desaparece. */
var SHIP_OPTIONS=[
  {id:'domicilio',label:'A domicilio — área metropolitana',fee:150},
  {id:'estacion',label:'Entrega en estación (Metro, Metrobús, Mexibús, Tren Ligero, Suburbano)',fee:50},
  {id:'interior',label:'Interior de la República',fee:250}
];
var FREE_SHIP_MIN=1000;
/* ---------- Pago con tarjeta (Stripe, EN VIVO) ---------- */
/* Enlaces de pago reales de Stripe (cuenta Alberto Ochoa, MXN).
   El precio depende solo del TAMANO, no del color: por eso el mapa es
   por tipo de producto + precio. El color lo escribe el cliente en el
   campo personalizado "Color" del checkout de Stripe. */
var INOV_STRIPE_LINKS = {
  edredon: {999:'https://buy.stripe.com/eVq6oI5Tv8uNeYr8gV3ks00',1099:'https://buy.stripe.com/9B6aEYchT4exbMf8gV3ks01',1199:'https://buy.stripe.com/6oUcN66XzaCVbMf9kZ3ks02',1299:'https://buy.stripe.com/14A3cwa9L9yR2bF7cR3ks03',1499:'https://buy.stripe.com/8x28wQ6Xz12l03xbt73ks04'},
  sabana: {500:'https://buy.stripe.com/9B64gAbdPaCV6rVcxb3ks05',600:'https://buy.stripe.com/cNi5kE81DeTbdUnbt73ks06',700:'https://buy.stripe.com/8x228sa9Lh1jg2vfJn3ks07',800:'https://buy.stripe.com/4gMeVe2HjdP7eYr0Ot3ks08'}
};
function stripeLinkFor(kind, price){
  var m = INOV_STRIPE_LINKS[kind];
  return m ? (m[price] || null) : null;
}
function buyWithStripe(btn){
  var kind = btn.getAttribute('data-buy-stripe');
  var scope = btn.closest('article');
  var add = scope ? scope.querySelector('[data-add]') : null;
  var price = add ? parseInt(add.getAttribute('data-price')||'0', 10) : 0;
  var url = stripeLinkFor(kind, price);
  if(!url){ alert('Este producto aun no tiene pago con tarjeta. Agregalo al carrito o escribenos por WhatsApp.'); return; }
  window.open(url, '_blank');
}
function payCartWithStripe(){
  var c = getCart();
  if(!c.length){ alert('Tu carrito esta vacio.'); return; }
  for(var i=0;i<c.length;i++){
    var it = c[i];
    var kind = /edred/i.test(it.name) ? 'edredon' : (/bana/i.test(it.name) ? 'sabana' : null);
    if(kind){
      var url = stripeLinkFor(kind, it.price);
      if(url){
        if(c.length>1){ alert('Tienes '+c.length+' productos en el carrito. El pago con tarjeta es por producto: te abro el pago de "'+it.name+'". Para los demas, usa su boton "Comprar con tarjeta" en su pagina.'); }
        window.open(url, '_blank');
        return;
      }
    }
  }
  alert('Estos productos aun no tienen pago con tarjeta. Escribenos por WhatsApp para pagarlo.');
}

function getShip(){try{return localStorage.getItem('inovation_ship')||''}catch(e){return''}}
function saveShip(id){try{localStorage.setItem('inovation_ship',id)}catch(e){}}
function shipFee(subtotal,id){
  if(!subtotal||subtotal>FREE_SHIP_MIN)return 0;
  for(var i=0;i<SHIP_OPTIONS.length;i++){if(SHIP_OPTIONS[i].id===id)return SHIP_OPTIONS[i].fee}
  return 0;
}
function updateCartCount(){var c=getCart(),n=0;c.forEach(function(i){n+=i.qty});document.querySelectorAll('.cart-count').forEach(function(e){e.textContent=n})}
function addToCart(name,price,qty){qty=qty||1;var c=getCart();var f=c.find(function(i){return i.name===name&&i.price===price});if(f)f.qty+=qty;else c.push({name:name,price:price,qty:qty});saveCart(c);renderCart();alert(name+' agregado al carrito')}
function renderCart(){var c=getCart(),el=document.getElementById('cartItems');if(!el)return;var t=0;if(!c.length){el.innerHTML='<p>Tu carrito está vacío.</p>'}else{el.innerHTML=c.map(function(i){t+=i.price*i.qty;return '<div class="item"><span>'+i.name+' x '+i.qty+'</span><b>'+money(i.price*i.qty)+'</b></div>'}).join('')}
  /* Desglose con envío: subtotal, selector de entrega y cargo. El cargo
     aparece al seleccionar cómo será la entrega, y desaparece (Gratis)
     cuando la compra es de más de $1,000 MXN. */
  var tot=document.getElementById('cartTotal'),drawer=document.getElementById('cartDrawer');
  var subLine=document.getElementById('cartSubtotalLine'),shipLine=document.getElementById('cartShipLine'),box=document.getElementById('shipBox');
  if(tot&&drawer){
    if(!subLine){subLine=document.createElement('p');subLine.className='cart-line';subLine.id='cartSubtotalLine';subLine.innerHTML='Subtotal: <b id="cartSubtotal"></b>';drawer.insertBefore(subLine,tot.parentElement)}
    if(!shipLine){shipLine=document.createElement('p');shipLine.className='cart-line';shipLine.id='cartShipLine';shipLine.innerHTML='Envío: <b id="cartShip"></b>';drawer.insertBefore(shipLine,tot.parentElement)}
    if(!box){
      box=document.createElement('div');box.id='shipBox';
      box.innerHTML='<h3>¿Cómo será la entrega?</h3>'+SHIP_OPTIONS.map(function(o){return '<label><input type="radio" name="shipOpt" value="'+o.id+'"><span>'+o.label+'</span><b>'+money(o.fee)+'</b></label>'}).join('')+'<p class="ship-note">En compras de más de $1,000 MXN el envío es gratis.</p>';
      drawer.insertBefore(box,shipLine);
      box.addEventListener('change',function(e){if(e.target&&e.target.name==='shipOpt'){saveShip(e.target.value);renderCart()}});
    }
  }
  var show=c.length>0;
  if(subLine)subLine.style.display=show?'':'none';
  if(shipLine)shipLine.style.display=show?'':'none';
  if(box)box.style.display=show?'':'none';
  /* Aviso de tiempo de entrega, justo antes de los botones de pago.
     1 a 2 días hábiles como máximo; al interior, hasta 5 días hábiles. */
  var payBtn=drawer?drawer.querySelector('.btn'):null;
  var timeLine=document.getElementById('shipTime');
  if(payBtn&&!timeLine){
    timeLine=document.createElement('p');timeLine.className='ship-time';timeLine.id='shipTime';
    drawer.insertBefore(timeLine,payBtn.parentElement);
  }
  if(timeLine)timeLine.style.display=show?'':'none';
  var subEl=document.getElementById('cartSubtotal');if(subEl)subEl.textContent=money(t);
  var sel=getShip();
  if(timeLine){
    timeLine.innerHTML=(sel==='interior')
      ?'⏱ La entrega al interior de la República tarda hasta <b>5 días hábiles</b>.'
      :(sel?'⏱ La entrega tarda de <b>1 a 2 días hábiles</b> como máximo.'
           :'⏱ La entrega tarda de <b>1 a 2 días hábiles</b> como máximo (al interior de la República, hasta <b>5 días hábiles</b>).');
  }
  if(box)box.querySelectorAll('input[name="shipOpt"]').forEach(function(r){r.checked=(r.value===sel)});
  var free=t>FREE_SHIP_MIN,fee=shipFee(t,sel);
  var shipEl=document.getElementById('cartShip');
  if(shipEl){
    if(free){shipEl.textContent='Gratis';shipEl.className='ship-free'}
    else if(sel){shipEl.textContent=money(fee);shipEl.className=''}
    else{shipEl.textContent='Selecciona cómo será la entrega';shipEl.className=''}
  }
  if(tot)tot.textContent=money(t+fee);
  var pts=document.getElementById('cartPoints');if(pts)pts.textContent=Math.round(t*0.15)+' puntos Pass'}
function openCart(){renderCart();document.getElementById('cartDrawer').classList.add('open')}
function closeCart(){document.getElementById('cartDrawer').classList.remove('open')}
function clearCart(){saveCart([]);renderCart()}
document.addEventListener('DOMContentLoaded',function(){
  updateCartCount();renderCart();
  /* Menú hamburguesa móvil: abre/cierra el menú como desplegable */
  document.querySelectorAll('.menu-toggle').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var open=document.body.classList.toggle('nav-open');
      b.setAttribute('aria-expanded',open?'true':'false');
      b.textContent=open?'✕':'☰';
    });
  });
  document.querySelectorAll('nav.main a').forEach(function(a){
    a.addEventListener('click',function(){
      document.body.classList.remove('nav-open');
      var t=document.querySelector('.menu-toggle');
      if(t){t.textContent='☰';t.setAttribute('aria-expanded','false');}
    });
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('header.site')){
      document.body.classList.remove('nav-open');
      var t=document.querySelector('.menu-toggle');
      if(t){t.textContent='☰';t.setAttribute('aria-expanded','false');}
      document.querySelectorAll('.drop.open').forEach(function(d){d.classList.remove('open');var s=d.querySelector('.submenu');if(s)s.style.top='';});
    }
  });
  window.addEventListener('resize',function(){
    if(window.innerWidth>768){document.body.classList.remove('nav-open');document.querySelectorAll('.drop.open').forEach(function(d){d.classList.remove('open');var s=d.querySelector('.submenu');if(s)s.style.top='';});}
  });
  /* Selector de tamaño en tarjetas de producto (edredones, sábanas): actualiza precio y carrito */
  document.querySelectorAll('.size-sel').forEach(function(sel){
    sel.addEventListener('click',function(e){
      var b=e.target.closest('.size-opt'); if(!b)return;
      sel.querySelectorAll('.size-opt').forEach(function(x){x.classList.remove('on')});
      b.classList.add('on');
      var scope=sel.closest('article, .palette-box'); if(!scope)return;
      var price=parseInt(b.getAttribute('data-price'),10), size=b.getAttribute('data-size');
      var pr=scope.querySelector('.price'); if(pr)pr.innerHTML='$'+price.toLocaleString('es-MX')+' <small>MXN</small>';
      var add=scope.querySelector('[data-add]'); if(add){add.setAttribute('data-price',price); add.setAttribute('data-add', add.getAttribute('data-base')+' — '+size);}
    });
  });
  /* Selector de color en tarjetas de producto (edredones): cambia foto, nombre y carrito.
     INDEPENDENCIA POR TARJETA: cada tarjeta tiene su propio estado (data-card).
     El handler se ata a la tarjeta (article) y TODO se resuelve dentro de esa
     tarjeta (art.querySelector / :scope > img): tocar un color en una tarjeta
     nunca toca otra tarjeta. (Antes el handler ya era por tarjeta, pero la
     verificación en vivo vio dos tarjetas en Gris a la vez porque la segunda
     tarjeta YA es Gris por defecto; con data-card + esta verificación por
     tarjeta queda demostrado que no hay estado compartido.) */
  document.querySelectorAll('article.product').forEach(function(art,idx){
    art.setAttribute('data-card',idx+1);
    var sel=art.querySelector('.color-sel'); if(!sel)return;
    sel.addEventListener('click',function(e){
      var b=e.target.closest('.color-opt'); if(!b)return;
      if(!sel.contains(b))return;
      sel.querySelectorAll('.color-opt').forEach(function(x){x.classList.remove('on')});
      b.classList.add('on');
      var name=b.getAttribute('data-name'), src=b.getAttribute('data-img');
      var img=art.querySelector(':scope > img');
      var prefix=art.getAttribute('data-title')||'';
      if(img&&src){img.src=src;img.alt=prefix+' — '+name;}
      var lab=art.querySelector('.color-name'); if(lab)lab.textContent=name;
      var h=art.querySelector('h3'); if(h&&prefix)h.textContent=prefix+' — '+name;
      var add=art.querySelector('[data-add]');
      if(add&&prefix){var sz=art.querySelector('.size-opt.on');var size=sz?sz.getAttribute('data-size'):null;add.setAttribute('data-base',prefix+' — '+name);add.setAttribute('data-add',prefix+' — '+name+(size?' — '+size:''));}
    });
  });
  document.querySelectorAll('[data-add]').forEach(function(b){b.addEventListener('click',function(){addToCart(b.getAttribute('data-add'),parseInt(b.getAttribute('data-price')||'0',10))})});
  document.querySelectorAll('[data-buy-stripe]').forEach(function(b){b.addEventListener('click',function(){buyWithStripe(b)})});
  document.querySelectorAll('.drop>button, .drop>a').forEach(function(b){b.addEventListener('click',function(e){
    if(window.matchMedia('(max-width:768px)').matches){return;}
    e.preventDefault();
    e.stopPropagation();
    var d=b.parentElement, open=d.classList.toggle('open'), sub=d.querySelector('.submenu');
    /* En móvil el submenú es un panel fijo bajo el encabezado: se mide su posición real */
    if(window.matchMedia('(max-width:768px)').matches&&sub){
      if(open){var h=document.querySelector('header.site'), r=h?h.getBoundingClientRect():null; sub.style.top=((r?r.bottom:96)+2)+'px';}
      else{ sub.style.top=''; }
    }
  })});

  /* Selector de almohadas de bambú: tamaño (Standard/King) + cantidad (1/par) */
  document.querySelectorAll('article.product').forEach(function(art){
    var sz=art.querySelector('.pillow-size'), qt=art.querySelector('.pillow-qty');
    if(!sz||!qt)return;
    function updPillow(){
      var b=sz.querySelector('.size-opt.on'), q=qt.querySelector('.size-opt.on');
      if(!b||!q)return;
      var price=(q.getAttribute('data-qty')==='2')?parseInt(b.getAttribute('data-pair'),10):parseInt(b.getAttribute('data-single'),10);
      var pr=art.querySelector('.price'); if(pr)pr.innerHTML='$'+price.toLocaleString('es-MX')+' <small>MXN</small>';
      var add=art.querySelector('[data-add]'); if(add){add.setAttribute('data-price',price); add.setAttribute('data-add', add.getAttribute('data-base')+' — '+b.getAttribute('data-size')+' · '+(q.getAttribute('data-qty')==='2'?'Par (2 almohadas)':'1 almohada'));}
    }
    [sz,qt].forEach(function(sel){
      sel.addEventListener('click',function(e){
        var b=e.target.closest('.size-opt'); if(!b)return;
        sel.querySelectorAll('.size-opt').forEach(function(x){x.classList.remove('on')});
        b.classList.add('on'); updPillow();
      });
    });
  });
});
