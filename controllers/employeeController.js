const db = require("../confiq/db");
const { generateEmployeeToken } = require("../confiq/employeeToken");
const bcrypt = require("bcrypt");
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

    const data = await db.query(
      `SELECT * FROM employees WHERE id=? AND business_id=?`,
      [employeeID, business_id]
    );
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No Employee found",
      });
    }
    const employee = data[0];
    res.status(200).send(employee[0]);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting Employee",
      error,
    });
  }
};

// create employee
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, type, salaryType, salaryRate } =
      req.body;

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

    const business_id = req.businessId;

    const data = await db.query(
      `INSERT INTO employees (business_id, name, email, password, emailPin, phone, type, salaryType, salaryRate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        business_id,
        name,
        email,
        password,
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const isMatch = await bcrypt.compare(empLoyee?.password, hashedPassword);

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

// get me employee
exports.getMeEmployee = async (req, res) => {
  try {
    const decodedEmployee = req?.decodedemployee?.email;
    const result = await db.query(`SELECT * FROM employees WHERE email=?`, [
      decodedEmployee,
    ]);

    const employee = result[0];
    res.status(200).json(employee[0]);
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
    const { name, email, phone, type, salaryType, salaryRate } = req.body;

    const business_id = req.businessId;

    const data = await db.query(
      `UPDATE employees SET name=?, email=?, phone=?, type=?, salaryType=?, salaryRate=? WHERE id =? AND business_id=?`,
      [
        name,
        email,
        phone,
        type,
        salaryType,
        salaryRate,
        employeeID,
        business_id,
      ]
    );
    if (!data) {
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
    const { name, email, password, phone } = req.body;

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

    const data = await db.query(
      `INSERT INTO employees (business_id, name, email, password, emailPin, phone, type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [business_id, name, email, password, randomCode, phone, type]
    );

    if (!data) {
      return res.status(404).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

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
