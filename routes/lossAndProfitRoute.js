const express = require("express");
const { getLossAndProfit } = require("../controllers/lossAdndProfitController");

const router = express.Router();

router.get("/", getLossAndProfit);
module.exports = router;
