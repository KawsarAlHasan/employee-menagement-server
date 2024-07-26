const db = require("../confiq/db");
const moment = require("moment");

// get all work time
exports.getAllWorkTime = async (req, res) => {
  try {
    const { employeeID, paymentDate } = req.query;

    let params = [];
    let query = "SELECT * FROM work_hours WHERE 1=1";

    if (employeeID) {
      query += " AND employeeID = ?";
      params.push(employeeID);
    }

    if (paymentDate) {
      query += " AND date = ?";
      params.push(paymentDate);
    }
    query += " ORDER BY id DESC";

    const busn_id = req.businessId;
    query += " AND busn_id = ?";
    params.push(busn_id);

    const data = await db.query(query, params);

    if (!data[0] || data[0].length == 0) {
      return res.status(404).send({
        success: false,
        message: "No work hours found",
      });
    }

    res.status(200).send({
      success: true,
      message: "All work hours",
      totalWorkTime: data[0].length,
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All work hours",
      error,
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
    const { employeeID } = req.body;
    const startTime = new Date();

    const [checkData] = await db.query(
      `SELECT * FROM work_hours WHERE employeeID=? AND end_time IS NULL`,
      [employeeID]
    );

    if (checkData.length > 0) {
      return res.status(400).send({
        success: false,
        message: "You are already in work",
      });
    }

    const data = await db.query(
      `INSERT INTO work_hours (employeeID, start_time) VALUES (?,  ?)`,
      [employeeID, startTime]
    );

    if (!data) {
      return res.status(404).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

    res.status(200).send({
      success: true,
      message: "Start Work Successfull",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Start Work",
      error,
    });
  }
};

// work end
exports.endWorkTime = async (req, res) => {
  try {
    const { employeeID } = req.body;
    if (!employeeID) {
      return res.status(404).send({
        success: false,
        message: "Invalid or missing work Time ID",
      });
    }

    const [employeeData] = await db.query(
      `SELECT salaryType, salaryRate FROM employees WHERE id=?`,
      [employeeID]
    );
    const hourRate = employeeData[0].salaryRate;

    const endTime = new Date();

    const [sTime] = await db.query(
      `SELECT start_time FROM work_hours WHERE employeeID=? AND end_time IS NULL`,
      [employeeID]
    );

    const startTime = sTime[0].start_time;
    const totalWorkTime = endTime - startTime;

    const totalMinutes = Math.floor(totalWorkTime / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const totalHoursDecimal = totalMinutes / 60;
    const totalEarnings = totalHoursDecimal * hourRate;

    const totalWorkTimeInHours = `${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}`;

    const data = await db.query(
      `UPDATE work_hours SET end_time=?, total_hours=?, salaryRate=?, amount=? WHERE employeeID=? AND end_time IS NULL`,
      [endTime, totalWorkTimeInHours, hourRate, totalEarnings, employeeID]
    );
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in Work End Time ",
      });
    }

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
