// Lógica para favoritos, rutinas, recordatorios y racha de cuidado personal en feed.html
// Se asume que el usuario está autenticado y su info está en localStorage

// Utilidades
function getUsuarioActual() {
    return JSON.parse(localStorage.getItem('usuarioActual'));
}

function guardarFavorito(idPublicacion) {
    const usuario = getUsuarioActual();
    if (!usuario) return;
    let favoritos = JSON.parse(localStorage.getItem('favoritos_' + usuario.usuario)) || [];
    if (favoritos.includes(idPublicacion)) {
        favoritos = favoritos.filter(id => id !== idPublicacion);
    } else {
        favoritos.push(idPublicacion);
    }
    localStorage.setItem('favoritos_' + usuario.usuario, JSON.stringify(favoritos));
    renderFeed();
}

function esFavorito(idPublicacion) {
    const usuario = getUsuarioActual();
    if (!usuario) return false;
    const favoritos = JSON.parse(localStorage.getItem('favoritos_' + usuario.usuario)) || [];
    return favoritos.includes(idPublicacion);
}

// Rutinas personalizadas
function guardarRutina(rutina) {
    const usuario = getUsuarioActual();
    if (!usuario) return;
    let rutinas = JSON.parse(localStorage.getItem('rutinas_' + usuario.usuario)) || [];
    rutinas.push(rutina);
    localStorage.setItem('rutinas_' + usuario.usuario, JSON.stringify(rutinas));
    renderRutinas();
}

function obtenerRutinas() {
    const usuario = getUsuarioActual();
    if (!usuario) return [];
    return JSON.parse(localStorage.getItem('rutinas_' + usuario.usuario)) || [];
}

// Recordatorios y racha
function activarRecordatorio(rutinaId) {
    const usuario = getUsuarioActual();
    if (!usuario) return;
    let recordatorios = JSON.parse(localStorage.getItem('recordatorios_' + usuario.usuario)) || [];
    if (!recordatorios.includes(rutinaId)) {
        recordatorios.push(rutinaId);
        localStorage.setItem('recordatorios_' + usuario.usuario, JSON.stringify(recordatorios));
    }
    renderRutinas();
}

function obtenerRacha() {
    const usuario = getUsuarioActual();
    if (!usuario) return 0;
    return parseInt(localStorage.getItem('racha_' + usuario.usuario) || '0');
}

function incrementarRacha() {
    const usuario = getUsuarioActual();
    if (!usuario) return;
    let racha = obtenerRacha();
    racha++;
    localStorage.setItem('racha_' + usuario.usuario, racha);
    renderRacha();
}

// Renderizado de feed y rutinas
function renderFeed() {
    // Simulación de publicaciones
    const publicaciones = [
        {id: 1, autor: 'Ana', texto: 'Rutina facial diaria', tipo: 'rutina'},
        {id: 2, autor: 'Carlos', texto: 'Receta de smoothie saludable', tipo: 'receta'},
        {id: 3, autor: 'María', texto: 'Tips para cabello brillante', tipo: 'rutina'}
    ];
    const lista = document.getElementById('publicaciones-lista');
    lista.innerHTML = '';
    publicaciones.forEach(pub => {
        const div = document.createElement('div');
        div.className = 'publicacion';
        div.innerHTML = `
            <b>${pub.autor}</b>: ${pub.texto}
            <button onclick="guardarFavorito(${pub.id})" class="btn-fav">${esFavorito(pub.id) ? '★' : '☆'}</button>
        `;
        lista.appendChild(div);
    });
}

function renderRutinas() {
    const rutinas = obtenerRutinas();
    const seccion = document.getElementById('feed-recomendaciones');
    let html = '<h3>Mis rutinas personalizadas</h3>';
    if (rutinas.length === 0) {
        html += '<p>No tienes rutinas guardadas.</p>';
    } else {
        html += '<ul>';
        rutinas.forEach((r, i) => {
            html += `<li>${r.nombre} <button onclick="activarRecordatorio(${i})">Recordar</button></li>`;
        });
        html += '</ul>';
    }
    // Formulario para crear rutina
    html += `
        <form id="form-rutina">
            <input type="text" id="nombre-rutina" placeholder="Nombre de la rutina" required>
            <button type="submit">Guardar rutina</button>
        </form>
    `;
    seccion.innerHTML = html;
    document.getElementById('form-rutina').onsubmit = function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-rutina').value;
        guardarRutina({nombre});
        this.reset();
    };
}

function renderRacha() {
    const racha = obtenerRacha();
    let el = document.getElementById('racha-cuidado');
    if (!el) {
        el = document.createElement('div');
        el.id = 'racha-cuidado';
        document.querySelector('main').prepend(el);
    }
    el.innerHTML = `<b>Racha de cuidado personal:</b> ${racha} días seguidos <button onclick="incrementarRacha()">+1 día</button>`;
}

window.onload = function() {
    renderFeed();
    renderRutinas();
    renderRacha();
};
