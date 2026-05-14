# CloudCiné

Plateforme de catalogue de films basée sur une architecture microservices Node.js/Express. Elle repose sur trois services indépendants : un gestionnaire de films connecté à MongoDB, un visualiseur web avec interface Bootstrap, et une API Gateway centralisant les accès avec authentification par token et journalisation des requêtes.

---

## Architecture

```
                        ┌─────────────────────┐
                        │     API Gateway      │
                        │     Port 8000        │
                        │                      │
                        │  - Logger middleware │
                        │  - Auth middleware   │
                        └──────────┬───────────┘
                                   │
               ┌───────────────────┴───────────────────┐
               │                                       │
               ▼                                       ▼
   ┌───────────────────────┐             ┌───────────────────────┐
   │    movie-manager      │             │    movie-viewer       │
   │    Port 3001          │             │    Port 3002          │
   │                       │             │                       │
   │  - REST API films     │             │  - Interface HTML     │
   │  - MongoDB            │             │  - Bootstrap 5        │
   └───────────┬───────────┘             └───────────────────────┘
               │
               ▼
   ┌───────────────────────┐
   │  MongoDB              │
   │  movie_db             │
   │  Port 27017           │
   └───────────────────────┘
```

---

## Structure du projet

```
CloudCiné/
├── api-gateway/
│   ├── server.js          # Gateway : proxy, logger, auth
│   └── package.json
├── movie-manager/
│   ├── models/
│   │   └── Film.js        # Schéma Mongoose
│   ├── routes/
│   │   └── films.js       # Routes REST CRUD
│   ├── server.js          # Serveur Express + connexion MongoDB
│   └── package.json
├── movie-viewer/
│   ├── server.js          # Rendu HTML avec Bootstrap
│   └── package.json
├── .gitignore
└── README.md
```

---

## Prérequis

- [Node.js](https://nodejs.org/) v18 ou supérieur
- [MongoDB](https://www.mongodb.com/) en local sur le port `27017`
- npm v9 ou supérieur

---

## Installation

Installer les dépendances de chaque service :

```bash
# API Gateway
cd api-gateway && npm install

# Movie Manager
cd ../movie-manager && npm install

# Movie Viewer
cd ../movie-viewer && npm install
```

---

## Démarrage

Lancer chaque service dans un terminal séparé :

```bash
# Terminal 1 — movie-manager (port 3001)
cd movie-manager && npm start

# Terminal 2 — movie-viewer (port 3002)
cd movie-viewer && npm start

# Terminal 3 — api-gateway (port 8000)
cd api-gateway && npm start
```

---

## Services

### 1. movie-manager — Port 3001

Microservice de gestion des films. Expose une API REST connectée à MongoDB.

#### Modèle Film

| Champ            | Type   | Contrainte     |
|------------------|--------|----------------|
| `codefilm`       | String | Requis, unique |
| `titre`          | String | Requis         |
| `datepublication`| Date   | Requis         |
| `url`            | String | Requis         |
| `miniature`      | String | Requis         |

#### Routes REST

| Méthode | Route                  | Description              |
|---------|------------------------|--------------------------|
| POST    | `/films`               | Créer un film            |
| GET     | `/films`               | Lister tous les films    |
| GET     | `/films/:codefilm`     | Détail d'un film         |
| PUT     | `/films/:codefilm`     | Modifier un film         |
| DELETE  | `/films/:codefilm`     | Supprimer un film        |

#### Exemples avec curl

**Créer un film :**
```bash
curl -X POST http://localhost:3001/films \
  -H "Content-Type: application/json" \
  -d '{
    "codefilm": "FILM001",
    "titre": "Inception",
    "datepublication": "2010-07-16",
    "url": "https://example.com/inception",
    "miniature": "https://example.com/inception.jpg"
  }'
```

**Lister les films :**
```bash
curl http://localhost:3001/films
```

**Détail d'un film :**
```bash
curl http://localhost:3001/films/FILM001
```

**Modifier un film :**
```bash
curl -X PUT http://localhost:3001/films/FILM001 \
  -H "Content-Type: application/json" \
  -d '{ "titre": "Inception (Director Cut)" }'
```

**Supprimer un film :**
```bash
curl -X DELETE http://localhost:3001/films/FILM001
```

---

### 2. movie-viewer — Port 3002

Microservice d'affichage. Génère une page HTML côté serveur avec une grille responsive Bootstrap 5.

- Récupère les films via l'API Gateway (`http://localhost:8000/movies`)
- Injecte automatiquement le token d'authentification
- Affiche les films en cartes (miniature, titre, date, lien "Voir détail")
- Gestion des erreurs si le gateway est indisponible

**Accès :**
```
http://localhost:3002/
```

---

### 3. API Gateway — Port 8000

Point d'entrée unique de l'architecture. Centralise le routage, la sécurité et la journalisation.

#### Proxy

| Route      | Redirige vers                        |
|------------|--------------------------------------|
| `/movies*` | `http://localhost:3001/films` (movie-manager) |
| `/view`    | `http://localhost:3002/` (movie-viewer)       |

#### Middleware Logger

Journalise chaque requête entrante dans la console :

```
[2024-01-15T10:30:00.000Z] GET /movies
[2024-01-15T10:30:01.000Z] POST /movies
```

#### Middleware Authentification

Toutes les routes `/movies*` sont protégées. Le header `Authorization` doit être présent et valide.

**Header requis :**
```
Authorization: Bearer secret-cloud-cine
```

**Accès refusé (401) si le token est absent ou incorrect :**
```json
{ "error": "Non autorisé. Token manquant ou invalide." }
```

#### Exemples avec curl via le Gateway

**Lister les films (avec token) :**
```bash
curl http://localhost:8000/movies \
  -H "Authorization: Bearer secret-cloud-cine"
```

**Créer un film via le Gateway :**
```bash
curl -X POST http://localhost:8000/movies \
  -H "Authorization: Bearer secret-cloud-cine" \
  -H "Content-Type: application/json" \
  -d '{
    "codefilm": "FILM002",
    "titre": "Interstellar",
    "datepublication": "2014-11-05",
    "url": "https://example.com/interstellar",
    "miniature": "https://example.com/interstellar.jpg"
  }'
```

**Accéder au visualiseur via le Gateway :**
```bash
http://localhost:8000/view
```

---

## Variables et configuration

| Paramètre       | Valeur par défaut                        | Fichier              |
|-----------------|------------------------------------------|----------------------|
| Port Gateway    | `8000`                                   | api-gateway/server.js |
| Port Manager    | `3001`                                   | movie-manager/server.js |
| Port Viewer     | `3002`                                   | movie-viewer/server.js |
| MongoDB URI     | `mongodb://localhost:27017/movie_db`     | movie-manager/server.js |
| Token auth      | `Bearer secret-cloud-cine`              | api-gateway/server.js |

---

## Technologies utilisées

| Technologie           | Usage                              |
|-----------------------|------------------------------------|
| Node.js               | Runtime JavaScript                 |
| Express.js            | Framework HTTP                     |
| Mongoose              | ODM MongoDB                        |
| MongoDB               | Base de données                    |
| http-proxy-middleware | Proxy dans l'API Gateway           |
| node-fetch            | Requêtes HTTP dans movie-viewer    |
| Bootstrap 5           | Interface utilisateur              |

---

## Auteur

**Ayoub Aguezar**  
Projet Cloud Native — Architecture Microservices
