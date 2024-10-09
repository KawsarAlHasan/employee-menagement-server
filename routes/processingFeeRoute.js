const express = require("express");

const varifyEmployee = require("../middleware/varifyEmployee");
const {
  getProcessignFee,
  updateProcessignFee,
} = require("../controllers/processingFeeController");

const router = express.Router();

router.get("/", varifyEmployee, getProcessignFee);
router.put("/update", varifyEmployee, updateProcessignFee);

module.exports = router;
