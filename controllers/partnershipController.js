const db = require("../confiq/db");

// get all partners
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await db.query("SELECT * FROM partnership");
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
    if (!data || data.length === 0) {
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
    // Chack percentage
    const [rows] = await db.query(
      "SELECT SUM(percentage) as totalPercentage FROM partnership"
    );
    const totalPercentage = rows[0].totalPercentage || 0;

    // get me admin
    const decodedadmin = req?.decodedadmin?.email;
    const [adminResult] = await db.query(
      `SELECT name, email FROM employeesAdmin WHERE email=?`,
      [decodedadmin]
    );

    const adminName = adminResult[0].name;
    const adminEmail = adminResult[0].email;

    // admin add
    if (totalPercentage === 0) {
      await db.query(
        "INSERT INTO partnership (name, email, phone, percentage) VALUES (?, ?, ?, ?)",
        [adminName, adminEmail, "01", 100]
      );
    }

    // Reducing the percentage of Admin
    await db.query(
      "UPDATE partnership SET percentage = percentage - ? WHERE email = ?",
      [percentage, adminEmail]
    );

    // add new partner
    await db.query(
      "INSERT INTO partnership ( name, email, phone, percentage) VALUES (?, ?, ?, ?)",
      [name, email, phone, percentage]
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
      `SELECT percentage FROM partnership WHERE id = ?`,
      [partnerID]
    );

    if (getPartnerdata.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Partner not found",
      });
    }

    // Get admin data
    const decodedadmin = req?.decodedadmin?.email;
    const [adminResult] = await db.query(
      `SELECT email FROM employeesAdmin WHERE email = ?`,
      [decodedadmin]
    );

    if (adminResult.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    const prePartnerPercentage = getPartnerdata[0].percentage;
    const difference = percentage - prePartnerPercentage;
    const adminEmail = adminResult[0].email;

    // Update partner data
    const [updateResult] = await db.query(
      `UPDATE partnership SET name = ?, email = ?, phone = ?, percentage = ? WHERE id = ?`,
      [name, email, phone, percentage, partnerID]
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
        "UPDATE partnership SET percentage = percentage - ? WHERE email = ?",
        [difference, adminEmail]
      );
    } else if (difference < 0) {
      await db.query(
        "UPDATE partnership SET percentage = percentage + ? WHERE email = ?",
        [-difference, adminEmail]
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
    res.send("Partner Delete Upcomming");
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in deleting Partner",
      error: error?.message,
    });
  }
};
