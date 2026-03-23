# API de Gestion d'Articles - TP INF 222 (QuickBlog)

Ce projet est une API simple pour gérer des articles de blog, conçue pour être légère et optimisée pour un déploiement sur Render. Il utilise Node.js avec Express pour le serveur et SQLite pour le stockage des données.

Cette version regroupe toute la logique backend (API et Documentation Swagger) dans un seul fichier `server.js` pour une simplicité maximale.

## Fonctionnalités
- **CRUD Complet** : Création, lecture, modification et suppression d'articles.
- **Recherche & Filtrage** : Recherche par mot-clé et filtrage par catégorie.
- **Documentation API** : Documentation interactive via Swagger UI.
- **Interface Web** : Une interface utilisateur moderne, responsive et stylisée (thème rose et fleuri).

## Installation et Lancement

1.  **Installer les dépendances** :
    ```bash
    npm install
    ```

2.  **Lancer le serveur** :
    ```bash
    npm start
    ```
    Le serveur sera disponible sur `http://localhost:3000`.

## Endpoints de l'API

Toutes les routes commencent par `/api/articles`.

| Méthode | Route | Description |
| --- | --- | --- |
| **POST** | `/api/articles` | Créer un nouvel article. |
| **GET** | `/api/articles` | Voir tous les articles (filtres optionnels via `?category=...`). |
| **GET** | `/api/articles/:id` | Détails d'un article par son ID. |
| **GET** | `/api/articles/search` | Rechercher dans le titre ou le contenu (`?query=...`). |
| **PUT** | `/api/articles/:id` | Modifier un article existant. |
| **DELETE** | `/api/articles/:id` | Supprimer un article. |

## Documentation Swagger
Accédez à la documentation interactive et testez l'API directement sur :
- `http://localhost:3000/docs`

## Structure des données
Chaque article contient :
- **Titre**, **Auteur**, **Contenu**, **Date**, **Catégorie** (Obligatoires)
- **Tags** (Optionnel)

