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

    const [sales] = await db.query(
      "SELECT * FROM sales WHERE date >= ? AND date <= ?",
      [startDate, endDate]
    );

    let totalSalesAmount = 0;
    let onlineSalesAmount = 0;
    let TotalSoOvAmount = 0;
    sales.forEach((entry) => {
      const totalIncome = entry.totalCashCollect + entry.craditeSales;

      const totalOnline = entry.doordash + entry.uber + entry.foodPanda;

      totalSalesAmount += totalIncome;
      onlineSalesAmount += totalOnline;
      TotalSoOvAmount += entry.so_ov;
    });

    const [salaries] = await db.query(
      "SELECT amount FROM salaries WHERE date >= ? AND date <= ?",
      [startDate, endDate]
    );

    let totalSalariesAmount = 0;
    salaries.forEach((entry) => {
      totalSalariesAmount += entry.amount;
    });

    const [costings] = await db.query(
      "SELECT amount FROM costings WHERE date >= ? AND date <= ?",
      [startDate, endDate]
    );

    let totalCostingsAmount = 0;
    costings.forEach((entry) => {
      totalCostingsAmount += entry.amount;
    });

    const totalDabit = totalSalesAmount + onlineSalesAmount;
    const totalCradit = totalCostingsAmount + totalSalariesAmount;

    const difference = totalDabit - totalCradit;

    if (difference >= 0) {
      res.status(200).send({
        success: true,
        totalSalesAmount,
        onlineSalesAmount,
        totalCostingsAmount,
        totalSalariesAmount,
        totalCradit,
        totalDabit,
        profit: difference,
      });
    } else if (difference < 0) {
      res.status(200).send({
        success: true,
        totalSalesAmount,
        onlineSalesAmount,
        totalCostingsAmount,
        totalSalariesAmount,
        lossAmount: -difference,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in API Server",
      error,
    });
  }
};
