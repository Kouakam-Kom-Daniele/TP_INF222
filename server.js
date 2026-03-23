const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.resolve(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Erreur de connexion SQLite:', err.message);
    else {
        console.log('Connecté à SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titre TEXT NOT NULL,
            contenu TEXT NOT NULL,
            auteur TEXT NOT NULL,
            date TEXT NOT NULL,
            categorie TEXT NOT NULL,
            tags TEXT
        )`);
    }
});

// Configuration Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Tech Noir - TP INF 222',
            version: '1.0.0',
            description: 'API centralisée pour la gestion des articles (Express + SQLite) - Thème Tech Noir',
        },
        servers: [{ url: `http://localhost:${port}` }],
    },
    apis: [__filename],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       required: [titre, contenu, auteur, date, categorie]
 *       properties:
 *         id: { type: integer, description: "Identifiant unique" }
 *         titre: { type: string }
 *         contenu: { type: string }
 *         auteur: { type: string }
 *         date: { type: string, format: date }
 *         categorie: { type: string }
 *         tags: { type: string }
 */

/**
 * @openapi
 * /api/articles:
 *   get:
 *     summary: Liste tous les articles
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/Article' } }
 */

// lire toute la DB
app.get('/api/articles', (req, res) => {
    const { category, author } = req.query;
    let sql = 'SELECT * FROM articles WHERE 1=1';
    let params = [];
    if (category) { sql += ' AND categorie = ?'; params.push(category); }
    if (author) { sql += ' AND auteur = ?'; params.push(author); }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/**
 * @openapi
 * /api/articles/search:
 *   get:
 *     summary: Rechercher des articles par titre ou contenu
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Succès }
 */

//recherche dans DB
app.get('/api/articles/search', (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Le paramètre query est requis' });
    const term = `%${query}%`;
    db.all('SELECT * FROM articles WHERE titre LIKE ? OR contenu LIKE ?', [term, term], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/**
 * @openapi
 * /api/articles/{id}:
 *   get:
 *     summary: Obtenir les détails d'un article
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Succès }
 *       404: { description: Article non trouvé }
 */

app.get('/api/articles/:id', (req, res) => {
    db.get('SELECT * FROM articles WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Article non trouvé' });
        res.json(row);
    });
});

/**
 * @openapi
 * /api/articles:
 *   post:
 *     summary: Créer un nouvel article
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Article' }
 */

//Ajouter
app.post('/api/articles', (req, res) => {
    const { titre, contenu, auteur, date, categorie, tags } = req.body;
    if (!titre || !contenu || !auteur || !date || !categorie) {
        return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    const sql = `INSERT INTO articles (titre, contenu, auteur, date, categorie, tags) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [titre, contenu, auteur, date, categorie, tags], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: 'Article créé avec succès' });
    });
});

/**
 * @openapi
 * /api/articles/{id}:
 *   put:
 *     summary: Modifier un article existant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Article' }
 */

//moddifier
app.put('/api/articles/:id', (req, res) => {
    const { titre, contenu, auteur, date, categorie, tags } = req.body;
    const sql = `UPDATE articles SET titre=?, contenu=?, auteur=?, date=?, categorie=?, tags=? WHERE id=?`;
    db.run(sql, [titre, contenu, auteur, date, categorie, tags, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Article non trouvé' });
        res.json({ message: 'Article mis à jour' });
    });
});

/**
 * @openapi
 * /api/articles/{id}:
 *   delete:
 *     summary: Supprimer un article
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */

//supprimer
app.delete('/api/articles/:id', (req, res) => {
    db.run('DELETE FROM articles WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Article non trouvé' });
        res.json({ message: 'Article supprimé' });
    });
});

// frontend base endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
    console.log(`Le serveur TP INF 222 tourne sur le port ${port}`);
});
