// Lógica para mostrar favoritos, rutinas y racha en perfil.html
function getUsuarioActual() {
    return JSON.parse(localStorage.getItem('usuarioActual'));
}

function obtenerFavoritos() {
    const usuario = getUsuarioActual();
    if (!usuario) return [];
    return JSON.parse(localStorage.getItem('favoritos_' + usuario.usuario)) || [];
}

function obtenerRutinas() {
    const usuario = getUsuarioActual();
    if (!usuario) return [];
    return JSON.parse(localStorage.getItem('rutinas_' + usuario.usuario)) || [];
}

function obtenerRacha() {
    const usuario = getUsuarioActual();
    if (!usuario) return 0;
    return parseInt(localStorage.getItem('racha_' + usuario.usuario) || '0');
}

function renderFavoritos() {
    const favoritos = obtenerFavoritos();
    const lista = document.getElementById('favoritos-lista');
    if (!lista) return;
    if (favoritos.length === 0) {
        lista.innerHTML = '<p>No tienes favoritos guardados.</p>';
    } else {
        lista.innerHTML = '<ul>' + favoritos.map(id => `<li>Publicación #${id}</li>`).join('') + '</ul>';
    }
}

function renderRutinas() {
    const rutinas = obtenerRutinas();
    const lista = document.getElementById('rutinas-lista');
    if (!lista) return;
    if (rutinas.length === 0) {
        lista.innerHTML = '<p>No tienes rutinas guardadas.</p>';
    } else {
        lista.innerHTML = '<ul>' + rutinas.map(r => `<li>${r.nombre}</li>`).join('') + '</ul>';
    }
}

function renderRacha() {
    const racha = obtenerRacha();
    const el = document.getElementById('racha-cuidado');
    if (el) {
        el.innerHTML = `<b>Racha de cuidado personal:</b> ${racha} días seguidos`;
    }
}

window.onload = function() {
    renderFavoritos();
    renderRutinas();
    renderRacha();
};
