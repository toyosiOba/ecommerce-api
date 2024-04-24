const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const router = require("express").Router();

router.get("/", authenticateUser, authorizePermissions("admin"), getAllUsers);
router.get("/showMe", authenticateUser, showCurrentUser);
router.patch("/updatePassword", authenticateUser, updateUserPassword);

router
  .route("/:id")
  .get(authenticateUser, getSingleUser)
  .patch(authenticateUser, updateUser);

module.exports = router;
