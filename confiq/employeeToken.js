const jwt = require("jsonwebtoken");
exports.generateEmployeeToken = (employeeInfo) => {
  const payload = {
    id: employeeInfo.id,
    email: employeeInfo.email,
  };
  const employeeToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "150 days",
  });

  return employeeToken;
};
