const express = require("express");
const {
  getAllSales,
  getSingleSales,
  createsales,
  updatesales,
  deletesales,
} = require("../controllers/salesController");

const router = express.Router();

router.get("/all", getAllSales);
router.get("/:id", getSingleSales);
router.post("/create", createsales);
router.put("/update/:id", updatesales);
router.delete("/delete/:id", deletesales);

module.exports = router;
