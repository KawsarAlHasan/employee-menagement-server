const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = async (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")?.[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "You are not loggedin",
      });
    }

    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: "fobidden access" });
      }
      req.decodedemployee = decoded;
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
