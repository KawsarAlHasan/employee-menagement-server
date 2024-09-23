const express = require("express");

const varifyEmployee = require("../middleware/varifyEmployee");
const {
  createOnlineSalesPlatform,
  getOnlineSalesPlatform,
  updateOnlineSalesPlatform,
  deleteOnlineSalesPlatform,
  getAllOnlineSales,
} = require("../controllers/onlineSalesController");

const router = express.Router();

router.get("/all", varifyEmployee, getOnlineSalesPlatform);
router.post("/create", varifyEmployee, createOnlineSalesPlatform);
router.put("/update/:id", varifyEmployee, updateOnlineSalesPlatform);
router.delete("/delete/:id", varifyEmployee, deleteOnlineSalesPlatform);

router.get("/group", varifyEmployee, getAllOnlineSales);

module.exports = router;
