
const express = require('express');
const router = express.Router();
const Location = require('../controller/locationController');
router.post('/add', Location.addLocation);
router.get('/get', Location.getLocations);
router.get('/get/:id', Location.getLocationById);
router.put('/update/:id', Location.updateLocation);
router.delete('/delete/:id', Location.deleteLocation);
module.exports = router;

