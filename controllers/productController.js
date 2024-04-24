const Product = require("../models/Product");
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");
const checkPermissions = require("../utils/checkPermissions");

exports.createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

exports.getAllProducts = async (req, res) => {
  const products = await Product.find({}).populate("reviews");
  res.status(StatusCodes.OK).json({ count: products.length, products });
};

exports.getSingleProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  res.status(StatusCodes.OK).json({ product });
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(StatusCodes.OK).json({ product });
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Product deleted successfully" });
};

exports.uploadImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequestError("No files uploaded");
  }

  const productImage = req.files.image;

  if (!productImage.mimetype.startsWith("image")) {
    throw new BadRequestError("Uploaded file not supported");
  }

  const maxSize = 1024 * 1024;

  if (productImage.size > maxSize) {
    throw new BadRequestError("Image size should be less than 1MB");
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads",
    `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};
