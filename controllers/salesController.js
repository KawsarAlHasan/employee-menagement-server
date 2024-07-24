const db = require("../confiq/db");

// get all sales
exports.getAllSales = async (req, res) => {
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

    const [data] = await db.query(
      "SELECT * FROM sales WHERE date >= ? AND date <= ?",
      [startDate, endDate]
    );
    if (!data || data.length == 0) {
      return res.status(404).send({
        success: false,
        message: "No sales found",
      });
    }

    const onlineSalesQuery = "SELECT * FROM onlineSales WHERE sales_id = ?";

    const salesWithOnlineSales = await Promise.all(
      data.map(async (sale) => {
        const [onlineSalesResults] = await db.query(onlineSalesQuery, [
          sale.id,
        ]);
        return { ...sale, onlineSales: onlineSalesResults };
      })
    );

    let totalSalesAmount = 0;
    salesWithOnlineSales.forEach((entry) => {
      const totalSales =
        entry.totalCashCollect +
        entry.craditeSales +
        entry?.onlineSales?.reduce((total, sale) => total + sale?.amount, 0);

      totalSalesAmount += totalSales;
    });

    res.status(200).send({
      success: true,
      message: "All sales",
      totalSales: salesWithOnlineSales.length,
      totalSalesAmount,
      data: salesWithOnlineSales,
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

    const salesQuery = `SELECT * FROM sales WHERE id=?`;
    const [sales] = await db.query(salesQuery, [salesID]);

    if (!sales || sales.length == 0) {
      return res.status(404).send({
        success: false,
        message: "No sales found",
      });
    }

    const onlineSalesQuery = `SELECT name, amount FROM onlineSales WHERE sales_id = ?`;
    const onlineSalesData = await db.query(onlineSalesQuery, [salesID]);

    const onlineData = onlineSalesData[0];

    sales.forEach((sale) => {
      sale.onlineSales = onlineData;
    });

    res.status(200).send(sales[0]);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send({
      success: false,
      message: "Error in getting sales",
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
      onlineSales,
      date,
    } = req.body;

    if (!date) {
      return res.status(500).send({
        success: false,
        message: `Please provide date fields`,
      });
    }

    const salesQuery =
      "INSERT INTO sales (salesRegister, totalCashCollect, craditeSales, so_ov, date) VALUES (?, ?, ?, ?, ?)";
    const salesValues = [
      salesRegister,
      totalCashCollect,
      craditeSales,
      so_ov,
      date,
    ];

    const [salesResult] = await db.query(salesQuery, salesValues);
    const salesId = salesResult.insertId;

    const onlineSalesQuery =
      "INSERT INTO onlineSales (sales_id, name, amount) VALUES ?";
    const onlineSalesValues = onlineSales.map((sale) => [
      salesId,
      sale.name,
      sale.amount,
    ]);

    await db.query(onlineSalesQuery, [onlineSalesValues]);

    res.status(201).send({
      success: true,
      message: "Sales record inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error inserting sales record",
      error: error.message,
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
    const { salesRegister, totalCashCollect, craditeSales, so_ov, date } =
      req.body;

    if (!date) {
      return res.status(500).send({
        success: false,
        message: `Please provide date fields`,
      });
    }

    const data = await db.query(
      `UPDATE sales SET salesRegister=?, totalCashCollect=?, craditeSales=?, so_ov=?, date=? WHERE id =? `,
      [salesRegister, totalCashCollect, craditeSales, so_ov, date, salesID]
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
        message: "sales Id is required",
      });
    }

    await db.query(`DELETE FROM onlineSales WHERE sales_id=?`, [salesId]);
    await db.query(`DELETE FROM sales WHERE id=?`, [salesId]);

    res.status(200).send({
      success: true,
      message: "sales Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete sales",
      error: error.message,
    });
  }
};
