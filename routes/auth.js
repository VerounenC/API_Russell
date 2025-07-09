const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const SECRET = 'dGhpc0lzU2VjdXJlS2V5IQ';

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentifie un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       302:
 *         description: Redirection vers le tableau de bord si authentification réussie
 *       401:
 *         description: Utilisateur non trouvé ou mot de passe incorrect
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).render('index', {
      error: 'Utilisateur non trouvé'
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).render('index', {
      error: 'Mot de passe incorrect'
    });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    SECRET,
    { expiresIn: '2h' }
  );

  res.cookie('token', token, { httpOnly: true });
  res.redirect('/dashboard');
});


module.exports = router;