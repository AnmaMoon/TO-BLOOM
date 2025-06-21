// Entry point for client-side JS (to be filled with logic from index.html)

// Move all the main <script> logic from your old index.html here
// For now, just show a message to confirm JS is working
window.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('beforeend', '<div style="position:fixed;bottom:10px;right:10px;background:#388e3c;color:#fff;padding:0.5rem 1rem;border-radius:8px;z-index:9999;">JS conectado</div>');
  setTimeout(() => {
    const el = document.querySelector('div[style*="JS conectado"]');
    if (el) el.remove();
  }, 2000);
});

// --- UI Elements ---
const authContainer = document.getElementById('auth-container');
const mainContent = document.getElementById('main-content');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const verUsuariosBtn = document.getElementById('ver-usuarios-btn');
const usuariosGuardados = document.getElementById('usuarios-guardados');

// --- Show Register ---
showRegister.onclick = function(e) {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    loginError.style.display = 'none';
    registerError.style.display = 'none';
};
// --- Show Login ---
showLogin.onclick = function(e) {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    registerError.style.display = 'none';
    loginError.style.display = 'none';
};
// --- Register Form Submit (with backend call) ---
registerForm.querySelector('form').onsubmit = async function(e) {
    e.preventDefault();
    let nombre = document.getElementById('register-nombre').value;
    let apellidos = document.getElementById('register-apellidos').value;
    let usuario = document.getElementById('register-user').value;
    let email = document.getElementById('register-email').value;
    let password = document.getElementById('register-password').value;
    let password2 = document.getElementById('register-password2').value;
    if(password !== password2) {
        registerError.textContent = 'Las contraseñas no coinciden.';
        registerError.style.display = 'block';
        return;
    }
    // Backend call to register
    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellidos, usuario, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error de registro');
        registerError.style.display = 'none';
        // Save user info to localStorage for perfil
        localStorage.setItem('user_' + usuario, JSON.stringify({ nombre, apellidos, usuario, email }));
        // Show a nice Bootstrap toast or alert
        showPopup('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        registerForm.querySelector('form').reset();
    } catch (err) {
        registerError.textContent = err.message;
        registerError.style.display = 'block';
    }
};

// --- Login Form Submit (with backend call) ---
loginForm.querySelector('form').onsubmit = async function(e) {
    e.preventDefault();
    const userInput = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-password').value;
    const keepLogged = document.getElementById('keep-logged').checked;
    // Backend call to login
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userInput, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Usuario, email o contraseña incorrectos.');
        loginError.style.display = 'none';
        if(keepLogged) {
            localStorage.setItem('keepLogged', 'true');
            localStorage.setItem('loggedUser', data.usuario);
        } else {
            localStorage.removeItem('keepLogged');
            localStorage.setItem('loggedUser', data.usuario);
        }
        // Save user info to localStorage for perfil
        localStorage.setItem('user_' + data.usuario, JSON.stringify({ nombre: data.nombre, apellidos: data.apellidos, usuario: data.usuario, email: data.email }));
        authContainer.style.display = 'none';
        mainContent.style.display = 'block';
        showSection('inicio');
        cargarPerfil();
        mostrarBienvenidaUsuario();
        // After successful login, fill perfil info
        fillPerfilInfo(data);
    } catch (err) {
        loginError.textContent = err.message;
        loginError.style.display = 'block';
    }
};
// --- Show Saved Users ---
verUsuariosBtn.onclick = function() {
    let html = '';
    for(let key in localStorage) {
        if(key.startsWith('user_')) {
            const data = JSON.parse(localStorage.getItem(key));
            html += `<div><b>${data.usuario}</b> (${data.email})</div>`;
        }
    }
    usuariosGuardados.innerHTML = html || '<i>No hay usuarios guardados.</i>';
    usuariosGuardados.style.display = usuariosGuardados.style.display === 'none' ? 'block' : 'none';
};
// --- On Load: Always show login or main if keepLogged ---
window.onload = function() {
    const keepLogged = localStorage.getItem('keepLogged') === 'true';
    const loggedUser = localStorage.getItem('loggedUser');
    if(keepLogged && loggedUser) {
        authContainer.style.display = 'none';
        mainContent.style.display = 'block';
        showSection('inicio');
        cargarPerfil();
        mostrarBienvenidaUsuario();
        showLogoutBtn(true); // Show logout button when logged in
    } else {
        authContainer.style.display = 'block';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        mainContent.style.display = 'none';
        showLogoutBtn(false); // Hide logout button when not logged in
    }
};
// --- Navigation ---
document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(this.dataset.section);
        if(this.dataset.section === 'perfil') cargarPerfil();
        if(this.dataset.section === 'inicio') mostrarBienvenidaUsuario();
    });
});
function showSection(section) {
    document.querySelectorAll('.main-section').forEach(sec => sec.style.display = 'none');
    const sec = document.getElementById(section);
    if(sec) sec.style.display = 'block';
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const active = document.querySelector(`.nav-link[data-section="${section}"]`);
    if(active) active.classList.add('active');
}
// --- Perfil ---
function cargarPerfil() {
    const usuario = localStorage.getItem('loggedUser');
    if (!usuario) {
        document.getElementById('perfil-usuario').textContent = '-';
        document.getElementById('perfil-nombre').textContent = '-';
        document.getElementById('perfil-email').textContent = '-';
        document.getElementById('perfil-foto').src = '../assets/download.png';
        document.getElementById('defectos-text').value = '';
        return;
    }
    const userDataRaw = localStorage.getItem('user_' + usuario);
    if (!userDataRaw) {
        document.getElementById('perfil-usuario').textContent = '-';
        document.getElementById('perfil-nombre').textContent = '-';
        document.getElementById('perfil-email').textContent = '-';
        document.getElementById('perfil-foto').src = 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/user.svg';
        document.getElementById('defectos-text').value = '';
        return;
    }
    let userData;
    try {
        userData = JSON.parse(userDataRaw);
    } catch {
        document.getElementById('perfil-usuario').textContent = '-';
        document.getElementById('perfil-nombre').textContent = '-';
        document.getElementById('perfil-email').textContent = '-';
        document.getElementById('perfil-foto').src = 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/user.svg';
        document.getElementById('defectos-text').value = '';
        return;
    }
    document.getElementById('perfil-usuario').textContent = userData.usuario || userData.username || '-';
    document.getElementById('perfil-nombre').textContent = (userData.nombre ? userData.nombre + (userData.apellidos ? ' ' + userData.apellidos : '') : '-');
    document.getElementById('perfil-email').textContent = userData.email || '-';
    document.getElementById('perfil-foto').src = userData.fotoPerfil || 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/user.svg';
    document.getElementById('defectos-text').value = userData.defectos || '';
}
// --- Bienvenida usuario ---
function mostrarBienvenidaUsuario() {
    const usuario = localStorage.getItem('loggedUser');
    if (!usuario) return;
    const userData = JSON.parse(localStorage.getItem('user_' + usuario));
    if (userData && userData.nombre) {
        document.getElementById('inicio').querySelector('h2').innerHTML = `¡Bienvenida, <span style="color:#d63384;">${userData.nombre}</span>!`;
    }
}

// --- Popup function ---
function showPopup(message, type = 'success') {
    let popup = document.createElement('div');
    popup.className = `toast align-items-center text-bg-${type} border-0 show position-fixed top-0 start-50 translate-middle-x mt-4`;
    popup.style.zIndex = 9999;
    popup.style.minWidth = '250px';
    popup.innerHTML = `
      <div class="d-flex">
        <div class="toast-body w-100 text-center">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => popup.remove(), 500);
    }, 2500);
    popup.querySelector('.btn-close').onclick = () => popup.remove();
}

// Ensure perfil info is filled on page load and when section is shown
function getLoggedUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function fillPerfilInfo() {
  const user = getLoggedUser();
  const usuarioSpan = document.getElementById('perfil-usuario');
  const nombreSpan = document.getElementById('perfil-nombre');
  const emailSpan = document.getElementById('perfil-email');
  const fotoImg = document.getElementById('perfil-foto');
  if (user) {
    usuarioSpan.textContent = user.username || user.user || '';
    nombreSpan.textContent = user.nombre || '';
    emailSpan.textContent = user.email || '';
    const name = (user.nombre || user.username || user.user || 'Usuario').split(' ')[0];
    fotoImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  } else {
    usuarioSpan.textContent = '';
    nombreSpan.textContent = '';
    emailSpan.textContent = '';
    fotoImg.src = 'https://ui-avatars.com/api/?name=Usuario';
  }
}

// Call fillPerfilInfo on nav click and on page load
const perfilNav = document.querySelector('[data-section="perfil"]');
if (perfilNav) {
  perfilNav.addEventListener('click', fillPerfilInfo);
}
window.addEventListener('DOMContentLoaded', fillPerfilInfo);

// --- Logout ---
const logoutBtn = document.getElementById('logout-btn');
function showLogoutBtn(show) {
    if (logoutBtn) logoutBtn.style.display = show ? 'block' : 'none';
}
logoutBtn.onclick = function() {
    localStorage.removeItem('keepLogged');
    localStorage.removeItem('loggedUser');
    window.location.reload();
};
// Show logout button only when logged in
window.addEventListener('DOMContentLoaded', () => {
    const loggedUser = localStorage.getItem('loggedUser');
    showLogoutBtn(!!loggedUser);
});
