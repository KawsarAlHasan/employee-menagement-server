const db = require("../confiq/db");

// get processign fee
exports.getProcessignFee = async (req, res) => {
  try {
    const busn_id = req.businessId;

    const [data] = await db.query(
      "SELECT * FROM processing_fee WHERE busn_id=?",
      [busn_id]
    );
    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No processing fee found",
        data: data,
      });
    }
    res.status(200).send({
      success: true,
      message: "Get processing fee",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Getting processing fee",
      error: error.message,
    });
  }
};

// update Update Processign fee
exports.updateProcessignFee = async (req, res) => {
  try {
    const busn_id = req.businessId;

    const { fee } = req.body;

    if (!fee) {
      return res.status(500).send({
        success: false,
        message: "fee is required",
      });
    }

    const [data] = await db.query(
      `UPDATE processing_fee SET fee=? WHERE busn_id=?`,
      [fee, busn_id]
    );
    if (!data || data.length === 0) {
      return res.status(500).send({
        success: false,
        message: "Error in update processing fee ",
      });
    }
    res.status(200).send({
      success: true,
      message: "processing fee updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Updatting processing fee ",
      error,
    });
  }
};
