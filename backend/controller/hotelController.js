const Hotel = require('../model/hotelModel');
const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const transporter = require('../nodmailer/nodemailer');
const { uploadImage } = require('../cloudnary/cloudnary');

const uploadHotelImage = async (req) => {
  if (!req.files || !req.files.image) {
    return null;
  }

  const imageUrl = await uploadImage(
    req.files.image,
    "air-bin/hotels"
  );

  return imageUrl;
};
exports.addHotel = async (req, res) => {
  try {
    const {
      hotelName,
      hotelType,
      description,
      address,
      city,
      state,
      country,
      pincode,
      contactNumber,
      email,
      pricePerNight,
      totalRooms,
      availableRooms,
      amenities,
      checkInTime,
      checkOutTime,
    } = req.body;

    if (!hotelName || !description || !contactNumber || !email || !pricePerNight || !totalRooms || !availableRooms) {
      return res.status(400).json({ message: 'All important fields are required' });
    }

    const uploadedImage = await uploadHotelImage(req);

    const hotel = new Hotel({
      hotelName,
      hotelType,
      description,
      location: {
        address,
        city,
        state,
        country,
        pincode,
      },
      contactNumber,
      email,
      pricePerNight,
      totalRooms,
      availableRooms,
      amenities: Array.isArray(amenities) ? amenities : String(amenities || '').split(',').map((item) => item.trim()).filter(Boolean),
      images: uploadedImage,
      checkInTime,
      checkOutTime,
    });

    await hotel.save();

    return res.status(201).json({
      message: 'Hotel registered successfully. Please wait for admin approval.',
      hotel,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getHotel = async (req, res) => {
  try {
    const hotels = await Hotel.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Hotel list', hotels });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    return res.status(200).json({ message: 'Hotel data', hotel });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.body.address || req.body.city || req.body.state || req.body.country || req.body.pincode) {
      updateData.location = {
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pincode,
      };
    }

    if (typeof req.body.amenities === 'string') {
      updateData.amenities = req.body.amenities.split(',').map((item) => item.trim()).filter(Boolean);
    }

    if (typeof req.body.images === 'string') {
      updateData.images = req.body.images.split(',').map((item) => item.trim()).filter(Boolean);
    }

    const uploadedImages = await uploadHotelImages(req);

    if (uploadedImages.length > 0) {
      updateData.images = uploadedImages;
    }

    const hotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    return res.status(200).json({ message: 'Hotel updated successfully', hotel });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.approveHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (!hotel.email) {
      return res.status(400).json({ message: 'Hotel email is required for approval' });
    }

    const plainPassword = uuidv4().slice(0, 8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    let user = await User.findOne({ email: hotel.email });

    if (user) {
      user.password = hashedPassword;
      user.role = 'hotel_admin';
      user.isVerified = true;
      await user.save();
    } else {
      user = new User({
        firstName: hotel.hotelName,
        lastName: 'Owner',
        email: hotel.email,
        password: hashedPassword,
        phone: hotel.contactNumber,
        role: 'hotel_admin',
        isVerified: true,
      });

      await user.save();
    }

    hotel.approvalStatus = {
      status: true,
      message: 'Approved',
    };
    await hotel.save();

    await transporter.sendMail({
      from: process.env.MAIL_USER || 'jitendrasingh63793@gmail.com',
      to: hotel.email,
      subject: 'Hotel approved',
      text: `Your hotel is approved.\nEmail: ${hotel.email}\nPassword: ${plainPassword}`,
    });

    return res.status(200).json({ message: 'Hotel approved and password sent to email', hotel });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.rejectHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: {
          status: false,
          message: req.body.message || 'Rejected',
        },
      },
      { new: true },
    );

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.email) {
      await transporter.sendMail({
        from: process.env.MAIL_USER || 'jitendrasingh63793@gmail.com',
        to: hotel.email,
        subject: 'Hotel rejected',
        text: `Your hotel "${hotel.hotelName}" is rejected.\nReason: ${hotel.approvalStatus.message}`,
      });
    }

    return res.status(200).json({ message: 'Hotel rejected successfully', hotel });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    return res.status(200).json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.softDeleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    return res.status(200).json({ message: 'Hotel removed successfully', hotel });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.restoreHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    return res.status(200).json({ message: 'Hotel restored successfully', hotel });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
