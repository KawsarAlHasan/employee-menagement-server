const express = require("express");
const {
  getAllSalaries,
  getSingleSalaryByID,
  createSalary,
  updateSalary,
  deleteSalary,
  totalMyEarningsHoursAndPayment,
} = require("../controllers/salariesController");
const varifyEmployee = require("../middleware/varifyEmployee");

const router = express.Router();

router.get("/all", varifyEmployee, getAllSalaries);
router.get("/my-earnings/:id", varifyEmployee, totalMyEarningsHoursAndPayment);
router.get("/:id", varifyEmployee, getSingleSalaryByID);
router.post("/create", varifyEmployee, createSalary);
router.put("/update/:id", varifyEmployee, updateSalary);
router.delete("/delete/:id", varifyEmployee, deleteSalary);

module.exports = router;
