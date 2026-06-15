const Booking = require("../model/bookingModel");
const Hotel = require("../model/hotelModel");
const Bus = require("../model/busModel");
const transporter = require("../nodmailer/nodemailer");

const populateBooking = (query) => {
  return query
    .populate("user", "firstName lastName email phone")
    .populate("hotel", "hotelName location pricePerNight images email")
    .populate({
      path: "bus",
      select: "busName busNumber busType fare fromCityID toCityID images managedBy",
      populate: [
        { path: "fromCityID", select: "city state" },
        { path: "toCityID", select: "city state" },
      ],
    });
};

const canAccessBooking = (booking, user) => {
  if (user.role === "super_admin") {
    return true;
  }

  if (booking.user._id.toString() === user._id.toString()) {
    return true;
  }

  if (user.role === "hotel_admin" && booking.hotel) {
    return booking.hotel.email === user.email;
  }

  if (user.role === "bus_admin" && booking.bus) {
    return booking.bus.managedBy && booking.bus.managedBy.toString() === user._id.toString();
  }

  return false;
};

const restoreAvailability = async (booking) => {
  if (booking.bookingType === "hotel" && booking.hotel) {
    await Hotel.findByIdAndUpdate(booking.hotel, {
      $inc: { availableRooms: booking.totalSeats },
    });
  }

  if (booking.bookingType === "bus" && booking.bus) {
    await Bus.findByIdAndUpdate(booking.bus, {
      $inc: { availableSeats: booking.totalSeats },
    });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "email")
      .populate("hotel", "email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!canAccessBooking(booking, req.user)) {
      return res.status(403).json({ message: "You cannot confirm this booking" });
    }

    booking.bookingStatus = "Confirmed";
    await booking.save();

    return res.status(200).json({ message: "Booking confirmed successfully", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "email")
      .populate("hotel", "email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!canAccessBooking(booking, req.user)) {
      return res.status(403).json({ message: "You cannot cancel this booking" });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.bookingStatus = "Cancelled";
    booking.cancellationReason = req.body.cancellationReason || "Cancelled by user";
    await booking.save();

    await restoreAvailability(booking);

    return res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.addBooking = async (req, res) => {
  try {
    const {
      bookingType,
      hotel,
      bus,
      journeyDate,
      totalSeats = 1,
      specialRequest,
    } = req.body;

    const quantity = Number(totalSeats);
    const travelDate = new Date(journeyDate);

    if (!["hotel", "bus"].includes(bookingType) || !journeyDate) {
      return res.status(400).json({ message: "Booking type and journey date are required" });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Seats or rooms must be at least 1" });
    }

    if (Number.isNaN(travelDate.getTime()) || travelDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: "Please select today or a future date" });
    }

    let selectedHotel = null;
    let selectedBus = null;
    let amount = 0;

    if (bookingType === "hotel") {
      if (!hotel) {
        return res.status(400).json({ message: "Please select a hotel" });
      }

      selectedHotel = await Hotel.findOne({
        _id: hotel,
        isActive: true,
        "approvalStatus.status": true,
      });

      if (!selectedHotel) {
        return res.status(404).json({ message: "Hotel is not available" });
      }

      if (selectedHotel.availableRooms < quantity) {
        return res.status(400).json({ message: "Not enough rooms available" });
      }

      amount = selectedHotel.pricePerNight * quantity;
      selectedHotel.availableRooms -= quantity;
      await selectedHotel.save();
    } else {
      if (!bus) {
        return res.status(400).json({ message: "Please select a bus" });
      }

      selectedBus = await Bus.findOne({ _id: bus, isActive: true });

      if (!selectedBus) {
        return res.status(404).json({ message: "Bus is not available" });
      }

      if (selectedBus.availableSeats < quantity) {
        return res.status(400).json({ message: "Not enough seats available" });
      }

      amount = selectedBus.fare * quantity;
      selectedBus.availableSeats -= quantity;
      await selectedBus.save();
    }

    try {
      const booking = await Booking.create({
        user: req.user._id,
        bookingType,
        hotel: selectedHotel?._id,
        bus: selectedBus?._id,
        journeyDate: travelDate,
        totalSeats: quantity,
        amount,
        specialRequest,
      });

      const savedBooking = await populateBooking(Booking.findById(booking._id));

      return res.status(201).json({
        message: "Booking created successfully",
        booking: savedBooking,
      });
    } catch (error) {
      if (selectedHotel) {
        selectedHotel.availableRooms += quantity;
        await selectedHotel.save();
      }

      if (selectedBus) {
        selectedBus.availableSeats += quantity;
        await selectedBus.save();
      }

      throw error;
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "super_admin") {
      if (req.query.type) {
        filter.bookingType = req.query.type;
      }
    } else if (req.user.role === "hotel_admin") {
      const hotels = await Hotel.find({ email: req.user.email }).select("_id");
      filter.hotel = { $in: hotels.map((hotel) => hotel._id) };
      filter.bookingType = "hotel";
    } else if (req.user.role === "bus_admin") {
      const buses = await Bus.find({ managedBy: req.user._id }).select("_id");
      filter.bus = { $in: buses.map((b) => b._id) };
      filter.bookingType = "bus";
    } else {
      filter.user = req.user._id;
      if (req.query.type) {
        filter.bookingType = req.query.type;
      }
    }

    const bookings = await populateBooking(
      Booking.find(filter).sort({ createdAt: -1 }),
    );

    return res.status(200).json({ message: "Booking list", bookings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await populateBooking(Booking.findById(req.params.id));

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!canAccessBooking(booking, req.user)) {
      return res.status(403).json({ message: "You cannot view this booking" });
    }

    return res.status(200).json({ message: "Booking data", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const booking = await populateBooking(Booking.findById(req.params.id));

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!canAccessBooking(booking, req.user)) {
      return res.status(403).json({ message: "You cannot confirm this booking" });
    }

    booking.bookingStatus = "Confirmed";
    await booking.save();

    const mailOptions = {
      from: '"JourneyHub" <jitendrasingh63793@gmail.com>',
      to: booking.user.email,
      subject: "JourneyHub: Your Booking is Confirmed",
      text: `Hello ${booking.user.firstName || 'Traveler'},\n\nYour booking has been Confirmed.\n\nThank you for choosing JourneyHub!`
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.status(200).json({ message: "Booking confirmed successfully", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await populateBooking(Booking.findById(req.params.id));

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!canAccessBooking(booking, req.user)) {
      return res.status(403).json({ message: "You cannot cancel this booking" });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.bookingStatus = "Cancelled";
    booking.cancellationReason = req.body.cancellationReason || "Cancelled by user";
    await booking.save();

    await restoreAvailability(booking);

    const mailOptions = {
      from: '"JourneyHub" <jitendrasingh63793@gmail.com>',
      to: booking.user.email,
      subject: "JourneyHub: Your Booking is Cancelled",
      text: `Hello ${booking.user.firstName || 'Traveler'},\n\nYour booking has been Cancelled.\n\nThank you for choosing JourneyHub!`
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
