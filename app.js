
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
  document.querySelectorAll('[data-add]').forEach(function(b){b.addEventListener('click',function(){addToCart(b.getAttribute('data-add'),parseInt(b.getAttribute('data-price')||'0',10))})});
  document.querySelectorAll('.drop>button').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();b.parentElement.classList.toggle('open')})});
});
