const db = require("../confiq/db");

// get
exports.getOnlineSalesPlatform = async (req, res) => {
  try {
    const busn_id = req.businessId;
    const [result] = await db.query(
      "SELECT * FROM online_sales_platforms WHERE busn_id = ?",
      [busn_id]
    );

    if (!result || result.length === 0) {
      return res.status(201).send({
        success: true,
        message: "No Online platform name found",
        data: result,
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Online platform name",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Getting Online platform name",
      error: error.message,
    });
  }
};

// create
exports.createOnlineSalesPlatform = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(500).send({
        success: false,
        message: `Please provide name`,
      });
    }

    const busn_id = req.businessId;

    const query =
      "INSERT INTO online_sales_platforms (busn_id, name) VALUES (?, ?)";
    const values = [busn_id, name];

    await db.query(query, values);

    res.status(201).send({
      success: true,
      message: "Online sales platform inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error inserting Online sales platform",
      error: error.message,
    });
  }
};

// Update
exports.updateOnlineSalesPlatform = async (req, res) => {
  try {
    const { name } = req.body;
    const platformID = req.params.id;

    if (!platformID) {
      return res.status(404).send({
        success: false,
        message: "platformID is required",
      });
    }

    if (!name) {
      return res.status(500).send({
        success: false,
        message: `Please provide name`,
      });
    }

    await db.query(`UPDATE online_sales_platforms SET name= ? WHERE id = ?`, [
      name,
      platformID,
    ]);

    res.status(201).json({
      success: true,
      message: "Online Platform Name updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in updating Online Platform Name",
      error: error?.message,
    });
  }
};

// delete
exports.deleteOnlineSalesPlatform = async (req, res) => {
  try {
    const platformID = req.params.id;
    if (!platformID) {
      return res.status(404).send({
        success: false,
        message: "platformID is required",
      });
    }

    await db.query(`DELETE FROM online_sales_platforms WHERE id=?`, [
      platformID,
    ]);

    res.status(200).send({
      success: true,
      message: "platformID Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete platformID",
      error: error.message,
    });
  }
};

// get all online sales
exports.getAllOnlineSales = async (req, res) => {
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
      "SELECT id FROM sales WHERE date >= ? AND date <= ? AND busn_id = ? ORDER BY id DESC",
      [startDate, endDate, busn_id]
    );

    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No sales found",
        data: [],
      });
    }

    const onlineSalesQuery = "SELECT * FROM onlineSales WHERE sales_id = ?";

    const onlineSalesTotals = {};

    await Promise.all(
      data.map(async (sale) => {
        const [onlineSalesResults] = await db.query(onlineSalesQuery, [
          sale.id,
        ]);

        onlineSalesResults.forEach((onlineSale) => {
          if (onlineSalesTotals[onlineSale.name]) {
            onlineSalesTotals[onlineSale.name] += parseFloat(onlineSale.amount);
          } else {
            onlineSalesTotals[onlineSale.name] = parseFloat(onlineSale.amount);
          }
        });
      })
    );

    const groupedSales = Object.keys(onlineSalesTotals).map((name) => ({
      name,
      amount: onlineSalesTotals[name].toFixed(2),
    }));

    // Calculate the total online sales amount
    const totalOnlineSales = Object.values(onlineSalesTotals)
      .reduce((acc, amount) => acc + amount, 0)
      .toFixed(2);

    res.status(200).send({
      success: true,
      message: "All online sales",
      totalOnlineSales, // Total sales amount included here
      data: groupedSales,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All online sales",
      error: error.message,
    });
  }
};
