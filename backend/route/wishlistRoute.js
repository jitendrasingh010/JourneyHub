const express = require('express');
const router = express.Router();
const WishlistController = require('../controller/wishlistController');
const auth = require('../middelware/auth');
router.post('/add', auth, WishlistController.addToWishlist);
router.get('/get', auth, WishlistController.getWishlist);
router.delete('/delete/:id', auth, WishlistController.removeFromWishlist);
router.put('/remove-item', auth, WishlistController.removeItem);

module.exports = router;