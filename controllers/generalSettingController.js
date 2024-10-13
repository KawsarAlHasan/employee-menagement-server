const db = require("../confiq/db");

exports.getGeneralSetting = async (req, res) => {
  try {
    const busn_id = req.businessId;
    const [result] = await db.query(
      "SELECT * FROM general_setting WHERE busn_id = ?",
      [busn_id]
    );

    if (!result || result.length === 0) {
      return res.status(201).send({
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

// get 100% tax check
exports.hundredPerTax = async (req, res) => {
  try {
    const busn_id = req.businessId;
    const [result] = await db.query(
      "SELECT status FROM taxt_status WHERE busn_id = ?",
      [busn_id]
    );

    if (!result || result.length === 0) {
      return res.status(201).send({
        success: true,
        message: "No Tax found",
        result: result[0],
      });
    }

    res.status(200).send({
      success: true,
      message: "Your Tax Status",
      result: result[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Getting Tax",
      error: error.message,
    });
  }
};

// create and update
exports.hundredPerTaxUpdate = async (req, res) => {
  try {
    const { status } = req.query;
    const busn_id = req.businessId;

    // Fetch the current value of `hundredPer`
    const [rows] = await db.query(
      "SELECT status FROM taxt_status WHERE busn_id = ?",
      [busn_id]
    );

    // Update the value in the database
    await db.query("UPDATE taxt_status SET status = ? WHERE busn_id = ?", [
      status,
      busn_id,
    ]);

    res.status(200).send({
      success: true,
      message: `100% Tax has been updated to ${status}`,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in updating Tax",
      error: error.message,
    });
  }
};

exports.businessSummary = async (req, res) => {
  const { month, year, day } = req.query;

  const currentDate = new Date();
  const monthNumber = currentDate.getMonth() + 1;
  const yearNumber = currentDate.getFullYear();

  let monthNum = month;
  if (!month) {
    monthNum = monthNumber;
  }

  let yearNum = year;
  if (!year) {
    yearNum = yearNumber;
  }

  const startDate = new Date(yearNum, monthNum - 1, 1);
  const endDate = day
    ? new Date(yearNum, monthNum - 1, day, 23, 59, 59)
    : new Date(yearNum, monthNum, 0, 23, 59, 59);
  try {
    const busn_id = req.businessId;

    const [sales] = await db.query(
      "SELECT * FROM sales WHERE date >= ? AND date <= ? AND busn_id = ?",
      [startDate, endDate, busn_id]
    );

    const onlineSalesQuery =
      "SELECT amount FROM onlineSales WHERE sales_id = ?";

    const salesWithOnlineSales = await Promise.all(
      sales.map(async (sale) => {
        const [onlineSalesResults] = await db.query(onlineSalesQuery, [
          sale.id,
        ]);
        return { ...sale, onlineSales: onlineSalesResults };
      })
    );

    let totalTax = 0;
    let totalSales = 0;
    let onlineSalesAmount = 0;
    let totalSoOvAmount = 0;
    salesWithOnlineSales.forEach((entry) => {
      const totalIncome =
        parseFloat(entry.totalCashCollect) + parseFloat(entry.craditeSales);
      totalSales += totalIncome;
      onlineSalesAmount += entry?.onlineSales?.reduce(
        (total, sale) => total + parseFloat(sale?.amount),
        0
      );
      totalTax += entry.tax;
      totalSoOvAmount += parseFloat(entry.so_ov);
    });

    const [salaries] = await db.query(
      "SELECT amount FROM salaries WHERE date >= ? AND date <= ? AND busn_id = ?",
      [startDate, endDate, busn_id]
    );

    let totalSalariesAmount = 0;
    salaries.forEach((entry) => {
      totalSalariesAmount += parseFloat(entry.amount);
    });

    const [costings] = await db.query(
      "SELECT amount FROM costings WHERE date >= ? AND date <= ? AND busn_id = ?",
      [startDate, endDate, busn_id]
    );

    let totalCostingsAmount = 0;
    costings.forEach((entry) => {
      totalCostingsAmount += parseFloat(entry.amount);
    });

    // start food cost
    const [foodCostResult] = await db.query(
      "SELECT id FROM food_costs WHERE date >= ? AND date <= ? AND busn_id = ?",
      [startDate, endDate, busn_id]
    );
    const vendorsQuery = "SELECT * FROM vendors WHERE food_cost_id = ?";
    const foodCostWithVendors = await Promise.all(
      foodCostResult.map(async (cost) => {
        const [dataResults] = await db.query(vendorsQuery, [cost.id]);
        return { ...cost, data: dataResults };
      })
    );

    let totalFoodCostAmount = 0;
    foodCostWithVendors.forEach((entry) => {
      const totalFoodCosts = entry?.data?.reduce(
        (total, cost) => total + parseFloat(cost?.vendor_amount),
        0
      );

      totalFoodCostAmount += totalFoodCosts;
    });
    // end food cost

    const totalCradit = totalSales + onlineSalesAmount;
    const totalDabit =
      totalCostingsAmount + totalFoodCostAmount + totalSalariesAmount;

    const difference = totalCradit - totalDabit;

    let totalProfit = 0;
    let totalLoss = 0;
    let netIncome = 0;

    if (difference >= 0) {
      totalProfit = difference;
      netIncome = difference;
    } else if (difference <= 0) {
      totalLoss = -difference;
      netIncome = difference;
    }

    res.status(200).send({
      success: true,
      message: `Get Business Summary`,
      totalSales,
      toatlOnlineSales: onlineSalesAmount,
      totalTax,
      totalSalary: totalSalariesAmount,
      foodCost: totalFoodCostAmount,
      othersCost: totalCostingsAmount,
      shortOver: totalSoOvAmount,
      totalDabit,
      totalCradit,
      totalProfit,
      totalLoss,
      netIncome: difference,
      costing: {
        totalCostingsAmount,
        costings,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting Business Summary",
      error: error.message,
    });
  }
};
