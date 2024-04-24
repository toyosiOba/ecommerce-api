const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");
const Product = require("../models/Product");
const Review = require("../models/Review");
const checkPermissions = require("../utils/checkPermissions");

exports.createReview = async (req, res) => {
  const { product: productId } = req.body;
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new NotFoundError("Product not found");
  }

  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadyReviewed) {
    throw new BadRequestError("Already reviewed this product");
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

exports.getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  });
  res.status(StatusCodes.OK).json({ reviews });
};

exports.getSingleReview = async (req, res) => {
  const review = await Review.find({ _id: req.params.id });
  if (!review) {
    throw new NotFoundError("Review not found");
  }
  res.status(StatusCodes.OK).json({ review });
};

exports.updateReview = async (req, res) => {
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: req.params.id });
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

exports.deleteReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id });
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  checkPermissions(req.user, review.user);
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "Review successfully deleted" });
};

exports.getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews });
};
