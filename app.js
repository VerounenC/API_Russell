const express = require('express');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override')


const app = express();

mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log("Connexion MongoDB réussie"))
.catch((err) => console.error("Erreur de connexion MongoDB :", err));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use((req, res, next) => {
  res.locals.message = null;

  if (req.cookies.flash) {
    res.locals.message = JSON.parse(req.cookies.flash);
    res.clearCookie('flash');
  }

  next();
});


const catwayRouter = require('./routes/catways');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth')
const globalReservationRouter = require('./routes/reservations');
const Reservation = require('./models/Reservation');
const authenticateToken = require('./middlewares/authmiddleware');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
})

app.use('/', authRouter);

app.use('/catways', authenticateToken, catwayRouter);
app.use('/users', authenticateToken, usersRouter);
app.use('/reservations', authenticateToken, globalReservationRouter);


app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/')
})

app.get('/dashboard', authenticateToken, async (req, res) => {
  const now = new Date();

  const activeReservations = await Reservation.find({
    startDate: { $lte: now },
    endDate: { $gte: now }
  });

  res.render('dashboard', {
    user: req.user,
    reservations: activeReservations
  });
});


app.use(express.static(path.join(__dirname, 'public')));

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/swagger.yaml');
const swaggerJSDoc = require('swagger-jsdoc');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Port de Plaisance Russell',
      version: '1.0.0',
      description: 'Documentation de l’API pour la gestion des catways, utilisateurs et réservations',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], // chemin vers les fichiers avec les commentaires JSDoc
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;