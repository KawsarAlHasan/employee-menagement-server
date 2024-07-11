const { generateAdminToken } = require("../confiq/adminToken");
const db = require("../confiq/db");
const bcrypt = require("bcrypt");

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        error: "Please provide your credentials",
      });
    }

    const [results] = await db.query(
      `SELECT * FROM employeesAdmin WHERE email=?`,
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const admin = results[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    const isMatch = await bcrypt.compare(admin?.password, hashedPassword);

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const token = generateAdminToken(admin);
    const { password: pwd, ...adminWithoutPassword } = admin;
    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
        admin: adminWithoutPassword,
        token,
      },
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Admin Login Unseccess",
      error: error.message,
    });
  }
};

exports.updateAdminPassword = async (req, res) => {
  try {
    const adminID = req.params.id;
    if (!adminID) {
      return res.status(404).send({
        success: false,
        message: "Invalid id or missing admin id",
      });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(404).send({
        success: false,
        message: "Please Provide a new Password",
      });
    }
    const data = await db.query(
      `UPDATE employeesAdmin SET password=? WHERE id =? `,
      [password, adminID]
    );
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in update admin password",
      });
    }
    res.status(200).send({
      success: true,
      message: "Admin Password updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update admin password",
      error,
    });
  }
};

exports.getMeAdmin = async (req, res) => {
  try {
    const decodedadmin = req?.decodedadmin?.email;
    const result = await db.query(
      `SELECT * FROM employeesAdmin WHERE email=?`,
      [decodedadmin]
    );

    res.status(200).json({
      success: true,
      admin: result[0],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
