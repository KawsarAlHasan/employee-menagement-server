const express = require("express");

const varifyEmployee = require("../middleware/varifyEmployee");
const {
  getGeneralSetting,
  createGeneralSetting,
  updateGenarelSetting,
  deleteGenarelSetting,
  hundredPerTax,
  hundredPerTaxUpdate,
  businessSummary,
} = require("../controllers/generalSettingController");

const router = express.Router();

router.get("/all", varifyEmployee, getGeneralSetting);
router.post("/create", varifyEmployee, createGeneralSetting);
router.put("/update/:id", varifyEmployee, updateGenarelSetting);
router.delete("/delete/:id", varifyEmployee, deleteGenarelSetting);

router.get("/tax-status", varifyEmployee, hundredPerTax);
router.put("/tax-status-change", varifyEmployee, hundredPerTaxUpdate);
router.get("/business-summary", varifyEmployee, businessSummary);

module.exports = router;
