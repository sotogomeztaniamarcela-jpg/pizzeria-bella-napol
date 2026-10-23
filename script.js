const TELEFONO = "573205359482"; // 57 = Colombia

const productos = [
  {cat:"pizzas", nombre:"Margarita", desc:"Salsa de tomate, mozzarella y albahaca fresca.", precio:28000, img:"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500"},
  {cat:"pizzas", nombre:"Pepperoni", desc:"Mozzarella y abundante pepperoni.", precio:32000, img:"https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500"},
  {cat:"pizzas", nombre:"Hawaiana", desc:"Jamón, piña y queso mozzarella.", precio:30000, img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500"},
  {cat:"entradas", nombre:"Palitos de ajo", desc:"Pan horneado con mantequilla de ajo y queso.", precio:12000, img:"https://images.unsplash.com/photo-1619531040576-f9416740661b?w=500"},
  {cat:"entradas", nombre:"Bruschettas", desc:"Pan tostado con tomate, albahaca y aceite de oliva.", precio:14000, img:"https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500"},
  {cat:"bebidas", nombre:"Gaseosa 400 ml", desc:"Fría, en varios sabores.", precio:4000, img:"https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=500"},
  {cat:"bebidas", nombre:"Limonada natural", desc:"Preparada al momento.", precio:6000, img:"https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500"},
  {cat:"postres", nombre:"Tiramisú", desc:"Clásico postre italiano con café y cacao.", precio:13000, img:"https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500"},
  {cat:"postres", nombre:"Panna cotta", desc:"Crema suave con salsa de frutos rojos.", precio:12000, img:"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500"}
];

let ubicacionActual = null;   // { lat, lng }
let watchId = null;

const $ = (id) => document.getElementById(id);
const dinero = (n) => "$" + n.toLocaleString("es-CO");

/* ---------- WhatsApp ---------- */
function linkWhatsApp(producto) {
  let msg = producto
    ? `Hola Bella Napoli, quiero pedir: ${producto}.`
    : "Hola Bella Napoli, quiero hacer un pedido.";
  if (ubicacionActual) {
    msg += `\nMi ubicación en tiempo real: https://maps.google.com/?q=${ubicacionActual.lat},${ubicacionActual.lng}`;
  }
  return `https://wa.me/${TELEFONO}?text=${encodeURIComponent(msg)}`;
}

function abrirWhatsApp(producto) {
  window.open(linkWhatsApp(producto), "_blank", "noopener");
}

/* ---------- Menú ---------- */
function mostrarMenu(cat) {
  const lista = cat === "todos" ? productos : productos.filter(p => p.cat === cat);
  $("gridMenu").innerHTML = lista.map(p => `
    <article class="card">
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
      <div class="card-cuerpo">
        <h3>${p.nombre}</h3>
        <p>${p.desc}</p>
        <span class="precio">${dinero(p.precio)}</span>
        <button class="btn btn-wa" data-pedido="${p.nombre}">Pedir por WhatsApp</button>
      </div>
    </article>`).join("");
}

/* ---------- Ubicación en tiempo real ---------- */
function iniciarUbicacion() {
  const estado = $("estadoUbicacion");
  if (!navigator.geolocation) {
    estado.textContent = "Tu navegador no permite geolocalización.";
    return;
  }
  estado.textContent = "Buscando tu ubicación...";
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      ubicacionActual = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      $("mapa").src = `https://maps.google.com/maps?q=${ubicacionActual.lat},${ubicacionActual.lng}&z=17&output=embed`;
      estado.textContent = "📡 Compartiendo tu ubicación en tiempo real. Se enviará con tu pedido.";
      $("btnUbicacion").hidden = true;
      $("btnDetener").hidden = false;
      actualizarLinks();
    },
    (err) => {
      const msj = {1: "Permiso denegado. Actívalo en el navegador.", 2: "No se pudo obtener la ubicación.", 3: "Se agotó el tiempo de espera."};
      estado.textContent = msj[err.code] || "Error de ubicación.";
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );
}

function detenerUbicacion() {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
  ubicacionActual = null;
  $("mapa").src = "https://maps.google.com/maps?q=Canalete,Cordoba,Colombia&z=14&output=embed";
  $("estadoUbicacion").textContent = "Dejaste de compartir tu ubicación.";
  $("btnUbicacion").hidden = false;
  $("btnDetener").hidden = true;
  actualizarLinks();
}

function actualizarLinks() {
  $("btnWhatsApp").href = linkWhatsApp();
  $("btnPedirHero").href = linkWhatsApp();
}

/* ---------- Eventos ---------- */
document.addEventListener("DOMContentLoaded", () => {
  mostrarMenu("todos");
  actualizarLinks();
  $("btnWhatsApp").target = "_blank";
  $("btnPedirHero").target = "_blank";

  // Filtros
  document.querySelectorAll(".filtro").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filtro").forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
      mostrarMenu(btn.dataset.cat);
    });
  });

  // Pedir producto (delegación de eventos)
  $("gridMenu").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pedido]");
    if (btn) abrirWhatsApp(btn.dataset.pedido);
  });

  // Ubicación
  $("btnUbicacion").addEventListener("click", iniciarUbicacion);
  $("btnDetener").addEventListener("click", detenerUbicacion);

  // Menú hamburguesa
  $("btnMenu").addEventListener("click", () => $("nav").classList.toggle("abierto"));
  document.querySelectorAll("#nav a").forEach(a =>
    a.addEventListener("click", () => $("nav").classList.remove("abierto")));

  // Volver arriba
  window.addEventListener("scroll", () =>
    $("btnSubir").classList.toggle("visible", window.scrollY > 300));
  $("btnSubir").addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }));
});