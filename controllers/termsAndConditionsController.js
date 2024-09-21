const db = require("../confiq/db");

// create terms and conditions
exports.createTermsAndConditions = async (req, res) => {
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
      "SELECT * FROM terms_and_conditions WHERE busn_id = ?",
      [busn_id]
    );

    if (checkData && checkData.length !== 0) {
      return res.status(500).send({
        success: false,
        message:
          "You have already added Terms and conditions. You can Edit or Delete Terms and conditions",
      });
    }

    const query =
      "INSERT INTO terms_and_conditions (title, message, busn_id) VALUES (?, ?, ?)";
    const values = [title, message, busn_id];

    await db.query(query, values);

    res.status(201).send({
      success: true,
      message: "Terms and conditions inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error inserting Terms and conditions",
      error: error.message,
    });
  }
};

// get terms and contidtions
exports.getTermsAndConditions = async (req, res) => {
  try {
    const busn_id = req.businessId;
    const [result] = await db.query(
      "SELECT * FROM terms_and_conditions WHERE busn_id = ?",
      [busn_id]
    );

    if (!result || result.length === 0) {
      return res.status(201).send({
        success: true,
        message: "No terms and contidtions found",
        result: result[0],
      });
    }

    res.status(200).send({
      success: true,
      message: "Get terms and contidtions",
      data: result[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in terms and contidtions",
      error: error.message,
    });
  }
};

// Update terms & conditions
exports.updateTermsAndConditions = async (req, res) => {
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
      `UPDATE terms_and_conditions SET title=?, message= ? WHERE busn_id = ?`,
      [title, message, busn_id]
    );

    res.status(201).json({
      success: true,
      message: "Terms & Conditions updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Terms & Conditions",
      error: error?.message,
    });
  }
};

// delete terms & conditions
exports.deleteTermsAndConditions = async (req, res) => {
  try {
    const busn_id = req.businessId;

    await db.query(`DELETE FROM terms_and_conditions WHERE busn_id=?`, [
      busn_id,
    ]);

    res.status(200).send({
      success: true,
      message: "terms & conditions Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete terms & conditions",
      error: error.message,
    });
  }
};
