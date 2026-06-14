const Operator = require('../model/operatorModel');
const User = require('../model/userModel');
const { uploadImage } = require('../cloudnary/cloudnary');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const transporter = require('../nodmailer/nodemailer');

const uploadOperatorImage = async (req) => {
  if (!req.files || !req.files.image) {
    return null;
  }
  const imageUrl = await uploadImage(
    req.files.image,
    "air-bin/operators"
  );
  return imageUrl;
};

exports.addOperator = async (req, res) => {
  try {
    const { agencyName, contactPerson, businessPhone, businessEmail, gstNumber, city, state } = req.body;

    if (!agencyName || !contactPerson || !businessPhone || !businessEmail) {
      return res.status(400).json({ message: 'Important fields are required' });
    }

    const existingOperator = await Operator.findOne({ businessEmail });
    if (existingOperator) {
      return res.status(400).json({ message: 'Agency with this email is already registered' });
    }

    const uploadedImage = await uploadOperatorImage(req);
    const verificationDocs = uploadedImage ? [uploadedImage] : [];

    const newOperator = new Operator({
      agencyName,
      contactPerson,
      businessPhone,
      businessEmail,
      gstNumber,
      headOfficeAddress: { city: city || '', state: state || '' },
      verificationDocuments: verificationDocs
    });

    await newOperator.save();

    return res.status(201).json({ message: 'Operator registered successfully, pending approval', operator: newOperator });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getOperator = async (req, res) => {
  try {
    if (req.user.role === 'super_admin') {
      const operators = await Operator.find().populate('userId', 'firstName lastName email isVerified');
      return res.status(200).json({ message: 'All operators', operators });
    } else {
      const operator = await Operator.findOne({ userId: req.user._id });
      return res.status(200).json({ message: 'Your operator details', operator });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getOperatorById = async (req, res) => {
  try {
    const operator = await Operator.findById(req.params.id).populate('userId', 'firstName lastName email isVerified');
    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }
    return res.status(200).json({ message: 'Operator details', operator });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateOperator = async (req, res) => {
  try {
    const { agencyName, contactPerson, businessPhone, businessEmail, gstNumber, headOfficeAddress, isApproved, status } = req.body;
    
    const operator = await Operator.findById(req.params.id);
    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }

    if (req.user.role === 'super_admin') {
      if (isApproved !== undefined) operator.isApproved = isApproved;
      if (status !== undefined) operator.status = status;
      
      if (isApproved !== undefined) {
        await User.findByIdAndUpdate(operator.userId, { isVerified: isApproved });
      }
    } else if (operator.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this operator' });
    }

    if (agencyName) operator.agencyName = agencyName;
    if (contactPerson) operator.contactPerson = contactPerson;
    if (businessPhone) operator.businessPhone = businessPhone;
    if (businessEmail) operator.businessEmail = businessEmail;
    if (gstNumber) operator.gstNumber = gstNumber;
    if (headOfficeAddress) operator.headOfficeAddress = headOfficeAddress;

    await operator.save();

    return res.status(200).json({ message: 'Operator updated successfully', operator });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteOperator = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only super admin can delete operators' });
    }

    const operator = await Operator.findByIdAndDelete(req.params.id);
    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }

    await User.findByIdAndUpdate(operator.userId, { role: 'user', isVerified: false });

    return res.status(200).json({ message: 'Operator deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.approveOperator = async (req, res) => {
  try {
    const operator = await Operator.findById(req.params.id);
    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }

    if (!operator.businessEmail) {
      return res.status(400).json({ message: 'Operator email is required for approval' });
    }

    const plainPassword = uuidv4().slice(0, 8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    let user = await User.findOne({ email: operator.businessEmail });

    if (user) {
      user.password = hashedPassword;
      user.role = 'bus_admin';
      user.isVerified = true;
      await user.save();
    } else {
      user = new User({
        firstName: operator.agencyName,
        lastName: 'Operator',
        email: operator.businessEmail,
        password: hashedPassword,
        phone: operator.businessPhone,
        role: 'bus_admin',
        isVerified: true,
      });
      await user.save();
    }

    operator.userId = user._id;

    operator.isApproved = true;
    operator.status = 'active';
    await operator.save();

    await transporter.sendMail({
      from: process.env.MAIL_USER || 'jitendrasingh63793@gmail.com',
      to: operator.businessEmail,
      subject: 'Agency Approved - JourneyHub',
      text: `Your Bus Agency "${operator.agencyName}" is approved.\nEmail: ${user.email}\nPassword: ${plainPassword}`,
    });

    return res.status(200).json({ message: 'Operator approved and password sent to email', operator });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.rejectOperator = async (req, res) => {
  try {
    const operator = await Operator.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, status: 'rejected' },
      { new: true }
    );

    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }

    const user = await User.findById(operator.userId);
    if (user) {
      user.isVerified = false;
      user.role = 'user';
      await user.save();
    }

    if (operator.businessEmail) {
      await transporter.sendMail({
        from: process.env.MAIL_USER || 'jitendrasingh63793@gmail.com',
        to: operator.businessEmail,
        subject: 'Agency Rejected - JourneyHub',
        text: `Your application for Bus Agency "${operator.agencyName}" was rejected.\nReason: ${req.body.message || 'Not fulfilling criteria.'}`,
      });
    }

    return res.status(200).json({ message: 'Operator rejected successfully', operator });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
