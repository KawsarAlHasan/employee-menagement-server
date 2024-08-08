const express = require("express");

const varifyEmployee = require("../middleware/varifyEmployee");
const {
  fetchUnreadNotifications,
  markNotificationAsRead,
  deleteNotification,
} = require("../controllers/notificationsController");

const router = express.Router();

router.get("/all", varifyEmployee, fetchUnreadNotifications);
router.put("/update/:id", varifyEmployee, markNotificationAsRead);
router.delete("/delete/:id", varifyEmployee, deleteNotification);

module.exports = router;
