const db = require("../confiq/db");

exports.getGeneralSetting = async (req, res) => {
  try {
    const busn_id = req.businessId;
    const [result] = await db.query(
      "SELECT * FROM general_setting WHERE busn_id = ?",
      [busn_id]
    );

    if (!result || result.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No Tax found",
        result: result[0],
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Tax",
      data: result[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Getting Tax",
      error: error.message,
    });
  }
};

exports.createGeneralSetting = async (req, res) => {
  try {
    const { tax, state } = req.body;

    if (!tax || !state) {
      return res.status(500).send({
        success: false,
        message: `Please provide tax and state`,
      });
    }

    const busn_id = req.businessId;

    const [result] = await db.query(
      "SELECT * FROM general_setting WHERE busn_id = ?",
      [busn_id]
    );

    if (result && result.length !== 0) {
      return res.status(500).send({
        success: false,
        message: "You have already Tax. You can Edit or Delete Tax",
      });
    }

    const foodCostQuery =
      "INSERT INTO general_setting (tax, state, busn_id) VALUES (?, ?, ?)";
    const foodCostValues = [tax, state, busn_id];

    await db.query(foodCostQuery, foodCostValues);

    res.status(201).send({
      success: true,
      message: "Food cost record inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error inserting food cost record",
      error: error.message,
    });
  }
};

// Update tax
exports.updateGenarelSetting = async (req, res) => {
  try {
    const { tax, state } = req.body;
    const taxID = req.params.id;

    if (!taxID) {
      return res.status(404).send({
        success: false,
        message: "taxID is required",
      });
    }

    if (!tax || !state) {
      return res.status(500).send({
        success: false,
        message: `Please provide tax and state`,
      });
    }

    await db.query(`UPDATE general_setting SET tax=?, state= ? WHERE id = ?`, [
      tax,
      state,
      taxID,
    ]);

    res.status(201).json({
      success: true,
      message: "Tax updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in updating Tax",
      error: error?.message,
    });
  }
};

// delete Tax
exports.deleteGenarelSetting = async (req, res) => {
  try {
    const taxID = req.params.id;
    if (!taxID) {
      return res.status(404).send({
        success: false,
        message: "Tax Id is required",
      });
    }

    await db.query(`DELETE FROM general_setting WHERE id=?`, [taxID]);

    res.status(200).send({
      success: true,
      message: "Tax Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete Tax",
      error: error.message,
    });
  }
};
