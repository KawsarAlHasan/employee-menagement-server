const express = require("express");

const varifyEmployee = require("../middleware/varifyEmployee");
const {
  createPrivacyPolicy,
  getPrivacyPolicy,
  updatePrivacyPolicy,
  deletePrivacyPolicy,
} = require("../controllers/privacyPolicyController");

const router = express.Router();

router.post("/create", varifyEmployee, createPrivacyPolicy);
router.get("/", varifyEmployee, getPrivacyPolicy);
router.put("/update", varifyEmployee, updatePrivacyPolicy);
router.delete("/delete", varifyEmployee, deletePrivacyPolicy);

module.exports = router;
