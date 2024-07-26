const express = require("express");
const { getLossAndProfit } = require("../controllers/lossAdndProfitController");
const varifyEmployee = require("../middleware/varifyEmployee");

const router = express.Router();

router.get("/", varifyEmployee, getLossAndProfit);
module.exports = router;
