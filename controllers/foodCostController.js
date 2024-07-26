const db = require("../confiq/db");

// create food cost
exports.createFoodCost = async (req, res) => {
  try {
    const { name, data, date } = req.body;

    if (!name || !data || !date) {
      return res.status(500).send({
        success: false,
        message: `Please provide all fields`,
      });
    }

    const foodCostQuery = "INSERT INTO food_costs (name, date) VALUES (?, ?)";
    const foodCostValues = [name, date];

    const [foodCostResult] = await db.query(foodCostQuery, foodCostValues);
    const foodCostsId = foodCostResult.insertId;

    const dataQuery =
      "INSERT INTO vendors (food_cost_id, vendor_name, vendor_amount, pay_by, checkNo) VALUES ?";
    const dataValues = data.map((sale) => [
      foodCostsId,
      sale.vendor_name,
      sale.vendor_amount,
      sale.pay_by,
      sale.checkNo,
    ]);

    await db.query(dataQuery, [dataValues]);

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

// get all food cost
exports.getAllFoodCost = async (req, res) => {
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

    const [foodCostResult] = await db.query(
      "SELECT * FROM food_costs WHERE date >= ? AND date <= ? ORDER BY id DESC",
      [startDate, endDate]
    );
    if (!foodCostResult || foodCostResult.length == 0) {
      return res.status(404).send({
        success: false,
        message: "No food costs found",
      });
    }

    const vendorsQuery = "SELECT * FROM vendors WHERE food_cost_id = ?";

    const foodCostWithVendors = await Promise.all(
      foodCostResult.map(async (cost) => {
        const [dataResults] = await db.query(vendorsQuery, [cost.id]);
        return { ...cost, data: dataResults };
      })
    );

    let totalFoodCostAmount = 0;
    foodCostWithVendors.forEach((entry) => {
      const totalFoodCosting = entry?.data?.reduce(
        (total, cost) => total + cost?.vendor_amount,
        0
      );

      totalFoodCostAmount += totalFoodCosting;
    });

    res.status(200).send({
      success: true,
      message: "All Food Cost",
      totalFoodCost: foodCostWithVendors.length,
      totalFoodCostAmount,
      result: foodCostWithVendors,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Food Cost",
      error,
    });
  }
};

// update food cost
exports.updateFoodCost = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, data } = req.body;

    if (!id || !name || !date || !data) {
      return res.status(400).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    const foodCostUpdateQuery =
      "UPDATE food_costs SET name = ?, date = ? WHERE id = ?";
    const foodCostValues = [name, date, id];

    await db.query(foodCostUpdateQuery, foodCostValues);

    // Delete existing vendors for this food cost id
    const deleteVendorsQuery = "DELETE FROM vendors WHERE food_cost_id = ?";
    await db.query(deleteVendorsQuery, [id]);

    // Insert new vendors data
    const dataInsertQuery =
      "INSERT INTO vendors (food_cost_id, vendor_name, vendor_amount, pay_by, checkNo) VALUES ?";
    const dataValues = data.map((vendor) => [
      id,
      vendor.vendor_name,
      vendor.vendor_amount,
      vendor.pay_by || null,
      vendor.checkNo || null,
    ]);

    await db.query(dataInsertQuery, [dataValues]);

    res.status(200).send({
      success: true,
      message: "Food cost record updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating food cost record",
      error: error.message,
    });
  }
};

// delete food cost
exports.deleteFoodCost = async (req, res) => {
  try {
    const foodCostId = req.params.id;
    if (!foodCostId) {
      return res.status(404).send({
        success: false,
        message: "Food cost Id is required",
      });
    }

    await db.query(`DELETE FROM food_costs WHERE id=?`, [foodCostId]);

    res.status(200).send({
      success: true,
      message: "Food Cost Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete Food Cost",
      error: error.message,
    });
  }
};
