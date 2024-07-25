const db = require("../confiq/db");

// get all Costings
exports.getAllCostings = async (req, res) => {
  try {
    const { month, year, day } = req.query;

    if (!month || !year) {
      return res.status(400).send({
        success: false,
        message: "Month and year are required",
      });
    }

    const startDate = new Date(year, month - 1, 1);

    const endDate = day
      ? new Date(year, month - 1, day, 23, 59, 59)
      : new Date(year, month, 0, 23, 59, 59);

    const data = await db.query(
      "SELECT * FROM costings WHERE date >= ? AND date <= ?",
      [startDate, endDate]
    );
    if (!data) {
      return res.status(404).send({
        success: false,
        message: "No Costings found",
      });
    }

    let totalCostingsAmount = 0;
    data[0].forEach((entry) => {
      totalCostingsAmount += entry.amount;
    });

    res.status(200).send({
      success: true,
      message: "Get All Costings",
      totalCostings: data[0].length,
      totalCostingsAmount,
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Getting All Costings",
      error: error.message,
    });
  }
};

// get DRplatform
exports.getAllDRplatform = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT DRplatform FROM costings GROUP BY DRplatform`
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting DR Platform",
      error: error.message,
    });
  }
};

// get single Costing by id
exports.getSingleCosting = async (req, res) => {
  try {
    const costingID = req.params.id;
    if (!costingID) {
      return res.status(404).send({
        success: false,
        message: "costingID is required",
      });
    }
    const data = await db.query(`SELECT * FROM costings WHERE id=?`, [
      costingID,
    ]);
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No Costing found",
      });
    }
    const costing = data[0];
    res.status(200).send(costing[0]);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting costing",
      error,
    });
  }
};

// // create Costing
exports.createCosting = async (req, res) => {
  try {
    const { DRplatform, amount, date } = req.body;
    if (!DRplatform || !amount || !date) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    const data = await db.query(
      `INSERT INTO costings (DRplatform, amount, date) VALUES (?, ?, ?)`,
      [DRplatform, amount, date]
    );

    if (!data) {
      return res.status(404).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

    res.status(200).send({
      success: true,
      message: "costings created successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Creatting costings API",
      error,
    });
  }
};

// // update costing
exports.updateCosting = async (req, res) => {
  try {
    const costingId = req.params.id;
    if (!costingId) {
      return res.status(404).send({
        success: false,
        message: "costingId is required",
      });
    }

    const { DRplatform, amount, date } = req.body;

    const data = await db.query(
      `UPDATE costings SET DRplatform=?, amount=?, date=? WHERE id =? `,
      [DRplatform, amount, date, costingId]
    );
    if (!data) {
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

// // delete costing
exports.deleteCosting = async (req, res) => {
  try {
    const costingID = req.params.id;
    if (!costingID) {
      return res.status(404).send({
        success: false,
        message: "costingID is required",
      });
    }

    await db.query(`DELETE FROM costings WHERE id=?`, [costingID]);
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
