const db = require("../confiq/db");

exports.getLossAndProfit = async (req, res) => {
  try {
    const { month, year, day } = req.query;

    // Validate the input parameters
    if (!month || !year) {
      return res.status(400).send({
        success: false,
        message: "Month and year are required",
      });
    }

    // Set start date to the first day of the month
    const startDate = new Date(year, month - 1, 1);

    // If day is provided, set end date to the specified day of the month, otherwise set it to the last day of the month
    const endDate = day
      ? new Date(year, month - 1, day, 23, 59, 59)
      : new Date(year, month, 0, 23, 59, 59);

    const busn_id = req.businessId;

    const [sales] = await db.query(
      "SELECT * FROM sales WHERE date >= ? AND date <= ? AND busn_id = ?",
      [startDate, endDate, busn_id]
    );

    let totalSalesRegister = 0;
    let totalCreditSales = 0;
    let totalAdditionalIncome = 0;
    sales.forEach((entry) => {
      totalSalesRegister += parseFloat(entry.salesRegister);
      totalCreditSales += parseFloat(entry.craditeSales);
      totalAdditionalIncome += parseFloat(entry.additional_income);
    });

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
      totalSalesRegister,
      totalCreditSales,
      totalSales,
      totalAdditionalIncome,
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
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in API Server",
      error: error.message,
    });
  }
};
