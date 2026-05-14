const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = 3002;
const GATEWAY_URL = 'http://localhost:8000/movies';
const AUTH_TOKEN = 'Bearer secret-cloud-cine';

// GET / — Page HTML d'affichage des films
app.get('/', async (req, res) => {
  let films = [];
  let errorMessage = null;

  try {
    const response = await fetch(GATEWAY_URL, {
      headers: { authorization: AUTH_TOKEN },
    });

    if (!response.ok) {
      throw new Error(`Erreur API Gateway : ${response.status} ${response.statusText}`);
    }

    films = await response.json();
  } catch (err) {
    errorMessage = err.message;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const cardsHTML = films.length
    ? films
        .map(
          (film) => `
        <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
          <div class="card h-100 shadow-sm">
            <img
              src="${film.miniature}"
              class="card-img-top"
              alt="Miniature de ${film.titre}"
              style="height: 220px; object-fit: cover;"
              onerror="this.src='https://via.placeholder.com/300x220?text=Image+indisponible'"
            />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${film.titre}</h5>
              <p class="card-text text-muted small mb-3">
                <i class="bi bi-calendar3"></i> ${formatDate(film.datepublication)}
              </p>
              <a
                href="${film.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary mt-auto"
              >
                Voir détail
              </a>
            </div>
          </div>
        </div>`
        )
        .join('')
    : '<div class="col-12"><p class="text-center text-muted">Aucun film disponible.</p></div>';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CloudCiné — Catalogue</title>
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
    rel="stylesheet"
  />
  <style>
    body { background-color: #0d1117; color: #e6edf3; }
    .navbar { background-color: #161b22; }
    .card { background-color: #161b22; border: 1px solid #30363d; color: #e6edf3; }
    .card-title { color: #58a6ff; }
    .btn-primary { background-color: #238636; border-color: #238636; }
    .btn-primary:hover { background-color: #2ea043; border-color: #2ea043; }
  </style>
</head>
<body>
  <nav class="navbar navbar-dark mb-4">
    <div class="container">
      <span class="navbar-brand fw-bold fs-4">
        <i class="bi bi-camera-reels-fill text-primary"></i> CloudCiné
      </span>
    </div>
  </nav>

  <div class="container">
    <h2 class="mb-4">Catalogue des films</h2>

    ${
      errorMessage
        ? `<div class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle-fill"></i> ${errorMessage}
           </div>`
        : ''
    }

    <div class="row">
      ${cardsHTML}
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

  res.send(html);
});

app.listen(PORT, () => {
  console.log(`movie-viewer démarré sur http://localhost:${PORT}`);
});
