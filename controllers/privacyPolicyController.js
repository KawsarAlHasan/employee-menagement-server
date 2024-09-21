const db = require("../confiq/db");

// create privacy policy
exports.createPrivacyPolicy = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(500).send({
        success: false,
        message: `Please provide title and message`,
      });
    }

    const busn_id = req.businessId;

    const [checkData] = await db.query(
      "SELECT * FROM privacy_policy WHERE busn_id = ?",
      [busn_id]
    );

    if (checkData && checkData.length !== 0) {
      return res.status(500).send({
        success: false,
        message:
          "You have already added privacy policy. You can Edit or Delete privacy policy",
      });
    }

    const query =
      "INSERT INTO privacy_policy (title, message, busn_id) VALUES (?, ?, ?)";
    const values = [title, message, busn_id];

    await db.query(query, values);

    res.status(201).send({
      success: true,
      message: "Terms and conditions inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error inserting privacy policy",
      error: error.message,
    });
  }
};

// get privacy policy
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const busn_id = req.businessId;
    const [result] = await db.query(
      "SELECT * FROM privacy_policy WHERE busn_id = ?",
      [busn_id]
    );

    if (!result || result.length === 0) {
      return res.status(201).send({
        success: true,
        message: "No privacy policy found",
        result: result[0],
      });
    }

    res.status(200).send({
      success: true,
      message: "Get privacy policy",
      data: result[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in privacy policy",
      error: error.message,
    });
  }
};

// Update privacy policy
exports.updatePrivacyPolicy = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(500).send({
        success: false,
        message: `Please provide title and message`,
      });
    }

    const busn_id = req.businessId;

    await db.query(
      `UPDATE privacy_policy SET title=?, message= ? WHERE busn_id = ?`,
      [title, message, busn_id]
    );

    res.status(201).json({
      success: true,
      message: "privacy policy updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in privacy policy",
      error: error?.message,
    });
  }
};

// delete privacy policy
exports.deletePrivacyPolicy = async (req, res) => {
  try {
    const busn_id = req.businessId;

    await db.query(`DELETE FROM privacy_policy WHERE busn_id=?`, [busn_id]);

    res.status(200).send({
      success: true,
      message: "privacy policy Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete privacy policy",
      error: error.message,
    });
  }
};
