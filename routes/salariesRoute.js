const express = require("express");
const {
  getAllSalaries,
  getSingleSalaryByID,
  createSalary,
  updateSalary,
  deleteSalary,
  totalMyEarningsHoursAndPayment,
} = require("../controllers/salariesController");

const router = express.Router();

router.get("/all", getAllSalaries);
router.get("/my-earnings/:id", totalMyEarningsHoursAndPayment);
router.get("/:id", getSingleSalaryByID);
router.post("/create", createSalary);
router.put("/update/:id", updateSalary);
router.delete("/delete/:id", deleteSalary);

module.exports = router;
