const db = require("../confiq/db");

// get all notifications
exports.fetchUnreadNotifications = async (req, res) => {
  try {
    const { id } = req.decodedemployee;

    const query =
      "SELECT * FROM notifications WHERE receiver_id = ? AND is_read = FALSE";
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
exports.deleteSalary = async (req, res) => {
  try {
    const salaryId = req.params.id;
    if (!salaryId) {
      return res.status(404).send({
        success: false,
        message: "Invalid or missing Salary ID",
      });
    }

    await db.query(`DELETE FROM salaries WHERE id=?`, [salaryId]);
    res.status(200).send({
      success: true,
      message: "Salary Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete Salary",
      error,
    });
  }
};
