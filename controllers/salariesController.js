const db = require("../confiq/db");
const moment = require("moment");

exports.getAllSalaries = async (req, res) => {
  const { month, year, day, employeeID } = req.query;

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
  try {
    let query = `SELECT salaries.*, employees.name AS employeeName FROM salaries JOIN employees ON salaries.employeeID = employees.id WHERE date >= ? AND date <= ?`;
    let params = [startDate, endDate];

    if (employeeID) {
      query += " AND employeeID = ?";
      params.push(employeeID);
    }

    const busn_id = req.businessId;

    // Add busn_id filter if provided, but before ORDER BY
    if (busn_id) {
      query += " AND busn_id = ?";
      params.push(busn_id);
    }

    query += " ORDER BY id DESC"; // Move ORDER BY to the end

    const rows = await db.query(query, params);

    if (!rows[0] || rows[0].length === 0) {
      return res.status(200).send({
        success: true,
        message: "No Salary found",
        data: rows[0],
      });
    }

    let totalSalariesAmount = 0;
    rows[0].forEach((entry) => {
      totalSalariesAmount += parseFloat(entry.amount);
    });

    res.status(200).send({
      success: true,
      message: "All Salaries",
      totalSalaries: rows[0].length,
      totalSalariesAmount,
      data: rows[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Salaries",
      error,
    });
  }
};

// single Salary by id
exports.getSingleSalaryByID = async (req, res) => {
  try {
    const salariesID = req.params.id;
    if (!salariesID) {
      return res.status(404).send({
        success: false,
        message: "Invalid or missing salary ID",
      });
    }
    const data = await db.query(`SELECT * FROM salaries WHERE id=?`, [
      salariesID,
    ]);
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: true,
        message: "No Salary found",
        salary: data[0],
      });
    }
    res.status(200).send({
      success: true,
      message: "No Salary found",
      salary: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting salary",
      error,
    });
  }
};

// create salaries
exports.createSalary = async (req, res) => {
  try {
    const { employeeID, amount, payBy, check_no, date } = req.body;

    if (!employeeID || !amount || !payBy || !date) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    const { id, business_id } = req.decodedemployee;

    const data = await db.query(
      `INSERT INTO salaries (employeeID, amount, payBy, check_no, date, busn_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeID, amount, payBy, check_no, date, business_id]
    );

    if (!data) {
      return res.status(404).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

    const [employeeInfo] = await db.query(
      `SELECT * FROM employees WHERE id=? AND business_id=?`,
      [employeeID, business_id]
    );

    const employeeName = employeeInfo[0].name;
    const employeeType = employeeInfo[0].type;
    // Notification Details
    const title = `Salary Payment: ${employeeName} (${employeeType})`;
    const message = `${employeeName} (${employeeType}) has been paid a salary of ${amount} BDT on ${date} by ${payBy}.`;
    const isRead = false;

    // Insert Notification for Each Admin
    const [notification] = await db.query(
      "INSERT INTO notifications (sander_id, receiver_id, title, message, is_read) VALUES (?, ?, ?, ?, ?)",
      [id, employeeID, title, message, isRead]
    );

    if (!notification) {
      return res.status(404).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

    res.status(200).send({
      success: true,
      message: "Salary created successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Create Salary API",
      error: error.message,
    });
  }
};

// salary update
exports.updateSalary = async (req, res) => {
  try {
    const salaryID = req.params.id;
    if (!salaryID) {
      return res.status(404).send({
        success: false,
        message: "Invalid or missing Employee ID",
      });
    }
    const { amount, payBy, check_no, date } = req.body;

    if (!amount || !payBy || !date) {
      return res.status(404).send({
        success: false,
        message: "Please Provide amount, payBy and date",
      });
    }

    const data = await db.query(
      `UPDATE salaries SET amount=?, payBy=?, check_no=?, date=? WHERE id =? `,
      [amount, payBy, check_no, date, salaryID]
    );
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in update Salary ",
      });
    }
    res.status(200).send({
      success: true,
      message: "Salary updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update Salary ",
      error,
    });
  }
};

// salaries
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

// My Earnings Hours and Payment
exports.totalMyEarningsHoursAndPayment = async (req, res) => {
  const employeeId = req.params.id;
  if (!employeeId) {
    return res.status(400).send({
      success: false,
      message: "Employee ID is required",
    });
  }
  const { month, year, day } = req.query;
  const startDate = new Date(year, month - 1, 1);
  const endDate = day
    ? new Date(year, month - 1, day, 23, 59, 59)
    : new Date(year, month, 0, 23, 59, 59);

  try {
    let query = `SELECT salaries.*, salaryRate, employees.name AS employeeName FROM salaries JOIN employees ON salaries.employeeID = employees.id WHERE employeeID =?`;
    let params = [employeeId];

    if (month && year) {
      query += " AND date >= ? AND date <= ?";
      params.push(startDate);
      params.push(endDate);
    }

    const [data] = await db.query(query, params);

    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No Earnings found",
        data: data,
      });
    }

    let queryWorkHour = "SELECT * FROM work_hours WHERE employeeID = ?";
    let paramsWorkHour = [employeeId];

    if (month && year) {
      queryWorkHour += " AND date >= ? AND date <= ?";
      paramsWorkHour.push(startDate);
      paramsWorkHour.push(endDate);
    }

    const [workHoursData] = await db.query(queryWorkHour, paramsWorkHour);

    let totalAmount = 0;
    let allHours = moment.duration(0);
    workHoursData.forEach((row) => {
      totalAmount += parseFloat(row.amount);
      let hours = row.total_hours;
      if (hours) {
        let parts = hours.split(":");
        if (parts.length === 2) {
          allHours.add({
            hours: parseFloat(parts[0]),
            minutes: parseFloat(parts[1]),
          });
        } else if (!isNaN(parseFloat(hours))) {
          allHours.add({ hours: parseFloat(hours) });
        }
      }
    });

    const totalEarningsHours =
      Math.floor(allHours.asHours()) +
      ":" +
      moment.utc(allHours.asMilliseconds()).format("mm");

    const totalPayment = data.reduce(
      (acc, item) => acc + parseFloat(item.amount),
      0
    );
    const dueAmount = totalAmount - totalPayment;

    res.status(200).send({
      success: true,
      message: "My Earnings Hours and Payment",
      totalEarningsHours,
      totalAmount,
      totalPayment,
      dueAmount,
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in My Payment",
      error,
    });
  }
};
