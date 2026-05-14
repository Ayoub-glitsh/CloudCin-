const express = require('express');
const mongoose = require('mongoose');
const filmsRouter = require('./routes/films');

const app = express();
const PORT = 3001;
const MONGO_URI = 'mongodb://localhost:27017/movie_db';

// Middleware
app.use(express.json());

// Routes
app.use('/films', filmsRouter);

// Connexion MongoDB puis démarrage du serveur
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connecté à MongoDB (movie_db)');
    app.listen(PORT, () => {
      console.log(`movie-manager démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erreur de connexion MongoDB :', err.message);
    process.exit(1);
  });
