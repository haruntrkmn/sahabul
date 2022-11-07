require("./models/User");
require("./models/Saha");
require("./models/Appointment");
require("./models/Owner");
require("./models/Admin");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userAuthRoutes = require("./routes/userAuthRoutes");
const ownerAuthRoutes = require("./routes/ownerAuthRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const sahaRoutes = require("./routes/sahaRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const requireUserAuth = require("./middlewares/requireUserAuth");

const app = express();

app.use(bodyParser.json());
app.use(userAuthRoutes);
app.use(ownerAuthRoutes);
app.use(adminAuthRoutes);
app.use(sahaRoutes);
app.use(appointmentRoutes);

const mongoUri =
  "mongodb+srv://haruntrkmn:PthKFBcMYyJAQ4L@cluster0.smvha.mongodb.net/develop?retryWrites=true&w=majority";

mongoose.connect(mongoUri);

mongoose.connection.on("connected", () => {
  console.log("Connected to mongo instance");
});

mongoose.connection.on("error", (err) => {
  console.error("Error connecting to mongo", err);
});

app.get("/", requireUserAuth, (req, res) => {
  res.send(`your email: ${req.user.email} \nyour phone: ${req.user.phone}`);
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});
