
const Location = require('../model/locationModel');
const { uploadImage } = require('../cloudnary/cloudnary');

const uploadLocationImage = async (req) => {
  if (!req.files || !req.files.image) {
    return '';
  }

  const image = req.files.image;
  return uploadImage(image, 'air-bin/locations');
};

exports.addLocation = async (req, res) => {
  try {
    const {
      city,
      state,
      country,
      shortDescription,
      startingPrice,
    } = req.body;

    const uploadedImage = await uploadLocationImage(req);

    if (!city || !state || !shortDescription || !startingPrice || !uploadedImage) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const location = new Location({
      city,
      state,
      country,
      shortDescription,
      startingPrice,
      image: uploadedImage,
    });

    await location.save();

    return res.status(201).json({ message: 'Location added successfully', location });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const {
      city,
      state,
      country,
      shortDescription,
      startingPrice,
    } = req.body;

    const oldLocation = await Location.findById(req.params.id);

    if (!oldLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const uploadedImage = await uploadLocationImage(req);
    const finalImage = uploadedImage || oldLocation.image;

    if (!city || !state || !shortDescription || !startingPrice || !finalImage) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const location = await Location.findByIdAndUpdate(
      req.params.id,
      {
        city,
        state,
        country,
        shortDescription,
        startingPrice,
        image: finalImage,
      },
      { new: true },
    );

    return res.status(200).json({ message: 'Location updated successfully', location });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    return res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Location list', locations });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    return res.status(200).json({ message: 'Location found', location });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

