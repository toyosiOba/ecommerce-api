require("dotenv").config();
require("express-async-errors");

const express = require("express");
const connectDB = require("./db/connect");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const morgan = require("morgan");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const productRouter = require("./routes/productRoutes");
const fileUpload = require("express-fileupload");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const app = express();

app.set("trust proxy", 1);
// middlewares
app.use(
  rateLimiter({
    windowMs: 1000 * 60 * 15,
    max: 60,
  })
);
app.use(helmet());
app.use(xss());
app.use(cors());
app.use(mongoSanitize());
app.use(express.json());
app.use(morgan("tiny"));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());

// routes
app.get("/", (req, res) => {
  res.send("<h1>E-commerce API</h1>");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, console.log(`app listening on  port ${port}`));
  } catch (error) {
    console.log(error);
  }
}

start();
