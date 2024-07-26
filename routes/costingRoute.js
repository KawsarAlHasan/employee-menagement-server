const express = require("express");
const {
  getAllCostings,
  getSingleCosting,
  createCosting,
  updateCosting,
  deleteCosting,
  getAllCostName,
} = require("../controllers/costingController");
const varifyEmployee = require("../middleware/varifyEmployee");

const router = express.Router();

router.get("/all", varifyEmployee, getAllCostings);
router.get("/:id", getSingleCosting);
router.post("/create", varifyEmployee, createCosting);
router.put("/update/:id", updateCosting);
router.delete("/delete/:id", deleteCosting);
module.exports = router;
