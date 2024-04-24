const mongoose = require("mongoose");
const Review = require("./Review");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please, provide product name"],
      maxLength: [100, "Name can not be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please, provide product price"],
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Please, provide product description"],
      maxLength: [1000, "Description can not be more than 1000 characters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "Please, provide product category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please, provide  company"],
      enum: {
        values: ["liddy", "ikea", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: { type: [String], required: true, default: ["#222"] },
    featured: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: false },
    inventory: { type: Number, required: true, default: 15 },
    averageRating: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// creating a virtual field that can be populated
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

productSchema.pre("remove", async function () {
  // delete all reviews linked to this product before deleting the product
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", productSchema);
