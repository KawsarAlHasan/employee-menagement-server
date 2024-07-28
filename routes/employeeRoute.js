const express = require("express");
const {
  getAllEmployees,
  getSingleEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  employeeLogin,
  getMeEmployee,
  createAdmins,
  updateAdmins,
  updateAdminPassword,
  updateEmployeePassword,
} = require("../controllers/employeeController");
const varifyEmployee = require("../middleware/varifyEmployee");

const router = express.Router();

router.get("/all", varifyEmployee, getAllEmployees);
router.get("/me", varifyEmployee, getMeEmployee);
router.get("/:id", varifyEmployee, getSingleEmployee);
router.patch("/create", varifyEmployee, createEmployee);
router.post("/login", employeeLogin);
router.put("/update/:id", varifyEmployee, updateEmployee);
router.put("/update-password/:id", varifyEmployee, updateEmployeePassword);
router.delete("/delete/:id", varifyEmployee, deleteEmployee);

router.post("/new-admin/create", createAdmins);
router.put("/new-admin/update/:id", varifyEmployee, updateAdmins);
router.put(
  "/new-admin/update-password/:id",
  varifyEmployee,
  updateAdminPassword
);

module.exports = router;
