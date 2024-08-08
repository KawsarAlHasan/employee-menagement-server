const db = require("../confiq/db");

// get all notifications
exports.fetchUnreadNotifications = async (req, res) => {
  try {
    const { id } = req.decodedemployee;

    const query =
      "SELECT * FROM notifications WHERE receiver_id = ? ORDER BY id DESC";
    const [data] = await db.query(query, [id]);

    if (!data || data.length == 0) {
      return res.status(200).send({
        success: false,
        message: "No notifications found",
        data: data[0],
      });
    }

    res.status(200).send({
      success: true,
      message: "All Notifications",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Notifications",
      error: error.message,
    });
  }
};

// update notifications
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    if (!notificationId) {
      return res.status(404).send({
        success: false,
        message: "Notifications id is required",
      });
    }
    const query = "UPDATE notifications SET is_read = TRUE WHERE id = ?";
    await db.query(query, [notificationId]);
    res.status(200).send({
      success: true,
      message: "Notifications updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update Notifications ",
      error,
    });
  }
};

// notification delete
exports.deleteNotification = async (req, res) => {
  try {
    const notificationID = req.params.id;
    if (!notificationID) {
      return res.status(404).send({
        success: false,
        message: "Notification id is required in params",
      });
    }

    await db.query(`DELETE FROM notifications WHERE id=?`, [notificationID]);
    res.status(200).send({
      success: true,
      message: "Notification Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete Notification",
      error: error.message,
    });
  }
};
