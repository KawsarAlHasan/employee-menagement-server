const express = require("express");

const varifyEmployee = require("../middleware/varifyEmployee");
const {
  createTermsAndConditions,
  getTermsAndConditions,
  updateTermsAndConditions,
  deleteTermsAndConditions,
} = require("../controllers/termsAndConditionsController");

const router = express.Router();

router.post("/create", varifyEmployee, createTermsAndConditions);
router.get("/", varifyEmployee, getTermsAndConditions);
router.put("/update", varifyEmployee, updateTermsAndConditions);
router.delete("/delete", varifyEmployee, deleteTermsAndConditions);

module.exports = router;
