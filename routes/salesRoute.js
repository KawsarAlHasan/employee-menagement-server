const express = require("express");
const {
  getAllSales,
  getSingleSales,
  createsales,
  updatesales,
  deletesales,
} = require("../controllers/salesController");
const varifyEmployee = require("../middleware/varifyEmployee");

const router = express.Router();

router.get("/all", varifyEmployee, getAllSales);
router.get("/:id", varifyEmployee, getSingleSales);
router.post("/create", varifyEmployee, createsales);
router.put("/update/:id", varifyEmployee, updatesales);
router.delete("/delete/:id", varifyEmployee, deletesales);

module.exports = router;
