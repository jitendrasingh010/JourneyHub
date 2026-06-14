const express = require('express');
const router = express.Router();
const BusConstroller = require('../controller/busController');
const auth = require('../middelware/auth');

router.post('/add', auth, BusConstroller.addBus);
router.get('/get', BusConstroller.getBus);
router.get('/get/:id', BusConstroller.getBusById);
router.put('/update/:id', auth, BusConstroller.updateBus);
router.delete('/delete/:id', auth, BusConstroller.deleteBus);
module.exports = router;