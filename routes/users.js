const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupère la liste des utilisateurs
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.render('users/index', { users });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

/**
 * @swagger
 * /users/new:
 *   get:
 *     summary: Affiche le formulaire pour créer un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Formulaire affiché avec succès
 */
router.get('/new', (req, res) => {
  res.render('users/new');
});

/**
 * @swagger
 * /users/{id}/edit:
 *   get:
 *     summary: Affiche le formulaire de modification d’un utilisateur
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l’utilisateur à modifier
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Formulaire affiché avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:id/edit', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('Utilisateur non trouvé');
  res.render('users/edit', { user });
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirection après création
 *       400:
 *         description: Erreur lors de la création
 */
router.post('/', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    await newUser.save();
    res.cookie('flash', JSON.stringify({ type: 'success', text: 'Utilisateur ajouté avec succès' }));
    res.redirect('/users');
  } catch (err) {
    res.status(400).send("Erreur lors de l’ajout de l'utilisateur");
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Met à jour un utilisateur existant
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l’utilisateur
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirection après mise à jour
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', async (req, res) => {
  try {
    const updates = {
      username: req.body.username,
      email: req.body.email
    };

    if (req.body.password && req.body.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      updates.password = hashedPassword;
    }

    await User.findByIdAndUpdate(req.params.id, updates);
    
    res.cookie('flash', JSON.stringify({ type: 'success', text: 'Utilisateur mis à jour avec succès' }));
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la mise à jour de l'utilisateur");
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l’utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirection après suppression
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send('Utilisateur non trouvé');
    res.cookie('flash', JSON.stringify({ type: 'danger', text: 'Utilisateur supprimé avec succès' }));
    res.redirect('/users');
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;