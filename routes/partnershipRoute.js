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
router.post("/create", varifyAdmin, addPartner);
router.put("/update/:id", varifyAdmin, updatePartner);
router.delete("/delete/:id", varifyAdmin, deletePartner);

module.exports = router;
