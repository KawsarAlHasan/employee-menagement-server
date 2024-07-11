const express = require("express");
const {
  getAllPartners,
  addPartner,
} = require("../controllers/partnershipController");

const router = express.Router();

router.get("/all", getAllPartners);
router.post("/create", addPartner);

module.exports = router;
