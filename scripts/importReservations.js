const mongoose = require('mongoose');
const fs = require('fs');
const Reservation = require('../models/Reservation');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const data = JSON.parse(fs.readFileSync('./scripts/reservations.json', 'utf-8'));
        await Reservation.insertMany(data);
        console.log('Réservation importées');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Erreur import reservations :', err);
        mongoose.disconnect();
    });