const express = require("express");
const {
  getAllEmployees,
  getSingleEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  employeeLogin,
  getMeEmployee,
} = require("../controllers/employeeController");
const varifyEmployee = require("../middleware/varifyEmployee");

const router = express.Router();

router.get("/all", varifyEmployee, getAllEmployees);
router.get("/me", varifyEmployee, getMeEmployee);
router.get("/:id", varifyEmployee, getSingleEmployee);
router.patch("/create", varifyEmployee, createEmployee);
router.post("/login", employeeLogin);
router.put("/update/:id", varifyEmployee, updateEmployee);
router.delete("/delete/:id", varifyEmployee, deleteEmployee);

module.exports = router;
