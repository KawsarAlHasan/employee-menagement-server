const express = require("express");

const varifyEmployee = require("../middleware/varifyEmployee");
const {
  createAdmins,
  updateAdmins,
  updateAdminPassword,
} = require("../controllers/adminController");
const uploadImage = require("../middleware/uploaderImage");

const router = express.Router();

router.post("/new-admin/create", createAdmins);
router.put(
  "/new-admin/update/:id",
  uploadImage.single("profilePic"),
  varifyEmployee,
  updateAdmins
);
router.put(
  "/new-admin/update-password/:id",
  varifyEmployee,
  updateAdminPassword
);

module.exports = router;
