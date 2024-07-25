const db = require("../confiq/db");

// get all Costings
exports.getAllCostingsList = async (req, res) => {
  try {
    const decodedEmployee = req?.decodedemployee?.email;
    const [result] = await db.query(
      `SELECT business_id FROM employees WHERE email=?`,
      [decodedEmployee]
    );
    const busn_id = result[0]?.business_id;

    const [data] = await db.query("SELECT * FROM cost_list WHERE busn_id=?", [
      busn_id,
    ]);
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No cost list found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Get All cost list",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Getting All cost list",
      error: error.message,
    });
  }
};

// create costings
exports.createCostingList = async (req, res) => {
  try {
    const decodedEmployee = req?.decodedemployee?.email;
    const [result] = await db.query(
      `SELECT business_id FROM employees WHERE email=?`,
      [decodedEmployee]
    );
    const busn_id = result[0]?.business_id;

    const { name } = req.body;
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please provide name ",
      });
    }

    const [data] = await db.query(
      "INSERT INTO cost_list ( name, busn_id) VALUES (?, ?)",
      [name, busn_id]
    );

    if (!data || data.length === 0) {
      return res.status(500).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

    res.status(200).send({
      success: true,
      message: "Cost list created successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in creating Cost list",
      error: error.message,
    });
  }
};

// update costing list
exports.updateCostingList = async (req, res) => {
  try {
    const costingId = req.params.id;
    if (!costingId) {
      return res.status(404).send({
        success: false,
        message: "costingId is required",
      });
    }

    const decodedEmployee = req?.decodedemployee?.email;
    const [result] = await db.query(
      `SELECT business_id FROM employees WHERE email=?`,
      [decodedEmployee]
    );
    const busn_id = result[0]?.business_id;

    const { name } = req.body;

    const [data] = await db.query(
      `UPDATE costings SET name=? WHERE id =? AND busn_id=?`,
      [name, costingId, busn_id]
    );
    if (!data || data.length === 0) {
      return res.status(500).send({
        success: false,
        message: "Error in update costing ",
      });
    }
    res.status(200).send({
      success: true,
      message: "Costing updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Updatting costing ",
      error,
    });
  }
};

// delete cost list
exports.deleteCostList = async (req, res) => {
  try {
    const costingID = req.params.id;
    if (!costingID) {
      return res.status(404).send({
        success: false,
        message: "costingID is required",
      });
    }

    const decodedEmployee = req?.decodedemployee?.email;
    const [result] = await db.query(
      `SELECT business_id FROM employees WHERE email=?`,
      [decodedEmployee]
    );
    const busn_id = result[0]?.business_id;

    await db.query(`DELETE FROM cost_list WHERE id=? AND busn_id=?`, [
      costingID,
      busn_id,
    ]);
    res.status(200).send({
      success: true,
      message: "costing Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete costing",
      error,
    });
  }
};
