const express = require("express");

const varifyEmployee = require("../middleware/varifyEmployee");
const {
  createEmployeePosition,
  getEmployeePosition,
  updateEmployeePosition,
  deleteEmployeePosition,
} = require("../controllers/employeePositionController");

const router = express.Router();

router.post("/create", varifyEmployee, createEmployeePosition);
router.get("/all", varifyEmployee, getEmployeePosition);
router.put("/update/:id", varifyEmployee, updateEmployeePosition);
router.delete("/delete/:id", varifyEmployee, deleteEmployeePosition);

module.exports = router;
