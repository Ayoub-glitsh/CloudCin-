const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8000;

// ─── Middleware : Logger ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ─── Middleware : Authentification simulée ────────────────────────────────────
// Protège toutes les routes /movies*
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader !== 'Bearer secret-cloud-cine') {
    return res.status(401).json({
      error: 'Non autorisé. Token manquant ou invalide.',
    });
  }
  next();
};

// ─── Proxy : /movies → movie-manager (port 3001) ─────────────────────────────
app.use(
  '/movies',
  authMiddleware,
  createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/movies': '/films' },
    on: {
      error: (err, req, res) => {
        console.error('Erreur proxy /movies :', err.message);
        res.status(502).json({ error: 'movie-manager indisponible.' });
      },
    },
  })
);

// ─── Proxy : /view → movie-viewer (port 3002) ────────────────────────────────
app.use(
  '/view',
  createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/view': '/' },
    on: {
      error: (err, req, res) => {
        console.error('Erreur proxy /view :', err.message);
        res.status(502).json({ error: 'movie-viewer indisponible.' });
      },
    },
  })
);

// ─── Route racine ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    service: 'API Gateway — CloudCiné',
    routes: {
      '/movies': 'movie-manager (port 3001) — authentification requise',
      '/view': 'movie-viewer (port 3002)',
    },
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway démarré sur http://localhost:${PORT}`);
});
