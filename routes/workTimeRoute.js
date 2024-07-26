const express = require("express");
const {
  getAllWorkTime,
  getSingleWorkTimeByID,
  startWorkTime,
  endWorkTime,
} = require("../controllers/workTimeController");
const varifyEmployee = require("../middleware/varifyEmployee");

const router = express.Router();

router.get("/all", varifyEmployee, getAllWorkTime);
router.post("/start", varifyEmployee, startWorkTime);
router.put("/end", varifyEmployee, endWorkTime);
router.get("/:id", varifyEmployee, getSingleWorkTimeByID);

module.exports = router;
