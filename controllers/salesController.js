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

    const busn_id = req.businessId;

    const [data] = await db.query(
      "SELECT * FROM sales WHERE date >= ? AND date <= ? AND busn_id = ? ORDER BY id DESC",
      [startDate, endDate, busn_id]
    );
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No sales found",
        data: data,
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

    //     const onlineSalesQuery2 = `
    //   SELECT name, SUM(CAST(amount AS DECIMAL(10,2))) AS total_sales
    //   FROM onlineSales
    //   WHERE sales_id = ?
    //   GROUP BY name;
    // `;

    // const salesWithOnlineSales2 = await Promise.all(
    //   data.map(async (sale) => {
    //     const [onlineSalesResults] = await db.query(onlineSalesQuery2, [sale.id]);
    //     // Assuming each sale has a unique name within the sales_id
    //     const onlineSale = onlineSalesResults.find(result => result.name === sale.name);
    //     return { ...sale, onlineSales: onlineSale ? onlineSale.total_sales : 0 };
    //   })
    // );

    // const salesWithOnlineSales2 = await Promise.all(
    //   data.map(async (sale) => {
    //     const [onlineSalesResults] = await db.query(onlineSalesQuery2, [
    //       sale.id,
    //     ]);
    //     return onlineSalesResults;
    //   })
    // );
    // res.send(salesWithOnlineSales2);

    let totalSalesAmount = 0;
    salesWithOnlineSales.forEach((entry) => {
      const totalSales =
        parseFloat(entry.totalCashCollect) +
        parseFloat(entry.craditeSales) +
        entry?.onlineSales?.reduce(
          (total, sale) => total + parseFloat(sale?.amount),
          0
        );

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
      tax,
    } = req.body;

    if (!date) {
      return res.status(500).send({
        success: false,
        message: `Please provide date fields`,
      });
    }

    const busn_id = req.businessId;

    const salesQuery =
      "INSERT INTO sales (salesRegister, totalCashCollect, craditeSales, so_ov, date, tax, busn_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const salesValues = [
      salesRegister,
      totalCashCollect,
      craditeSales,
      so_ov,
      date,
      tax,
      busn_id,
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
    const {
      salesRegister,
      totalCashCollect,
      craditeSales,
      so_ov,
      onlineSales,
      date,
      tax,
    } = req.body;

    if (!date) {
      return res.status(500).send({
        success: false,
        message: `Please provide date fields`,
      });
    }

    const salesUpdateQuery = `UPDATE sales SET salesRegister=?, totalCashCollect=?, craditeSales=?, so_ov=?, date=?, tax=? WHERE id =? `;
    const salesValues = [
      salesRegister,
      totalCashCollect,
      craditeSales,
      so_ov,
      date,
      tax,
      salesID,
    ];

    await db.query(salesUpdateQuery, salesValues);

    // Delete existing vendors for this food cost id
    const deleteOnlineSalesQuery = "DELETE FROM onlineSales WHERE sales_id = ?";
    await db.query(deleteOnlineSalesQuery, [salesID]);

    // Insert new onlineSales data

    const onlineSalesQuery =
      "INSERT INTO onlineSales (sales_id, name, amount) VALUES ?";

    const dataValues = onlineSales.map((sale) => [
      salesID,
      sale.name,
      sale.amount,
    ]);

    await db.query(onlineSalesQuery, [dataValues]);

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
