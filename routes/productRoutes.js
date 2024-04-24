const router = require("express").Router();
const {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  uploadImage,
  deleteProduct,
} = require("../controllers/productController");
const { getSingleProductReviews } = require("../controllers/reviewController");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

router
  .route("/")
  .get(getAllProducts)
  .post([authenticateUser, authorizePermissions("admin")], createProduct);

router.post(
  "/uploadImage",
  [authenticateUser, authorizePermissions("admin")],
  uploadImage
);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions("admin")], updateProduct)
  .delete([authenticateUser, authorizePermissions("admin")], deleteProduct);

router.get("/:id/reviews", getSingleProductReviews);

module.exports = router;
