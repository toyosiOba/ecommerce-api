const {
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  updateOrder,
  createOrder,
} = require("../controllers/orderControllers");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const router = require("express").Router();

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllOrders)
  .post(authenticateUser, createOrder);

router.get("/showAllMyOrders", authenticateUser, getCurrentUserOrders);

router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

module.exports = router;
