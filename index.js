const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const mySqlPool = require("./confiq/db");
const path = require("path");
const app = express();
dotenv.config();

const globalCorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(globalCorsOptions));
app.options("*", cors(globalCorsOptions));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Serve static files
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api/v1/employee", require("./routes/employeeRoute"));
app.use("/api/v1/employee", require("./routes/adminRoute"));
app.use("/api/v1/position", require("./routes/employeePositionRoute"));
app.use("/api/v1/salary", require("./routes/salariesRoute"));
app.use("/api/v1/work-time", require("./routes/workTimeRoute"));
app.use("/api/v1/sales", require("./routes/salesRoute"));
app.use("/api/v1/partnership", require("./routes/partnershipRoute"));
app.use("/api/v1/costing", require("./routes/costingRoute"));
app.use("/api/v1/cost-list", require("./routes/costlistRoute"));
app.use("/api/v1/food-cost", require("./routes/foodCostRoute"));
app.use("/api/v1/profit", require("./routes/lossAndProfitRoute"));
app.use("/api/v1/general-setting", require("./routes/generalSettingRoute"));
app.use("/api/v1/notification", require("./routes/notificationsRoute"));
app.use("/api/v1/terms", require("./routes/termsAndConditionsRoute"));
app.use("/api/v1/privacy", require("./routes/privacyPolicyRoute"));
app.use("/api/v1/online-platform", require("./routes/onlineSalesRoute"));
app.use("/api/v1/users", require("./routes/forgotPassword"));
app.use("/api/v1/contact-support", require("./routes/contactSupportRoute"));

const port = process.env.PORT || 8080;

mySqlPool
  .query("SELECT 1")
  .then(() => {
    console.log("MYSQL DB Connected");

    // listen
    app.listen(port, () => {
      console.log(`BMS Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.get("/", (req, res) => {
  res.status(200).send("BMS server is working");
});

// 404 Not Found middleware
app.use("*", (req, res, next) => {
  res.status(404).json({
    error: "You have hit the wrong route",
  });
});
