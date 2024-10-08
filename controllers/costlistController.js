const db = require("../confiq/db");

// get all Costings
exports.getAllCostingsList = async (req, res) => {
  try {
    const busn_id = req.businessId;

    const [data] = await db.query(
      "SELECT * FROM cost_list WHERE busn_id=? ORDER BY id DESC",
      [busn_id]
    );
    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No cost list found",
        data: data,
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
    const busn_id = req.businessId;

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

    const busn_id = req.businessId;

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

    const busn_id = req.businessId;

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
