const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const UserController = require("../Controllers/UserController");

// Simplify route definitions by using route chaining
router
  .route("/user")
  .post(UserController.addUser)
  .get(authorize(), UserController.getAllUser);

router
  .route("/user/:user_id")
  .get(authorize(), UserController.getUserById)
  .put(authorize(), UserController.updateUser)
  .delete(authorize(), UserController.deleteUser);

router.get("/user/byRole/:role", authorize(), UserController.getUserByRole);
router.get("/user/noOfUser/:date", UserController.getNoOfUser); // Note: Authorization removed as per original code

router.put(
  "/user/:user_id/:status",
  authorize(),
  UserController.updateUserStatus
);
router.put(
  "/user/updateNoOfReport/:user_id/:no_of_report",
  authorize(),
  UserController.updateNoOfReport
);

module.exports = router;
