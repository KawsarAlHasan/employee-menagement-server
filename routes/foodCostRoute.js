const express = require("express");
const {
  createFoodCost,
  getAllFoodCost,
  deleteFoodCost,
  updateFoodCost,
} = require("../controllers/foodCostController");

const router = express.Router();

router.post("/create", createFoodCost);
router.get("/all", getAllFoodCost);
router.put("/update/:id", updateFoodCost);
router.delete("/delete/:id", deleteFoodCost);

module.exports = router;
