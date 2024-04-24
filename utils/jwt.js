const { sign, verify } = require("jsonwebtoken");

function createJWT(payload) {
  const token = sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
}

function verifyJWT(token) {
  const isTokenValid = verify(token, process.env.JWT_SECRET);
  return isTokenValid;
}

function attachCookiesToResponse(res, user) {
  const token = createJWT(user);
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    signed: true,
    secure: process.env.NODE_ENV === "production",
  });
}

module.exports = { createJWT, verifyJWT, attachCookiesToResponse };
