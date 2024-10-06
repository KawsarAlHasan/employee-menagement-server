const express = require("express");
const {
  loginAdmin,
  updateAdminPassword,
  getMeAdmin,
} = require("../controllers/superAdminController");
const varifyAdmin = require("../middleware/varifyAdmin");

const router = express.Router();

router.post("/login", loginAdmin);
router.put("/update/:id", varifyAdmin, updateAdminPassword);
router.get("/me", varifyAdmin, getMeAdmin);

module.exports = router;
