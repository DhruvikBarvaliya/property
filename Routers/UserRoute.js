const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const Role = require("../Helpers/role");
const UserController = require("../Controllers/UserController");

router.post(
  "/user",
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  UserController.addUser
);
router.get("/user", UserController.getAllUser);
router.get(
  "/user/byUserId/:user_id",
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  UserController.getUserById
);
router.get(
  "/user/byRole/:role",
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  UserController.getUserByRole
);
router.put(
  "/user/:user_id",
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  UserController.updateUser
);
router.put(
  "/user/:user_id/:status",
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  UserController.updateUserStatus
);
router.delete(
  "/user/:user_id",
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  UserController.deleteUser
);

module.exports = router;
