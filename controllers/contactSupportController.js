const db = require("../confiq/db");

// create support
exports.createSupport = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).send({
        success: false,
        message: "email and phone are required",
      });
    }

    const query = "INSERT INTO contact_support (email, phone) VALUES (?, ?)";
    const values = [email, phone];

    const [data] = await db.query(query, values);

    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

    res.status(200).send({
      success: true,
      message: "Support created successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in creating Support API",
      error: error.message,
    });
  }
};

// get Support
exports.getSupport = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM contact_support");

    if (!result || result.length === 0) {
      return res.status(201).send({
        success: true,
        message: "No Support found",
        result: result[0],
      });
    }

    res.status(200).send({
      success: true,
      message: "Get support",
      data: result[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in support",
      error: error.message,
    });
  }
};

// Update contact support
exports.updateContactSupport = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return res.status(500).send({
        success: false,
        message: `Please provide email and phone`,
      });
    }

    const id = 1;

    await db.query(
      `UPDATE contact_support SET email=?, phone= ? WHERE id = ?`,
      [email, phone, id]
    );

    res.status(201).json({
      success: true,
      message: "contact support updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in contact support",
      error: error?.message,
    });
  }
};
