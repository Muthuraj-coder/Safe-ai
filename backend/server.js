require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(bodyParser.json());
app.use("/api/logs", require("./routes/logs"));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
