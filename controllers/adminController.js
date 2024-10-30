const db = require("../confiq/db");
const { generateEmployeeToken } = require("../confiq/employeeToken");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { sendMail } = require("../middleware/sandEmail");

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

    const [businessData] = await db.query(
      "SELECT business_id FROM employees ORDER BY business_id DESC"
    );

    const business_id = businessData[0].business_id + 1; /// Last business data + 1
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
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

    if (result.insertId) {
      const fee = 0;
      const [data] = await db.query(
        "INSERT INTO processing_fee (fee, busn_id) VALUES (?, ?)",
        [fee, business_id]
      );

      await db.query(
        "INSERT INTO general_setting (tax, state, busn_id) VALUES (?, ?, ?)",
        [0, "state name", business_id]
      );

      const bsValue = "default";

      await db.query(
        "INSERT INTO taxt_status (busn_id, status) VALUES (?, ?)",
        [business_id, bsValue]
      );

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
    }

    res.status(200).send({
      success: true,
      message: "Admin created successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }
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
    const admin = req.decodedemployee;

    const { business_name, business_address, name, phone } = req.body;

    const [resultsData] = await db.query(
      `UPDATE employees SET business_name=?, business_address=?, name=?, phone=? WHERE id =?`,
      [
        business_name || admin.business_name,
        business_address || admin.business_address,
        name || admin.name,
        phone || admin.phone,
        admin.id,
      ]
    );

    if (!resultsData) {
      return res.status(403).json({
        success: false,
        error: "Something went wrong",
      });
    }

    const images = req.file;
    const [empLoyeeProfilePic] = await db.query(
      `SELECT profilePic FROM employee_history WHERE employee_id=?`,
      [admin.id]
    );

    let proPic = empLoyeeProfilePic[0]?.profilePic;
    if (images && images.path) {
      proPic = `/public/images/${images.filename}`;
    }

    if (empLoyeeProfilePic == 0) {
      await db.query(
        `INSERT INTO employee_history (employee_id, profilePic) VALUES (?, ?)`,
        [admin.id, proPic]
      );
    } else {
      await db.query(
        `UPDATE employee_history SET profilePic=? WHERE employee_id =?`,
        [proPic, admin.id]
      );
    }

    res.status(200).send({
      success: true,
      message: "Admin updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update Admin ",
      error: error.message,
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
