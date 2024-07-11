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

// add a new partner
// exports.addPartner = async (req, res) => {
//   const { name, email, phone, percentage } = req.body;

//   try {
//     const [rows] = await db.query(
//       "SELECT SUM(percentage) as totalPercentage FROM partnership"
//     );
//     let totalPercentage = rows[0].totalPercentage;

//     if (totalPercentage + percentage > 100) {
//       return res
//         .status(400)
//         .json({ error: "Total partnership percentage cannot exceed 100%" });
//     }

//     // Reduce the admin's percentage
//     const [admin] = await db.query(
//       "SELECT * FROM partnership WHERE name = ?",
//       ["admin"]
//     );
//     if (admin.length > 0) {
//       const adminPercentage = admin[0].percentage;
//       const newAdminPercentage = adminPercentage - percentage;
//       await db.query("UPDATE partnership SET percentage = ? WHERE name = ?", [
//         newAdminPercentage,
//         "admin",
//       ]);
//     }

//     // Add the new partner
//     await db.query(
//       "INSERT INTO partnership (name, percentage) VALUES (?, ?)",
//       [name, percentage]
//     );
//     res.status(201).json({ message: "Partner added successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.addPartner = async (req, res) => {
  const { name, email, phone, percentage } = req.body;

  try {
    // Chack percentage
    const [rows] = await db.query(
      "SELECT SUM(percentage) as totalPercentage FROM partnership"
    );
    const totalPercentage = rows[0].totalPercentage || 0;

    // if (totalPercentage + parseFloat(percentage) > 100) {
    //   return res
    //     .status(400)
    //     .json({ message: "Total percentage cannot exceed 100%" });
    // }

    // admin add
    if (totalPercentage === 0) {
      await db.query(
        "INSERT INTO partnership (name, email, phone, percentage) VALUES (?, ?, ?, ?)",
        ["Admin", "admin@gmail.com", "0174647", 100]
      );
    }

    // Reducing the percentage of Admin
    await db.query(
      "UPDATE partnership SET percentage = percentage - ? WHERE email = ?",
      [percentage, "admin@gmail.com"]
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
