const express = require("express");
const {
  getAllCostings,
  getSingleCosting,
  createCosting,
  updateCosting,
  deleteCosting,
  getAllCostName,
} = require("../controllers/costingController");

const router = express.Router();

router.get("/all", getAllCostings);
router.get("/costname", getAllCostName);
router.get("/:id", getSingleCosting);
router.post("/create", createCosting);
router.put("/update/:id", updateCosting);
router.delete("/delete/:id", deleteCosting);
module.exports = router;
