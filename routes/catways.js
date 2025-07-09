const express = require('express');
const router = express.Router();
const Catway = require('../models/Catway');


/**
 * @swagger
 * /catways:
 *   get:
 *     summary: Liste tous les catways
 *     tags: [Catways]
 *     responses:
 *       200:
 *         description: Liste des catways rendue dans une vue
 */
router.get('/', async (req, res) => {
  try {
    const catways = await Catway.find().sort('catwayNumber');
    res.render('catways/index', { catways });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

/**
 * @swagger
 * /catways/new:
 *   get:
 *     summary: Affiche le formulaire de création d’un catway
 *     tags: [Catways]
 *     responses:
 *       200:
 *         description: Formulaire HTML pour ajouter un catway
 */
router.get('/new', (req, res) => {
  res.render('catways/new');
});

/**
 * @swagger
 * /catways/{id}/edit:
 *   get:
 *     summary: Affiche le formulaire d'édition d’un catway
 *     tags: [Catways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numéro du catway
 *     responses:
 *       200:
 *         description: Formulaire HTML pour modifier un catway
 *       404:
 *         description: Catway non trouvé
 */
router.get('/:id/edit', async (req, res) => {
  const catway = await Catway.findOne({ catwayNumber: req.params.id });
  if (!catway) return res.status(404).send('Catway non trouvé');
  res.render('catways/edit', { catway });
});

/**
 * @swagger
 * /catways/{id}:
 *   get:
 *     summary: Récupère un catway en JSON
 *     tags: [Catways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numéro du catway
 *     responses:
 *       200:
 *         description: Objet catway
 *       404:
 *         description: Catway non trouvé
 */
router.get('/:id', async (req, res) => {
  const catway = await Catway.findOne({ catwayNumber: req.params.id });
  if (!catway) return res.status(404).json({ message: 'Catway non trouvé' });
  res.json(catway);
});

/**
 * @swagger
 * /catways:
 *   post:
 *     summary: Crée un nouveau catway
 *     tags: [Catways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - catwayNumber
 *               - catwayType
 *               - catwayState
 *             properties:
 *               catwayNumber:
 *                 type: integer
 *               catwayType:
 *                 type: string
 *               catwayState:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirection vers la liste
 *       400:
 *         description: Erreur de validation
 */
router.post('/', async (req, res) => {
  try {
    const newCatway = new Catway(req.body);
    await newCatway.save();

    res.cookie('flash', JSON.stringify({ type: 'success', text: 'Catway ajouté avec succès' }));
    res.redirect('/catways');
  } catch (err) {
    res.status(400).send("Erreur lors de l’ajout du catway");
  }
});

/**
 * @swagger
 * /catways/{id}:
 *   put:
 *     summary: Met à jour un catway
 *     tags: [Catways]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numéro du catway à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               catwayType:
 *                 type: string
 *               catwayState:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirection après mise à jour
 *       404:
 *         description: Catway non trouvé
 */
router.put('/:id', async (req, res) => {
  const updated = await Catway.findOneAndUpdate(
    { catwayNumber: req.params.id },
    {
      catwayState: req.body.catwayState,
      catwayType: req.body.catwayType
    },
    { new: true }
  );

  if (!updated) return res.status(404).send('Catway non trouvé');

  res.cookie('flash', JSON.stringify({ type: 'success', text: 'Catway modifié avec succès' }));
  res.redirect('/catways');
});

/**
 * @swagger
 * /catways/{id}:
 *   delete:
 *     summary: Supprime un catway
 *     tags: [Catways]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numéro du catway à supprimer
 *     responses:
 *       302:
 *         description: Redirection après suppression
 *       404:
 *         description: Catway non trouvé
 */
router.delete('/:id', async (req, res) => {
  const deleted = await Catway.findOneAndDelete({ catwayNumber: req.params.id });
  if (!deleted) return res.status(404).send('Catway non trouvé');

  res.cookie('flash', JSON.stringify({ type: 'danger', text: 'Catway supprimé avec succès' }));
  res.redirect('/catways');
});

const reservationRouter = require('./reservations');
router.use('/:id/reservations', reservationRouter);

module.exports = router;
