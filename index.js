const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const mySqlPool = require("./confiq/db");
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

app.use("/api/v1/employee", require("./routes/employeeRoute"));
app.use("/api/v1/admin", require("./routes/adminRoute"));
app.use("/api/v1/salary", require("./routes/salariesRoute"));
app.use("/api/v1/work-time", require("./routes/workTimeRoute"));
app.use("/api/v1/sales", require("./routes/salesRoute"));
app.use("/api/v1/partnership", require("./routes/partnershipRoute"));
app.use("/api/v1/costing", require("./routes/costingRoute"));
app.use("/api/v1/cost-list", require("./routes/costlistRoute"));
app.use("/api/v1/food-cost", require("./routes/foodCostRoute"));
app.use("/api/v1/profit", require("./routes/lossAndProfitRoute"));
app.use("/api/v1/general-setting", require("./routes/generalSettingRoute"));
// 404 Not Found middleware
app.use((req, res, next) => {
  res.status(404).json({
    error: "You have hit the wrong route",
  });
});

const port = process.env.PORT || 5000;

mySqlPool
  .query("SELECT 1")
  .then(() => {
    console.log("MYSQL DB Connected");

    // listen
    app.listen(port, () => {
      console.log(`Employee Management Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.get("/", (req, res) => {
  res.status(200).send("Employee Management Server is working");
});
