const db = require("../confiq/db");
const { sendMail } = require("../middleware/sandEmail");
const bcrypt = require("bcrypt");
const moment = require("moment");

// get all partners
exports.getAllPartners = async (req, res) => {
  try {
    const busn_id = req.businessId;
    const partners = await db.query(
      "SELECT * FROM partnership WHERE busn_id = ?",
      [busn_id]
    );
    if (!partners || partners.length == 0) {
      return res.status(200).send({
        success: false,
        message: "No Partners found",
        data: partners[0],
      });
    }

    res.status(200).send({
      success: true,
      message: "All Partners",
      totalPartners: partners[0].length,
      data: partners[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Partners ",
      error: error.message,
    });
  }
};

// single partner by id
exports.getSinglePartner = async (req, res) => {
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

    const partnerID = req.params.id;
    if (!partnerID) {
      return res.status(404).send({
        success: false,
        message: "partnerID is required",
      });
    }
    const [data] = await db.query(`SELECT * FROM partnership WHERE id=?`, [
      partnerID,
    ]);
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No partner found",
      });
    }

    const partnerPercentage = data[0].percentage / 100;
    const partnerProfit = totalProfit * partnerPercentage;
    const partnerLoss = totalLoss * partnerPercentage;
    const partnerNetIncome = netIncome * partnerPercentage;

    const partnerInfo = {
      ...data[0],
      partnerProfit,
      partnerLoss,
      partnerNetIncome,
    };

    const wholeBusiness = {
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
    };

    const partner = data[0];
    res.status(200).send({
      success: true,
      partnerInfo,
      wholeBusiness,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting partner",
      error,
    });
  }
};

// add a new partner
exports.addPartner = async (req, res) => {
  const { name, email, password, phone, percentage } = req.body;
  try {
    const { business_id, business_name, business_address } =
      req.decodedemployee;

    // Chack percentage
    const [rows] = await db.query(
      "SELECT SUM(percentage) as totalPercentage FROM partnership WHERE busn_id = ?",
      [business_id]
    );
    const totalPercentage = rows[0].totalPercentage || 0;

    const adminName = req.decodedemployee.name;
    const adminEmail = req.decodedemployee.email;
    const adminPhone = req.decodedemployee.phone;

    // admin add
    if (totalPercentage === 0) {
      await db.query(
        "INSERT INTO partnership (name, email, phone, percentage, busn_id) VALUES (?, ?, ?, ?, ?)",
        [adminName, adminEmail, adminPhone, 100, business_id]
      );
    }

    // Reducing the percentage of Admin
    await db.query(
      "UPDATE partnership SET percentage = percentage - ? WHERE email = ? AND busn_id =?",
      [percentage, adminEmail, business_id]
    );

    // add new partner
    await db.query(
      "INSERT INTO partnership ( name, email, phone, percentage, busn_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, percentage, business_id]
    );

    const type = "Partner";

    const hashedPassword = await bcrypt.hash(password, 10);

    const [partner] = await db.query(
      `INSERT INTO employees (business_id, business_name, business_address, name, email, password, phone, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        business_id,
        business_name,
        business_address,
        name,
        email,
        hashedPassword,
        phone,
        type,
      ]
    );

    if (partner.insertId) {
      const emailData = {
        business_name,
        business_address,
        percentage,
        name,
        email,
        password,
        phone,
        type,
      };
      const emailResult = await sendMail(emailData);
      if (!emailResult.messageId) {
        res.status(500).send("Failed to send email");
      }
    }

    res.status(201).json({
      success: true,
      message: "Partner added successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Partner
exports.updatePartner = async (req, res) => {
  try {
    const busn_id = req.businessId;
    const { name, email, phone, percentage } = req.body;
    const partnerID = req.params.id;

    if (!partnerID) {
      return res.status(404).send({
        success: false,
        message: "partnerID is required",
      });
    }

    // Get current partner data
    const [getPartnerdata] = await db.query(
      `SELECT percentage FROM partnership WHERE id = ? AND busn_id =?`,
      [partnerID, busn_id]
    );

    if (getPartnerdata.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Partner not found",
      });
    }

    // Get admin data
    const [data] = await db.query("SELECT * FROM employees WHERE busn_id = ?", [
      busn_id,
    ]);
    const [filteredAdmin] = data.filter(
      (employee) => employee.type.toLowerCase() == "admin"
    );

    const prePartnerPercentage = getPartnerdata[0].percentage;
    const difference = percentage - prePartnerPercentage;
    const adminEmail = filteredAdmin.email;

    // Update partner data
    const [updateResult] = await db.query(
      `UPDATE partnership SET name = ?, email = ?, phone = ?, percentage = ? WHERE id = ? AND busn_id=?`,
      [name, email, phone, percentage, partnerID, busn_id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Error in updating Partnership",
      });
    }

    // Update admin percentage
    if (difference > 0) {
      await db.query(
        "UPDATE partnership SET percentage = percentage - ? WHERE email = ? AND busn_id =?",
        [difference, adminEmail, busn_id]
      );
    } else if (difference < 0) {
      await db.query(
        "UPDATE partnership SET percentage = percentage + ? WHERE email = ? AND busn_id=?",
        [-difference, adminEmail, busn_id]
      );
    }

    res.status(201).json({
      success: true,
      message: "Partner updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in updating Partner",
      error: error?.message,
    });
  }
};

// delete partner
exports.deletePartner = async (req, res) => {
  try {
    const busn_id = req.decodedemployee.business_id;
    const partnerId = req.params.id;
    if (!partnerId) {
      return res.status(404).send({
        success: false,
        message: "partnerId is required",
      });
    }

    const [partnerPercentage] = await db.query(
      `SELECT * FROM partnership WHERE id=?`,
      [partnerId]
    );

    if (!partnerPercentage || partnerPercentage.length == 0) {
      return res.status(200).send({
        success: false,
        message: "No Partners found",
      });
    }

    const partnerPer = partnerPercentage[0].percentage;
    const partnerEmail = partnerPercentage[0].percentage;

    const [data] = await db.query(
      "SELECT * FROM employees WHERE business_id=?",
      [busn_id]
    );
    const [filteredAdmin] = data.filter(
      (employee) => employee.type.toLowerCase() == "admin"
    );

    const adminEmail = filteredAdmin.email;

    await db.query(
      "UPDATE partnership SET percentage = percentage + ? WHERE email = ?",
      [partnerPer, adminEmail]
    );

    await db.query(`DELETE FROM partnership WHERE id=?`, [partnerId]);

    await db.query(`DELETE FROM employees WHERE email=?`, [partnerEmail]);

    res.status(200).send({
      success: true,
      message: "Partner Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in deleting Partner",
      error: error?.message,
    });
  }
};
