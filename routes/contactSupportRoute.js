const express = require("express");
const {
  createSupport,
  getSupport,
  updateContactSupport,
} = require("../controllers/contactSupportController");

const router = express.Router();

router.post("/create", createSupport);
router.get("/", getSupport);
router.put("/update", updateContactSupport);

module.exports = router;
