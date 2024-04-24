const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require("../errors");
const createTokenUser = require("../utils/createTokenUser");
const { attachCookiesToResponse } = require("../utils/jwt");
const checkPermissions = require("../utils/checkPermissions");

exports.getAllUsers = async (req, res) => {
  const allUsers = await User.find({ role: "user" }, { password: 0 });

  res.status(StatusCodes.OK).json(allUsers);
};

exports.getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }, { password: 0 });
  if (!user) {
    throw new NotFoundError(`No user with id: ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json(user);
};

exports.showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

exports.updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name?.trim() || !email?.trim()) {
    throw new BadRequestError("Please fill all fields");
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { name, email },
    { new: true, runValidators: true }
  );
  const tokenUser = createTokenUser(updatedUser);
  attachCookiesToResponse(res, updatedUser);

  res.status(StatusCodes.OK).send({ user: tokenUser });
};

exports.updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please fill all fields");
  }

  const user = await User.findOne({ _id: req.user.userId });
  const isPasswordValid = await user.isPasswordValid(oldPassword);
  if (!isPasswordValid) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password updated successfully" });
};
