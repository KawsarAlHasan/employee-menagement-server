const express = require("express");
const {
  getAllCostingsList,
  createCostingList,
  updateCostingList,
  deleteCostList,
} = require("../controllers/costlistController");
const varifyEmployee = require("../middleware/varifyEmployee");

const router = express.Router();

router.get("/all", varifyEmployee, getAllCostingsList);
router.post("/create", varifyEmployee, createCostingList);
router.put("/update/:id", varifyEmployee, updateCostingList);
router.delete("/delete/:id", varifyEmployee, deleteCostList);
module.exports = router;
