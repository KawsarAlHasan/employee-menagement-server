const express = require("express");

const varifyEmployee = require("../middleware/varifyEmployee");
const {
  getGeneralSetting,
  createGeneralSetting,
  updateGenarelSetting,
  deleteGenarelSetting,
} = require("../controllers/generalSettingController");

const router = express.Router();

router.get("/all", varifyEmployee, getGeneralSetting);
router.post("/create", varifyEmployee, createGeneralSetting);
router.put("/update/:id", varifyEmployee, updateGenarelSetting);
router.delete("/delete/:id", varifyEmployee, deleteGenarelSetting);

module.exports = router;
