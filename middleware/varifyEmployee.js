const jwt = require("jsonwebtoken");
const db = require("../confiq/db");
const dotenv = require("dotenv");
dotenv.config();

module.exports = async (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")?.[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "You are not logged in",
      });
    }

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Forbidden access" });
      }

      const decodedEmployee = decoded.id;
      const [result] = await db.query(`SELECT * FROM employees WHERE id=?`, [
        decodedEmployee,
      ]);

      const busn_id = result[0]?.business_id;

      if (!busn_id) {
        return res
          .status(404)
          .json({ error: "User problems. Please login again" });
      }

      req.businessId = busn_id;
      req.decodedemployee = result[0];
      next();
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid Token",
      error: error.message,
    });
  }
};
