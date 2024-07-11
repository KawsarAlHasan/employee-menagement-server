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

router.get("/all", getAllEmployees);
router.get("/me", varifyEmployee, getMeEmployee);
router.get("/:id", getSingleEmployee);
router.post("/create", createEmployee);
router.post("/login", employeeLogin);
router.put("/update/:id", updateEmployee);
router.delete("/delete/:id", deleteEmployee);

module.exports = router;
