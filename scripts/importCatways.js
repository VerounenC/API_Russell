const mongoose = require('mongoose');
const fs = require('fs');
const Catway = require('../models/Catway');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const data = JSON.parse(fs.readFileSync('./scripts/catways.json', 'utf-8'));
        await Catway.insertMany(data);
        console.log('Catways importés');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Erreur import catways :', err);
        mongoose.disconnect();
    });