// Basic Express server setup
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from client
app.use(express.static(path.join(__dirname, '../client/public')));

// In-memory user store (replace with DB in production)
const users = {};

// Register endpoint
app.post('/api/register', (req, res) => {
  const { nombre, apellidos, usuario, email, password } = req.body;
  if (!usuario || !email || !password) return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  if (users[usuario] || Object.values(users).find(u => u.email === email)) {
    return res.status(400).json({ error: 'El usuario o email ya existe.' });
  }
  users[usuario] = { nombre, apellidos, usuario, email, password };
  res.json({ success: true, usuario });
});
// Login endpoint
app.post('/api/login', (req, res) => {
  const { userInput, password } = req.body;
  const user = users[userInput] || Object.values(users).find(u => u.email === userInput);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Usuario, email o contraseña incorrectos.' });
  }
  res.json({ success: true, usuario: user.usuario, nombre: user.nombre, email: user.email });
});
// API routes placeholder
app.use('/api', require('./routes'));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
