const express = require("express");

const varifyEmployee = require("../middleware/varifyEmployee");
const {
  getGeneralSetting,
  updateGenarelSetting,
  hundredPerTax,
  hundredPerTaxUpdate,
  businessSummary,
} = require("../controllers/generalSettingController");

const router = express.Router();

router.get("/all", varifyEmployee, getGeneralSetting);
router.put("/update/:id", varifyEmployee, updateGenarelSetting);

router.get("/tax-status", varifyEmployee, hundredPerTax);
router.put("/tax-status-change", varifyEmployee, hundredPerTaxUpdate);
router.get("/business-summary", varifyEmployee, businessSummary);

module.exports = router;
