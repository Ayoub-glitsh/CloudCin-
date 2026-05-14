const express = require('express');
const router = express.Router();
const Film = require('../models/Film');

// POST /films — Créer un film
router.post('/', async (req, res) => {
  try {
    const film = new Film(req.body);
    const saved = await film.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Un film avec ce codefilm existe déjà.' });
    }
    res.status(400).json({ error: err.message });
  }
});

// GET /films — Liste de tous les films
router.get('/', async (req, res) => {
  try {
    const films = await Film.find().sort({ datepublication: -1 });
    res.json(films);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /films/:codefilm — Détail d'un film
router.get('/:codefilm', async (req, res) => {
  try {
    const film = await Film.findOne({ codefilm: req.params.codefilm });
    if (!film) {
      return res.status(404).json({ error: 'Film non trouvé.' });
    }
    res.json(film);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /films/:codefilm — Modifier un film
router.put('/:codefilm', async (req, res) => {
  try {
    const film = await Film.findOneAndUpdate(
      { codefilm: req.params.codefilm },
      req.body,
      { new: true, runValidators: true }
    );
    if (!film) {
      return res.status(404).json({ error: 'Film non trouvé.' });
    }
    res.json(film);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /films/:codefilm — Supprimer un film
router.delete('/:codefilm', async (req, res) => {
  try {
    const film = await Film.findOneAndDelete({ codefilm: req.params.codefilm });
    if (!film) {
      return res.status(404).json({ error: 'Film non trouvé.' });
    }
    res.json({ message: 'Film supprimé avec succès.', film });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
