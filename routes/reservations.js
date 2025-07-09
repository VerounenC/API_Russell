const express = require('express');
const router = express.Router({ mergeParams: true });
const Reservation = require('../models/Reservation');

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Récupère toutes les réservations
 *     tags: [Réservations]
 *     responses:
 *       200:
 *         description: Liste des réservations
 *       500:
 *         description: Erreur serveur
 */
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.render('reservations/index', { reservations });
  } catch (err) {
    res.status(500).send("Erreur lors de la récupération des réservations");
  }
});

/**
 * @swagger
 * /reservations/new:
 *   get:
 *     summary: Affiche le formulaire de création de réservation
 *     tags: [Réservations]
 *     responses:
 *       200:
 *         description: Formulaire affiché
 */
router.get('/new', (req, res) => {
  res.render('reservations/new');
});

/**
 * @swagger
 * /reservations/{id}/edit:
 *   get:
 *     summary: Affiche le formulaire de modification d’une réservation
 *     tags: [Réservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Formulaire affiché
 *       404:
 *         description: Réservation non trouvée
 */
router.get('/:id/edit', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).send('Réservation non trouvée');
    
    res.render('reservations/edit', { reservation });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Crée une nouvelle réservation
 *     tags: [Réservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - catwayNumber
 *               - clientName
 *               - boatName
 *               - startDate
 *               - endDate
 *             properties:
 *               catwayNumber:
 *                 type: number
 *               clientName:
 *                 type: string
 *               boatName:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       302:
 *         description: Redirection vers /reservations
 *       400:
 *         description: Erreur de validation
 */
router.post('/', async (req, res) => {
  try {
    const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
    const newReservation = new Reservation({
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate
    });

    await newReservation.save();
    res.cookie('flash', JSON.stringify({ type: 'success', text: 'Réservation enregistrée avec succès' }));
    res.redirect('/reservations');
  } catch (err) {
    res.status(400).send('Erreur lors de la création de la réservation');
  }
});

/**
 * @swagger
 * /reservations/{id}:
 *   put:
 *     summary: Met à jour une réservation existante
 *     tags: [Réservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               catwayNumber:
 *                 type: number
 *               clientName:
 *                 type: string
 *               boatName:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       302:
 *         description: Redirection vers /reservations
 *       404:
 *         description: Réservation non trouvée
 */
router.put('/:id', async (req, res) => {
  const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;

  const updated = await Reservation.findByIdAndUpdate(
    req.params.id,
    { catwayNumber, clientName, boatName, startDate, endDate },
    { new: true }
  );

  if (!updated) return res.status(404).send('Réservation non trouvée');

  res.cookie('flash', JSON.stringify({ type: 'success', text: 'Réservation mise à jour' }));
  res.redirect('/reservations');
});

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     summary: Supprime une réservation
 *     tags: [Réservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       302:
 *         description: Redirection vers /reservations
 *       404:
 *         description: Réservation non trouvée
 */
router.delete('/:id', async (req, res) => {
  const deleted = await Reservation.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).send('Réservation non trouvée');

  res.cookie('flash', JSON.stringify({ type: 'danger', text: 'Réservation supprimée' }));
  res.redirect('/reservations');
});


module.exports = router;
