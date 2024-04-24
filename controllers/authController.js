const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");
const { attachCookiesToResponse } = require("../utils/jwt");
const createTokenUser = require("../utils/createTokenUser");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !password) {
    throw new BadRequestError("Please provide all required inputs");
  }

  const isUserExisting = await User.findOne({ email });
  if (isUserExisting) {
    throw new BadRequestError("Email already in use, provide another email");
  }

  const isFirstUSer = (await User.countDocuments({})) === 0;
  const role = isFirstUSer ? "admin" : "user";

  const user = await User.create({ name, email, password, role });
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse(res, tokenUser);
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordValid;
  if (!isPasswordValid) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse(res, tokenUser);
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

exports.logout = async (req, res) => {
  res.cookie("token", "logout", {
    signed: true,
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.status(StatusCodes.OK).send("logged out");
};
