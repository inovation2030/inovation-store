
function money(n){return '$'+Number(n).toLocaleString('es-MX')+' MXN'}
function getCart(){try{return JSON.parse(localStorage.getItem('inovation_cart')||'[]')}catch(e){return[]}}
function saveCart(c){localStorage.setItem('inovation_cart',JSON.stringify(c));updateCartCount()}
function updateCartCount(){var c=getCart(),n=0;c.forEach(function(i){n+=i.qty});document.querySelectorAll('.cart-count').forEach(function(e){e.textContent=n})}
function addToCart(name,price,qty){qty=qty||1;var c=getCart();var f=c.find(function(i){return i.name===name&&i.price===price});if(f)f.qty+=qty;else c.push({name:name,price:price,qty:qty});saveCart(c);renderCart();alert(name+' agregado al carrito')}
function renderCart(){var c=getCart(),el=document.getElementById('cartItems');if(!el)return;var t=0;if(!c.length){el.innerHTML='<p>Tu carrito está vacío.</p>'}else{el.innerHTML=c.map(function(i){t+=i.price*i.qty;return '<div class="item"><span>'+i.name+' x '+i.qty+'</span><b>'+money(i.price*i.qty)+'</b></div>'}).join('')}var tot=document.getElementById('cartTotal');if(tot)tot.textContent=money(t);var pts=document.getElementById('cartPoints');if(pts)pts.textContent=Math.round(t*0.15)+' puntos Pass'}
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
    }
  });
  window.addEventListener('resize',function(){
    if(window.innerWidth>768)document.body.classList.remove('nav-open');
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
  /* Selector de color en tarjetas de producto (edredones): cambia foto, nombre y carrito */
  document.querySelectorAll('.color-sel').forEach(function(sel){
    sel.addEventListener('click',function(e){
      var b=e.target.closest('.color-opt'); if(!b)return;
      sel.querySelectorAll('.color-opt').forEach(function(x){x.classList.remove('on')});
      b.classList.add('on');
      var art=sel.closest('article.product'); if(!art)return;
      var name=b.getAttribute('data-name'), src=b.getAttribute('data-img');
      var img=null; for(var i=0;i<art.children.length;i++){if(art.children[i].tagName==='IMG'){img=art.children[i];break;}}
      var prefix=art.getAttribute('data-title')||'';
      if(img&&src){img.src=src;img.alt=prefix+' — '+name;}
      var lab=art.querySelector('.color-name'); if(lab)lab.textContent=name;
      var h=art.querySelector('h3'); if(h&&prefix)h.textContent=prefix+' — '+name;
      var add=art.querySelector('[data-add]');
      if(add&&prefix){var sz=art.querySelector('.size-opt.on');var size=sz?sz.getAttribute('data-size'):null;add.setAttribute('data-base',prefix+' — '+name);add.setAttribute('data-add',prefix+' — '+name+(size?' — '+size:''));}
    });
  });
  document.querySelectorAll('[data-add]').forEach(function(b){b.addEventListener('click',function(){addToCart(b.getAttribute('data-add'),parseInt(b.getAttribute('data-price')||'0',10))})});
  document.querySelectorAll('.drop>button').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();b.parentElement.classList.toggle('open')})});

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
