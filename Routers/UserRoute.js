const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const Role = require("../Helpers/role");
const UserController = require("../Controllers/UserController");

router.post(
  "/user",
  UserController.addUser
);
router.get("/user",authorize(), UserController.getAllUser);
router.get(
  "/user/byUserId/:user_id",
  authorize(),
  UserController.getUserById
);
router.get(
  "/user/byRole/:role",
  authorize(),
  UserController.getUserByRole
);
router.get(
  "/user/noOfUser",
  // authorize(),
  UserController.getNoOfUser
);
router.put(
  "/user/:user_id",
  authorize(),
  UserController.updateUser
);
router.put(
  "/user/:user_id/:status",
  authorize(),
  UserController.updateUserStatus
);
router.delete(
  "/user/:user_id",
  authorize(),
  UserController.deleteUser
);

module.exports = router;
