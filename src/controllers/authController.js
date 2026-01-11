
const jwt = require('jsonwebtoken');

// Mock user for testing (Replace with Supabase DB later)
const mockUser = { id: '123', email: 'user@example.com', tier: 'FREE' };

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Generate Access Token (Short-lived: 15m)
  const accessToken = jwt.sign(
    { id: mockUser.id, tier: mockUser.tier },
    process.env.JWT_SECRET || 'access_secret_123',
    { expiresIn: '15m' }
  );

  // 2. Generate Refresh Token (Long-lived: 7d)
  const refreshToken = jwt.sign(
    { id: mockUser.id },
    process.env.REFRESH_SECRET || 'refresh_secret_123',
    { expiresIn: '7d' }
  );

  // 3. Set Refresh Token in a secure cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({ accessToken, message: "Login successful!" });
};
