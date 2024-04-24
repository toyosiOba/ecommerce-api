const Product = require("../models/Product");
const { BadRequestError, NotFoundError } = require("../errors");
const Order = require("../models/Order");
const { StatusCodes } = require("http-status-codes");
const checkPermissions = require("../utils/checkPermissions");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "valueFromStripeAPI";
  return { client_secret, amount };
};

exports.createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("No cart items provided");
  }

  if (!tax || !shippingFee) {
    throw new BadRequestError("Please provide tax and shipping fee");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new NotFoundError(`No product with id: ${item.product}`);
    }

    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      name,
      product: _id,
      price,
      amount: item.amount,
      image,
    };
    // add item to order
    orderItems = [...orderItems, singleOrderItem];
    // calculate subtotal
    subtotal += item.amount * price;
  }
  // calculate total
  const total = subtotal + tax + shippingFee;
  // get client secret
  const paymentIntent = await fakeStripeAPI({ amount: total, currency: "usd" });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

exports.getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order with id: ${orderId}`);
  }

  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

exports.getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

exports.updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order with id: ${orderId}`);
  }

  checkPermissions(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";

  await order.save();
  res.status(StatusCodes.OK).json({ order });
};
