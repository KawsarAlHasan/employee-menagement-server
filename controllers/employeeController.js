const db = require("../confiq/db");
const { generateEmployeeToken } = require("../confiq/employeeToken");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { sendMail } = require("../middleware/sandEmail");

// get all Employees
exports.getAllEmployees = async (req, res) => {
  try {
    const business_id = req.businessId;

    const [data] = await db.query(
      "SELECT * FROM employees WHERE business_id=?",
      [business_id]
    );

    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No Employees found",
        data: data[0],
      });
    }

    // Filter out admin employees
    const filteredEmployees = data.filter(
      (employee) => employee.type.toLowerCase() !== "admin"
    );

    res.status(200).send({
      success: true,
      message: "All Employees",
      totalempLoyees: filteredEmployees.length,
      data: filteredEmployees,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All empLoyees",
      error: error.message,
    });
  }
};

// get single Employee by id
exports.getSingleEmployee = async (req, res) => {
  try {
    const employeeID = req.params.id;
    if (!employeeID) {
      return res.status(404).send({
        success: false,
        message: "Invalid or missing Employee ID",
      });
    }

    const business_id = req.businessId;

    const [data] = await db.query(
      `SELECT * FROM employees WHERE id=? AND business_id=?`,
      [employeeID, business_id]
    );
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No Employee found",
      });
    }

    const [workHoursData] = await db.query(
      "SELECT * FROM work_hours WHERE employeeID = ?",
      [employeeID]
    );

    let totalAmount = 0;
    let allHours = moment.duration(0);
    workHoursData?.forEach((row) => {
      totalAmount += parseFloat(row?.amount);
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

    const totalWorkTime =
      Math.floor(allHours.asHours()) +
      ":" +
      moment.utc(allHours.asMilliseconds()).format("mm");

    const [salariesData] = await db.query(
      "SELECT * FROM salaries WHERE employeeID = ?",
      [employeeID]
    );

    const totalPayment = salariesData?.reduce(
      (acc, item) => acc + parseFloat(item?.amount),
      0
    );

    const [historyData] = await db.query(
      `SELECT address, profilePic, joiningDate FROM employee_history WHERE employee_id=?`,
      [employeeID]
    );

    const dueAmount = totalAmount - totalPayment;

    const employee = {
      ...data[0],
      total_amount_earn: parseFloat(totalAmount.toFixed(3)) || "",
      total_clock_in: totalWorkTime || "",
      total_payment: parseFloat(totalPayment.toFixed(3)) || 0,
      due_payment: parseFloat(dueAmount.toFixed(3)) || 0,
      address: historyData[0]?.address || "",
      profilePic: historyData[0]?.profilePic || "",
      joiningDate: historyData[0]?.joiningDate || "",
    };

    res.status(200).send(employee);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting Employee",
      error: error.message,
    });
  }
};

// create employee
exports.createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      type,
      salaryType,
      salaryRate,
      address,
      joiningDate,
    } = req.body;

    const images = req.file;
    let proPic = "";
    if (images && images.path) {
      proPic = `/public/images/${images.filename}`;
    }
    let employeeAdd = address;
    if (address == undefined) {
      employeeAdd = "";
    }
    let joinDate = joiningDate;
    if (joiningDate == undefined) {
      joinDate = "";
    }

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !type ||
      !salaryType ||
      !salaryRate
    ) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    const min = 1000;
    const max = 9999;
    const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

    const business_id = req.businessId;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [data] = await db.query(
      `INSERT INTO employees (business_id, name, email, password, emailPin, phone, type, salaryType, salaryRate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        business_id,
        name,
        email,
        hashedPassword,
        randomCode,
        phone,
        type,
        salaryType,
        salaryRate,
      ]
    );

    if (!data) {
      return res.status(404).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

    if (data.insertId) {
      const employeeID = data?.insertId;
      const [employeeHistory] = await db.query(
        `INSERT INTO employee_history (employee_id, profilePic, address, joiningDate) VALUES (?, ?, ?, ?)`,
        [employeeID, proPic, employeeAdd, joinDate]
      );
      if (!employeeHistory) {
        return res.status(404).send({
          success: false,
          message: "Error in INSERT QUERY",
        });
      }
      const emailData = {
        email,
        name,
        password,
        phone,
        type,
        salaryType,
        salaryRate,
        randomCode,
      };
      const emailResult = await sendMail(emailData);
      if (!emailResult.messageId) {
        res.status(500).send("Failed to send email");
      }
    }

    res.status(200).send({
      success: true,
      message: "Employee created successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Create Employee API",
      error: error.message,
    });
  }
};

// employee login
exports.employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        error: "Please provide your credentials",
      });
    }
    const [results] = await db.query(`SELECT * FROM employees WHERE email=?`, [
      email,
    ]);

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const empLoyee = results[0];

    const isMatch = await bcrypt.compare(password, empLoyee?.password);

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }

    const token = generateEmployeeToken(empLoyee);
    const { password: pwd, ...empLoyeeWithoutPassword } = empLoyee;

    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
        user: empLoyeeWithoutPassword,
        token,
      },
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "empLoyee Login Unseccess",
      error: error.message,
    });
  }
};

// pin check success
exports.employeeCheck = async (req, res) => {
  try {
    const { reqEmailPin } = req.body;
    if (!reqEmailPin) {
      return res.status(401).json({
        success: false,
        error: "Please provide your pin",
      });
    }
    const decodedEmployee = req?.decodedemployee?.email;
    const [results] = await db.query(`SELECT * FROM employees WHERE email=?`, [
      decodedEmployee,
    ]);

    const empLoyee = results[0]?.emailPin;

    if (empLoyee == reqEmailPin) {
      res.status(200).json({
        success: true,
        message: "Pin Check Success",
      });
    }
    return res.status(401).json({
      success: false,
      error: "Your Pic is not correct",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Pin Check unsuccess",
      error: error.message,
    });
  }
};

// get me employee
exports.getMeEmployee = async (req, res) => {
  try {
    const decodedEmployee = req?.decodedemployee?.email;
    const [result] = await db.query(`SELECT * FROM employees WHERE email=?`, [
      decodedEmployee,
    ]);

    const employeeId = result[0].id;

    const [workHoursData] = await db.query(
      "SELECT * FROM work_hours WHERE employeeID = ?",
      [employeeId]
    );

    let totalAmount = 0;
    let allHours = moment.duration(0);
    workHoursData?.forEach((row) => {
      totalAmount += parseFloat(row?.amount);
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

    const totalWorkTime =
      Math.floor(allHours.asHours()) +
      ":" +
      moment.utc(allHours.asMilliseconds()).format("mm");

    const [salariesData] = await db.query(
      "SELECT * FROM salaries WHERE employeeID = ?",
      [employeeId]
    );

    const totalPayment = salariesData?.reduce(
      (acc, item) => acc + parseFloat(item?.amount),
      0
    );

    const [historyData] = await db.query(
      `SELECT address, profilePic, joiningDate FROM employee_history WHERE employee_id=?`,
      [employeeId]
    );

    const dueAmount = totalAmount - totalPayment;

    const employee = {
      ...result[0],
      total_amount_earn: parseFloat(totalAmount.toFixed(3)) || "",
      total_clock_in: totalWorkTime || "",
      total_payment: parseFloat(totalPayment.toFixed(3)) || 0,
      due_payment: parseFloat(dueAmount.toFixed(3)) || 0,
      address: historyData[0]?.address || "",
      profilePic: historyData[0]?.profilePic || "",
      joiningDate: historyData[0]?.joiningDate || "",
    };

    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employeeID = req.params.id;
    if (!employeeID) {
      return res.status(404).send({
        success: false,
        message: "Employee ID is requied",
      });
    }
    const images = req.file;
    const [empLoyeeProfilePic] = await db.query(
      `SELECT profilePic FROM employee_history WHERE employee_id=?`,
      [employeeID]
    );

    let proPic = empLoyeeProfilePic[0]?.profilePic;
    if (images && images.path) {
      proPic = `/public/images/${images.filename}`;
    }

    const { name, phone, type, salaryType, salaryRate, address, joiningDate } =
      req.body;

    const [data] = await db.query(
      `UPDATE employees SET name=?, phone=?, type=?, salaryType=?, salaryRate=? WHERE id =?`,
      [name, phone, type, salaryType, salaryRate, employeeID]
    );
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in update Employee ",
      });
    }
    const [employeeHistory] = await db.query(
      `UPDATE employee_history SET profilePic=?, address=?, joiningDate=? WHERE employee_id =?`,
      [proPic, address, joiningDate, employeeID]
    );

    if (!employeeHistory) {
      return res.status(500).send({
        success: false,
        message: "Error in update Employee ",
      });
    }

    res.status(200).send({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update Employee ",
      error: error.message,
    });
  }
};

// update employee password
exports.updateEmployeePassword = async (req, res) => {
  try {
    const employeeID = req.params.id;
    if (!employeeID) {
      return res.status(404).send({
        success: false,
        message: "Employee ID is requied",
      });
    }
    const { old_password, new_password } = req.body;
    const type = "admin";
    const [data] = await db.query(
      "SELECT password FROM employees WHERE id =? AND type != ?",
      [employeeID, type]
    );

    const checkPassword = data[0]?.password;

    const isMatch = await bcrypt.compare(old_password, checkPassword);

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: "Your Old Password is not correct",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const [result] = await db.query(
      `UPDATE employees SET password=? WHERE id =?`,
      [hashedPassword, employeeID]
    );

    if (!result) {
      return res.status(403).json({
        success: false,
        error: "Something went wrong",
      });
    }

    res.status(200).send({
      success: true,
      message: "Employee password updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in password Update Employee ",
      error,
    });
  }
};

// delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    if (!employeeId) {
      return res.status(404).send({
        success: false,
        message: "Invalid or missing Employee ID",
      });
    }

    const business_id = req.businessId;

    await db.query(`DELETE FROM employees WHERE id=? AND business_id=?`, [
      business_id,
      employeeId,
    ]);
    res.status(200).send({
      success: true,
      message: "Employee Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete Employee",
      error,
    });
  }
};

// create Admmin
exports.createAdmins = async (req, res) => {
  try {
    const { business_name, business_address, name, email, password, phone } =
      req.body;

    if (!name || !email || !password || !phone) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    const type = "admin";

    const min = 1000;
    const max = 9999;
    const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

    const emailData = {
      business_name,
      business_address,
      email,
      name,
      password,
      phone,
      type,
      randomCode,
    };

    const emailResult = await sendMail(emailData);

    if (!emailResult.messageId) {
      res.status(500).send("Failed to send email");
    }

    const [businessData] = await db.query(
      "SELECT business_id FROM employees ORDER BY business_id DESC"
    );

    const business_id = businessData[0].business_id + 1; /// Last business data + 1
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO employees (business_name, business_address, business_id, name, email, password, emailPin, phone, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        business_name,
        business_address,
        business_id,
        name,
        email,
        hashedPassword,
        randomCode,
        phone,
        type,
      ]
    );

    res.status(200).send({
      success: true,
      message: "Admin created successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Create Admin API",
      error: error.message,
    });
  }
};

// update admin
exports.updateAdmins = async (req, res) => {
  try {
    const employeeID = req.params.id;
    if (!employeeID) {
      return res.status(404).send({
        success: false,
        message: "Admin ID is requied",
      });
    }

    const { business_name, business_address, name, phone } = req.body;

    const business_id = req.businessId;

    const [resultsData] = await db.query(
      `UPDATE employees SET business_name=?, business_address=?, name=?, phone=? WHERE id =? AND business_id=?`,
      [business_name, business_address, name, phone, employeeID, business_id]
    );

    if (!resultsData) {
      return res.status(403).json({
        success: false,
        error: "Something went wrong",
      });
    }

    res.status(200).send({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update Employee ",
      error,
    });
  }
};

// update admin password
exports.updateAdminPassword = async (req, res) => {
  try {
    const employeeID = req.params.id;
    if (!employeeID) {
      return res.status(404).send({
        success: false,
        message: "Admin ID is requied",
      });
    }
    const busn_id = req.businessId;
    const { old_password, new_password } = req.body;
    const type = "admin";

    const [data] = await db.query(
      "SELECT password FROM employees WHERE id =? AND type=?",
      [employeeID, type]
    );

    const checkPassword = data[0]?.password;

    const isMatch = await bcrypt.compare(old_password, checkPassword);

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: "Your Old Password is not correct",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const [result] = await db.query(
      `UPDATE employees SET password=? WHERE id =? AND business_id=?`,
      [hashedPassword, employeeID, busn_id]
    );

    if (!result) {
      return res.status(403).json({
        success: false,
        error: "Something went wrong",
      });
    }

    res.status(200).send({
      success: true,
      message: "Admin password updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in password Update Admin ",
      error,
    });
  }
};
