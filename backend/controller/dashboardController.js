const Hotel = require('../model/hotelModel');
const Bus = require('../model/busModel');
const Booking = require('../model/bookingModel');
const User = require('../model/userModel');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalHotels, totalBuses, totalBookings, totalUsers] = await Promise.all([
      Hotel.countDocuments(),
      Bus.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalHotels,
        totalBuses,
        totalBookings,
        totalUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
