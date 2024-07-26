const express = require("express");
const {
  createFoodCost,
  getAllFoodCost,
  deleteFoodCost,
  updateFoodCost,
} = require("../controllers/foodCostController");
const varifyEmployee = require("../middleware/varifyEmployee");

const router = express.Router();

router.post("/create", varifyEmployee, createFoodCost);
router.get("/all", varifyEmployee, getAllFoodCost);
router.put("/update/:id", varifyEmployee, updateFoodCost);
router.delete("/delete/:id", varifyEmployee, deleteFoodCost);

module.exports = router;
