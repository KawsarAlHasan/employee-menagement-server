const express = require("express");
const {
  getAllWorkTime,
  getSingleWorkTimeByID,
  startWorkTime,
  endWorkTime,
} = require("../controllers/workTimeController");

const router = express.Router();

router.get("/all", getAllWorkTime);
router.post("/start", startWorkTime);
router.put("/end", endWorkTime);
router.get("/:id", getSingleWorkTimeByID);

module.exports = router;
