const db = require("../confiq/db");

// create
exports.createEmployeePosition = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(500).send({
        success: false,
        message: `Please provide name`,
      });
    }

    const busn_id = req.businessId;

    const query = "INSERT INTO employeePosition (busn_id, name) VALUES (?, ?)";
    const values = [busn_id, name];

    await db.query(query, values);

    res.status(201).send({
      success: true,
      message: "employee Position inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error inserting employee Position",
      error: error.message,
    });
  }
};

// get
exports.getEmployeePosition = async (req, res) => {
  try {
    const busn_id = req.businessId;
    const [result] = await db.query(
      "SELECT * FROM employeePosition WHERE busn_id = ?",
      [busn_id]
    );

    if (!result || result.length === 0) {
      return res.status(201).send({
        success: true,
        message: "No employee Position name found",
        data: result,
      });
    }

    res.status(200).send({
      success: true,
      message: "Get employee Position name",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Getting employee Position name",
      error: error.message,
    });
  }
};

// Update
exports.updateEmployeePosition = async (req, res) => {
  try {
    const { name } = req.body;
    const id = req.params.id;

    if (!id) {
      return res.status(404).send({
        success: false,
        message: "id is required",
      });
    }

    if (!name) {
      return res.status(500).send({
        success: false,
        message: `Please provide name`,
      });
    }

    await db.query(`UPDATE employeePosition SET name= ? WHERE id = ?`, [
      name,
      id,
    ]);

    res.status(201).json({
      success: true,
      message: "Employee Position name updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in updating Employee Position Name",
      error: error?.message,
    });
  }
};

// delete
exports.deleteEmployeePosition = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "id is required",
      });
    }

    await db.query(`DELETE FROM employeePosition WHERE id=?`, [id]);

    res.status(200).send({
      success: true,
      message: "Employee Position Name Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete Employee Position Name",
      error: error.message,
    });
  }
};
