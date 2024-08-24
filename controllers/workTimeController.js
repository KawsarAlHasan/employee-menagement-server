const db = require("../confiq/db");
const moment = require("moment-timezone");

// get all work time
exports.getAllWorkTime = async (req, res) => {
  try {
    const { employeeID, month, year, day } = req.query;
    const busn_id = req.businessId;

    if (!month || !year) {
      return res.status(400).send({
        success: false,
        message: "Month and year are required",
      });
    }

    const startDate = new Date(year, month - 1, 1);

    const endDate = day
      ? new Date(year, month - 1, day, 23, 59, 59)
      : new Date(year, month, 0, 23, 59, 59);

    const [data] = await db.query(
      "SELECT * FROM work_hours WHERE date >= ? AND date <= ? AND busn_id=? AND employeeID = ? ORDER BY id DESC",
      [startDate, endDate, busn_id, employeeID]
    );

    if (data.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No work hours found",
      });
    }

    res.status(200).json({
      success: true,
      message: "All work hours",
      totalWorkTime: data.length,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching work hours",
      error: error.message,
    });
  }
};

exports.getTodayWorkTime = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).send({
        success: false,
        message: "date are required",
      });
    }

    const { id } = req.decodedemployee;
    const [data] = await db.query(
      `SELECT * FROM work_hours WHERE employeeID=? AND date=?`,
      [id, date]
    );

    if (data.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No work hours found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Today total work hours",
      todayTotalClockIn: data.length,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching work Time",
      error: error.message,
    });
  }
};

// get single work time
exports.getSingleWorkTimeByID = async (req, res) => {
  try {
    const workHours = req.params.id;
    if (!workHours) {
      return res.status(404).send({
        success: false,
        message: "Invalid or missing work hours ID",
      });
    }
    const data = await db.query(`SELECT * FROM work_hours WHERE id=?`, [
      workHours,
    ]);
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No work Time found",
      });
    }
    const workTime = data[0];
    res.status(200).send(workTime[0]);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting work Time",
      error,
    });
  }
};

// start work hours
exports.startWorkTime = async (req, res) => {
  try {
    const { id, business_id, name, type, employeeType } = req.decodedemployee;
    const startTime = new Date();

    const [checkData] = await db.query(
      `SELECT * FROM work_hours WHERE employeeID=? AND end_time IS NULL`,
      [id]
    );

    if (checkData.length > 0) {
      return res.status(400).send({
        success: false,
        message: "You are already in work",
      });
    }

    const dateInTokyo = moment.tz(startTime, "Asia/Tokyo").format();
    const today = moment.tz(startTime, "Asia/Tokyo").format().slice(0, 10);

    const data = await db.query(
      `INSERT INTO work_hours (employeeID, start_time, date, busn_id) VALUES (?, ?, ?, ?)`,
      [id, dateInTokyo, today, business_id]
    );

    if (!data) {
      return res.status(404).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

    // Fetch Admin Users
    const [admins] = await db.query(
      "SELECT id FROM employees WHERE business_id = ? AND type = 'admin'",
      [business_id]
    );

    // Notification Details
    const title = `Clock In: ${name} (${employeeType})`;
    const message = `${name} clocked in at ${startTime}.`;

    const isRead = false;

    // Insert Notification for Each Admin
    admins.forEach(async (admin) => {
      await db.query(
        "INSERT INTO notifications (sander_id, receiver_id, title, message, is_read) VALUES (?, ?, ?, ?, ?)",
        [id, admin.id, title, message, isRead]
      );
    });

    res.status(200).send({
      success: true,
      message: "Start Work Successfull",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Start Work",
      error: error.message,
    });
  }
};

// work end
exports.endWorkTime = async (req, res) => {
  try {
    const { id, business_id, salaryRate, name, type, employeeType } =
      req.decodedemployee;

    const newDate = new Date();

    // const dateInTokyo = moment.tz(newDate, "Asia/Tokyo");

    const dateInTokyo = moment.tz(newDate, "Asia/Tokyo");

    // Extract components
    const year = dateInTokyo.year();
    const month = dateInTokyo.month(); // Note: month is 0-based in JavaScript Date
    const day = dateInTokyo.date();
    const hour = dateInTokyo.hour();
    const minute = dateInTokyo.minute();
    const second = dateInTokyo.second();
    const millisecond = dateInTokyo.millisecond();
    const endTime = new Date(
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond
    );

    const [sTime] = await db.query(
      `SELECT start_time FROM work_hours WHERE employeeID=? AND end_time IS NULL`,
      [id]
    );

    if (sTime.length === 0) {
      return res.status(400).json({
        success: false,
        message: "You are not working Start yet",
      });
    }

    const startTime = sTime[0].start_time;
    const totalWorkTime = endTime - startTime;

    const totalMinutes = Math.floor(totalWorkTime / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalHoursDecimal = totalMinutes / 60;

    const totalEarnings = totalHoursDecimal * salaryRate;

    const totalWorkTimeInHours = `${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}`;

    const data = await db.query(
      `UPDATE work_hours SET end_time=?, total_hours=?, salaryRate=?, amount=? WHERE employeeID=? AND end_time IS NULL`,
      [endTime, totalWorkTimeInHours, salaryRate, totalEarnings, id]
    );
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in Work End Time ",
      });
    }

    // Fetch Admin Users
    const [admins] = await db.query(
      "SELECT id FROM employees WHERE business_id = ? AND type = 'admin'",
      [business_id]
    );

    // Notification Details
    const title = `Clock Out: ${name} (${employeeType})`;
    const message = `${name} clocked out at ${endTime}. Total working hours: ${totalWorkTimeInHours}. Total earnings: ${totalEarnings}.`;
    const isRead = false;

    // Insert Notification for Each Admin
    admins.forEach(async (admin) => {
      await db.query(
        "INSERT INTO notifications (sander_id, receiver_id, title, message, is_read) VALUES (?, ?, ?, ?, ?)",
        [id, admin.id, title, message, isRead]
      );
    });

    res.status(200).send({
      success: true,
      message: "Work Ended successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in End Work",
      error: error.message,
    });
  }
};
