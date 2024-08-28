const express = require("express");
const {
  getAllPartners,
  addPartner,
  updatePartner,
  getSinglePartner,
  deletePartner,
  getMePartner,
} = require("../controllers/partnershipController");
const varifyEmployee = require("../middleware/varifyEmployee");

const router = express.Router();

router.get("/all", varifyEmployee, getAllPartners);
router.get("/me", varifyEmployee, getMePartner);
router.get("/:id", varifyEmployee, getSinglePartner);
router.post("/create", varifyEmployee, addPartner);
router.put("/update/:id", varifyEmployee, updatePartner);
router.delete("/delete/:id", varifyEmployee, deletePartner);

module.exports = router;
