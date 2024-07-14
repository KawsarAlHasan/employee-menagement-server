const db = require("../confiq/db");

// get all sales
exports.getAllSales = async (req, res) => {
  try {
    const data = await db.query("SELECT * FROM sales");
    if (!data) {
      return res.status(404).send({
        success: false,
        message: "No sales found",
      });
    }
    res.status(200).send({
      success: true,
      message: "All sales",
      totalSales: data[0].length,
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All sales",
      error,
    });
  }
};

// get single sales by id
exports.getSingleSales = async (req, res) => {
  try {
    const salesID = req.params.id;
    if (!salesID) {
      return res.status(404).send({
        success: false,
        message: "salesID is required",
      });
    }
    const data = await db.query(`SELECT * FROM sales WHERE id=?`, [salesID]);
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No sales found",
      });
    }
    const sales = data[0];
    res.status(200).send(sales[0]);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting sales",
      error,
    });
  }
};

// create sales
exports.createsales = async (req, res) => {
  try {
    const {
      salesRegister,
      totalCashCollect,
      craditeSales,
      so_ov,
      doordash,
      uber,
      foodPanda,
      date,
    } = req.body;
    // if (!salesRegister || !totalCashCollect || !craditeSales || !so_ov) {
    //   return res.status(500).send({
    //     success: false,
    //     message: "Please provide all fields",
    //   });
    // }

    const data = await db.query(
      `INSERT INTO sales (salesRegister, totalCashCollect, craditeSales, so_ov, doordash, uber, foodPanda, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        salesRegister,
        totalCashCollect,
        craditeSales,
        so_ov,
        doordash,
        uber,
        foodPanda,
        date,
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
      message: "sales created successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Create sales API",
      error,
    });
  }
};

// update sales
exports.updatesales = async (req, res) => {
  try {
    const salesID = req.params.id;
    if (!salesID) {
      return res.status(404).send({
        success: false,
        message: "salesID is required",
      });
    }
    const {
      salesRegister,
      totalCashCollect,
      craditeSales,
      so_ov,
      doordash,
      uber,
      foodPanda,
      date,
    } = req.body;

    const data = await db.query(
      `UPDATE sales SET salesRegister=?, totalCashCollect=?, craditeSales=?, so_ov=?, doordash=?, uber=?, foodPanda=?, date=? WHERE id =? `,
      [
        salesRegister,
        totalCashCollect,
        craditeSales,
        so_ov,
        doordash,
        uber,
        foodPanda,
        date,
        salesID,
      ]
    );
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in update sales ",
      });
    }
    res.status(200).send({
      success: true,
      message: "sales updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update sales ",
      error,
    });
  }
};

// delete sales
exports.deletesales = async (req, res) => {
  try {
    const salesId = req.params.id;
    if (!salesId) {
      return res.status(404).send({
        success: false,
        message: "salesId is required",
      });
    }

    await db.query(`DELETE FROM sales WHERE id=?`, [salesId]);
    res.status(200).send({
      success: true,
      message: "sales Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete sales",
      error,
    });
  }
};
