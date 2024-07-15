const express = require("express");
const {
  getAllPartners,
  addPartner,
  updatePartner,
  getSinglePartner,
  deletePartner,
} = require("../controllers/partnershipController");
const varifyAdmin = require("../middleware/varifyAdmin");

const router = express.Router();

router.get("/all", getAllPartners);
router.get("/:id", getSinglePartner);
router.post("/create", addPartner);
router.put("/update/:id", updatePartner);
router.delete("/delete/:id", deletePartner);

module.exports = router;
