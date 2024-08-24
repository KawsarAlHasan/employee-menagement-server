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
  employeeCheck,
  getSingleEmployeeInfo,
  activeDeactivateEmployee,
} = require("../controllers/employeeController");
const varifyEmployee = require("../middleware/varifyEmployee");
const uploadImage = require("../middleware/uploaderImage");

const router = express.Router();

router.get("/all", varifyEmployee, getAllEmployees);
router.get("/me", varifyEmployee, getMeEmployee);
router.get("/info/:id", varifyEmployee, getSingleEmployeeInfo);
router.get("/:id", varifyEmployee, getSingleEmployee);
router.patch(
  "/create",
  uploadImage.single("profilePic"),
  varifyEmployee,
  createEmployee
);
router.post("/login", employeeLogin);
router.post("/check", varifyEmployee, employeeCheck);
router.put(
  "/update/:id",
  uploadImage.single("profilePic"),
  varifyEmployee,
  updateEmployee
);
router.put("/status/:id", varifyEmployee, activeDeactivateEmployee);
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
