const db = require("../confiq/db");
const moment = require("moment");

exports.getAllSalaries = async (req, res) => {
  try {
    const { employeeID, paymentDate } = req.query;

    let params = [];
    let query = "SELECT * FROM salaries WHERE 1=1";

    if (employeeID) {
      query += " AND employeeID = ?";
      params.push(employeeID);
    }

    if (paymentDate) {
      query += " AND date = ?";
      params.push(paymentDate);
    }

    const data = await db.query(query, params);

    if (!data) {
      return res.status(404).send({
        success: false,
        message: "No Salaries found",
      });
    }
    res.status(200).send({
      success: true,
      message: "All Salaries",
      totalSalaries: data[0].length,
      data: data[0],
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
        success: false,
        message: "No Salary found",
      });
    }
    const salary = data[0];
    res.status(200).send(salary[0]);
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
    const { employeeID, amout, payBy, date } = req.body;
    if (!employeeID || !amout || !payBy || !date) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    const data = await db.query(
      `INSERT INTO salaries (employeeID, amout, payBy, date) VALUES (?, ?, ?, ?)`,
      [employeeID, amout, payBy, date]
    );

    if (!data) {
      return res.status(404).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

    res.status(200).send({
      success: true,
      message: "Salary created successfully",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Create Salary API",
      error,
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
    const { amout, payBy, date } = req.body;

    if (!amout || !payBy || !date) {
      return res.status(404).send({
        success: false,
        message: "Please Provide amout, payBy and date",
      });
    }

    const data = await db.query(
      `UPDATE salaries SET amout=?, payBy=?, date=? WHERE id =? `,
      [amout, payBy, date, salaryID]
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
  try {
    const employeeId = req.params.id;
    if (!employeeId) {
      return res.status(400).send({
        success: false,
        message: "Employee ID is required",
      });
    }

    const [data] = await db.query(
      "SELECT amout FROM salaries WHERE employeeID = ?",
      [employeeId]
    );

    if (!data) {
      return res.status(404).send({
        success: false,
        message: "No Earnings found",
      });
    }

    const [amoutData] = await db.query(
      "SELECT total_hours, amount FROM work_hours WHERE employeeID = ?",
      [employeeId]
    );

    if (!amoutData) {
      return res.status(404).send({
        success: false,
        message: "No Earnings found",
      });
    }

    let totalAmount = 0;
    let allHours = moment.duration(0);
    amoutData.forEach((row) => {
      totalAmount += row.amount;
      let hours = row.total_hours;
      if (hours) {
        let parts = hours.split(":");
        if (parts.length === 2) {
          allHours.add({
            hours: parseInt(parts[0]),
            minutes: parseInt(parts[1]),
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

    const totalPayment = data.reduce((acc, item) => acc + item.amout, 0);
    const dueAmount = totalAmount - totalPayment;

    res.status(200).send({
      success: true,
      message: "My Earnings Hours and Payment",
      totalEarningsHours,
      totalAmount,
      totalPayment,
      dueAmount,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in My Payment",
      error,
    });
  }
};
