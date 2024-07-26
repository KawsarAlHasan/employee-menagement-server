const db = require("../confiq/db");

// get all partners
exports.getAllPartners = async (req, res) => {
  try {
    const busn_id = req.businessId;
    const partners = await db.query(
      "SELECT * FROM partnership WHERE busn_id = ?",
      [busn_id]
    );
    if (!partners) {
      return res.status(404).send({
        success: false,
        message: "No Partners found",
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
  try {
    const partnerID = req.params.id;
    if (!partnerID) {
      return res.status(404).send({
        success: false,
        message: "partnerID is required",
      });
    }
    const data = await db.query(`SELECT * FROM partnership WHERE id=?`, [
      partnerID,
    ]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).send({
        success: false,
        message: "No partner found",
      });
    }
    const partner = data[0];
    res.status(200).send(partner[0]);
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
  const { name, email, phone, percentage } = req.body;

  try {
    const busn_id = req.businessId;
    // Chack percentage
    const [rows] = await db.query(
      "SELECT SUM(percentage) as totalPercentage FROM partnership WHERE busn_id=?",
      [busn_id]
    );
    const totalPercentage = rows[0].totalPercentage || 0;

    const [data] = await db.query("SELECT * FROM employees WHERE busn_id =?", [
      busn_id,
    ]);
    const [filteredAdmin] = data.filter(
      (employee) => employee.type.toLowerCase() == "admin"
    );

    const adminName = filteredAdmin.name;
    const adminEmail = filteredAdmin.email;
    const adminPhone = filteredAdmin.phone;

    // admin add
    if (totalPercentage === 0) {
      await db.query(
        "INSERT INTO partnership (name, email, phone, percentage, busn_id) VALUES (?, ?, ?, ?, ?)",
        [adminName, adminEmail, adminPhone, 100, busn_id]
      );
    }

    // Reducing the percentage of Admin
    await db.query(
      "UPDATE partnership SET percentage = percentage - ? WHERE email = ? AND busn_id =?",
      [percentage, adminEmail, busn_id]
    );

    // add new partner
    await db.query(
      "INSERT INTO partnership ( name, email, phone, percentage, busn_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, percentage, busn_id]
    );

    res.status(201).json({
      success: true,
      message: "Partner added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
    const busn_id = req.businessId;
    const partnerId = req.params.id;
    if (!partnerId) {
      return res.status(404).send({
        success: false,
        message: "partnerId is required",
      });
    }

    const [partnerPercentage] = await db.query(
      `SELECT percentage FROM partnership WHERE id=?`,
      [partnerId]
    );

    const partnerPer = partnerPercentage[0].percentage;

    const [data] = await db.query("SELECT * FROM employees WHERE busn_id=?", [
      busn_id,
    ]);
    const [filteredAdmin] = data.filter(
      (employee) => employee.type.toLowerCase() == "admin"
    );

    const adminEmail = filteredAdmin.email;

    await db.query(
      "UPDATE partnership SET percentage = percentage + ? WHERE email = ?",
      [partnerPer, adminEmail]
    );

    await db.query(`DELETE FROM partnership WHERE id=?`, [partnerId]);

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
