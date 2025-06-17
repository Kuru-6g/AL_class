const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.createOrFindGoogleUser = async (req, res, next) => {
  try {
    // ✅ Step 1: Extract and verify Google ID token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }

    const idToken = authHeader.split(' ')[1];
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload(); // Google user info
    const googleId = payload.sub;
    const email = payload.email;

    console.log('[Verified Google token]', email, googleId);

    // ✅ Step 2: Create or return user
    const { name, phoneNumber, district, photo } = req.body;

    let user = await User.findOne({ googleId });
    if (user) {
      return res.status(200).json({ message: 'User already exists', user });
    }

    user = new User({
      googleId,
      email,
      name,
      phoneNumber,
      district,
      photo,
    });

    await user.save();
    return res.status(201).json({ message: 'User created', user });
  } catch (err) {
    console.error('Token verification or user creation failed:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
