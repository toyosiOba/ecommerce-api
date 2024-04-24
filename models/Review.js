const { default: mongoose } = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      maxLength: 100,
      required: [true, "Please provide rating"],
    },
    comment: {
      type: String,
      required: [true, "Please provide review text"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function (productId) {
  try {
    const result = await this.aggregate([
      { $match: { product: productId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          numOfReviews: { $count: {} },
        },
      },
    ]);

    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

reviewSchema.post("save", async function () {
  // calculate product ratings each time reviews are added or updated with save method
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post("remove", async function () {
  // calculate product ratings each time reviews are deleted with remove method
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);
