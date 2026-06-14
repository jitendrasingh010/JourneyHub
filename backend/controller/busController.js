
const Bus = require('../model/busModel');
const { uploadImage } = require('../cloudnary/cloudnary');

const uploadBusImage = async (req) => {
  if (!req.files || !req.files.image) {
    return null;
  }

  const imageUrl = await uploadImage(
    req.files.image,
    "air-bin/buses"
  );

  return imageUrl;
};

const makeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return String(value).split(',').map((item) => item.trim()).filter(Boolean);
  }
};

const makePointArray = (value) => {
  const arr = makeArray(value);
  return arr.map(item => {
    if (typeof item === 'string') {
      return { name: item, address: '', time: '' };
    }
    return item;
  });
};

exports.addBus = async (req, res) => {
  try {
    const {
      busName,
      busNumber,
      operatorName,
      busType,
      fromCityID,
      toCityID,
      duration,
      totalSeats,
      availableSeats,
      fare,
    } = req.body;

    if (!busName || !busNumber || !operatorName || !busType || !fromCityID || !toCityID || !totalSeats || !availableSeats || !fare) {
      return res.status(400).json({ message: 'All important fields are required' });
    }

    const images = await uploadBusImage(req);

    const bus = new Bus({
      busName,
      busNumber,
      operatorName,
      busType,
      fromCityID,
      toCityID,
      duration,
      totalSeats,
      availableSeats,
      fare,
      images,
      amenities: makeArray(req.body.amenities),
      boardingPoints: makePointArray(req.body.boardingPoints),
      droppingPoints: makePointArray(req.body.droppingPoints),
      managedBy: req.user._id,
    });

    await bus.save();

    return res.status(201).json({ message: 'Bus added successfully', bus });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getBus = async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate('fromCityID')
      .populate('toCityID');
    return res.status(200).json({ message: 'Buses fetched successfully', buses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('fromCityID')
      .populate('toCityID');

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    return res.status(200).json({ message: 'Bus data', bus });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateBus = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const images = await uploadBusImage(req);

    if (images.length > 0) {
      updateData.images = images;
    }

    updateData.amenities = makeArray(req.body.amenities);
    updateData.boardingPoints = makePointArray(req.body.boardingPoints);
    updateData.droppingPoints = makePointArray(req.body.droppingPoints);

    const bus = await Bus.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('fromCityID')
      .populate('toCityID');

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    return res.status(200).json({ message: 'Bus updated successfully', bus });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    return res.status(200).json({ message: 'Bus deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

