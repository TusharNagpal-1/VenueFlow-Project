const User = require("../models/Usermodel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTP = require("../models/otpmodel.js");
const { sendOTPEmail } = require("../utils/email.js");

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({ username, email, password: hashedPassword, role: "user", isVerified: false });
    const otp = generateOTP();
    console.log(`OTP for ${email}: ${otp}`);
    await OTP.findOneAndDelete({ email, action: 'account_verification' });
    await OTP.create({ email, otp, action: 'account_verification' });
    await sendOTPEmail(email, otp, 'account_verification');
    res.status(201).json({ message: "OTP sent to your email for verification. Please check your inbox." });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const loginUser = async (req, res) => {
 try {
    const { email, password, role } = req.body;
    if (!email || !password) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (role) {
            if (role === 'admin' && user.role !== 'admin') {
                return res.status(403).json({ message: 'This account does not have admin access. Please sign in as a User.' });
            }
            if (role === 'user' && user.role === 'admin') {
                return res.status(403).json({ message: 'This is an admin account. Please select Admin to sign in.' });
            }
        }

        if (!user.isVerified && user.role !== 'admin') {
            const otp = generateOTP();
            await OTP.findOneAndDelete({ email: user.email, action: 'account_verification' });
            await OTP.create({ email: user.email, otp, action: 'account_verification' });
            await sendOTPEmail(user.email, otp, 'account_verification');
            return res.status(403).json({ message: 'Account not verified', needsVerification: true, email: user.email });
        }

        res.json({
            _id: user._id,
            name: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }
        const validOTP = await OTP.findOne({ email, otp, action: 'account_verification' });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await OTP.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

        res.json({
            _id: user._id,
            name: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
module.exports = { registerUser, loginUser, verifyOTP };
