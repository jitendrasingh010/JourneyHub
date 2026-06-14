const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    listName: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
    buses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bus' }],
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);