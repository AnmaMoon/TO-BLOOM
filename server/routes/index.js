// Placeholder for API routes
const express = require('express');
const router = express.Router();

// Example route
router.get('/test', (req, res) => {
  res.json({ message: 'API working!' });
});

module.exports = router;
