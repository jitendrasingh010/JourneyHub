const Wishlist = require('../model/wishlistModel');

exports.addToWishlist = async (req, res) => {
    try {
        const { listName, hotels, buses, destinations } = req.body;

        if (!listName) {
            return res.status(400).json({
                success: false,
                message: 'List name is required'
            });
        }

        let wishlist = await Wishlist.findOne({ listName, user: req.user._id });

        if (wishlist) {
            // Append new items to existing list, avoiding duplicates if possible
            if (hotels && hotels.length > 0) {
                wishlist.hotels = [...new Set([...wishlist.hotels.map(id => id.toString()), ...hotels])];
            }
            if (buses && buses.length > 0) {
                wishlist.buses = [...new Set([...wishlist.buses.map(id => id.toString()), ...buses])];
            }
            if (destinations && destinations.length > 0) {
                wishlist.destinations = [...new Set([...wishlist.destinations.map(id => id.toString()), ...destinations])];
            }
            await wishlist.save();
        } else {
            wishlist = new Wishlist({
                listName,
                user: req.user._id,
                hotels: hotels || [],
                buses: buses || [],
                destinations: destinations || []
            });
            await wishlist.save();
        }

        res.status(201).json({
            success: true,
            message: 'Wishlist updated successfully',
            data: wishlist
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.find({
            user: req.user._id
        })
        .populate('hotels')
        .populate('buses')
        .populate('destinations');

        res.status(200).json({
            success: true,
            data: wishlist
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.removeItem = async (req, res) => {
    try {
        const { listId, type, itemId } = req.body;
        
        if (!listId || !type || !itemId) {
            return res.status(400).json({ success: false, message: 'Missing parameters' });
        }

        const wishlist = await Wishlist.findById(listId);
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        if (type === 'hotel') {
            wishlist.hotels = wishlist.hotels.filter(id => id.toString() !== itemId);
        } else if (type === 'bus') {
            wishlist.buses = wishlist.buses.filter(id => id.toString() !== itemId);
        } else if (type === 'destination') {
            wishlist.destinations = wishlist.destinations.filter(id => id.toString() !== itemId);
        }

        await wishlist.save();
        res.status(200).json({ success: true, message: 'Item removed successfully', data: wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { id } = req.params;

        const wishlist = await Wishlist.findById(id);

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        await wishlist.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Wishlist deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


