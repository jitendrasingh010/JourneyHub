const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const transporter = require('../nodmailer/nodemailer');
const secretKey = process.env.jwt_secret || process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const { uploadImage } = require('../cloudnary/cloudnary');

const uploadProfileImage = async (req) => {
  if (!req.files || !req.files.profileImage) {
    return '';
  }

  const image = req.files.profileImage;
  return uploadImage(image, 'air-bin/users');
};

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, gender, password, phone } = req.body;
    console.log(">>>>>>signup", req.body);

    if(!firstName || !lastName || !email || !password || !phone) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user =await User.findOne({ email });
    if (user) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const phoneUser = await User.findOne({ phone });
    if (phoneUser) {
        return res.status(400).json({ message: 'Phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        firstName,
        lastName,
        email,
        gender,
        password: hashedPassword,
        phone,
        role: 'user'
    });
    await newUser.save()
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Signup first' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'hotel_admin' && !user.isVerified) {
        return res.status(403).json({ message: 'Your hotel is not approved yet' });
    }

    const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '7d' });
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile data', user });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, gender } = req.body;
    const uploadedImage = await uploadProfileImage(req);

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: 'First name, last name, email and phone are required' });
    }

    const emailUser = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (emailUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const phoneUser = await User.findOne({ phone, _id: { $ne: req.user._id } });
    if (phoneUser) {
      return res.status(400).json({ message: 'Phone already exists' });
    }

    const oldUser = await User.findById(req.user._id).select('profileImage');

    if (!oldUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const finalProfileImage = uploadedImage || oldUser.profileImage || '';

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, email, phone, gender, profileImage: finalProfileImage },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
}
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is wrong' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "signup first" });
    }

    const otp = generateOTP();
    const expireTime = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = otp;
    user.otpExpire = expireTime;

    await user.save();
    console.log("user", user);
  
    await transporter.sendMail({
      from: process.env.MAIL_USER || "jitendrasingh63793@gmail.com",
      to: email,
      subject: "Password reset",
      text: `Your OTP is ${otp}. it will expire in 5 minutes`
    })
    return res.status(200).json({
      message: "OTP sent to email",
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, otp });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpire) {
      user.otp = null;
      user.otpExpire = null;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    res.status(200).json({ message: "OTP verified" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email, otp });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpire) {
      user.otp = null;
      user.otpExpire = null;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.otp = null;
    user.otpExpire = null;

    await user.save();

    return res.status(200).json({
      message: "Password updated successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
