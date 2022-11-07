const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Admin = mongoose.model("Admin");

const router = express.Router();

router.post("/admin/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    var admin = new Admin({ username, password });
    await admin.save();

    var token = jwt.sign({ adminId: admin._id }, "sahabu1_admin_k3y");
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post("/admin/signin", async (req, res) => {
  const { username, password } = req.body;
  try {
    var admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(404).send({ error: "Admin not found" });
    }

    await admin.comparePassword(password);

    var token = jwt.sign({ adminId: admin._id }, "sahabu1_admin_k3y");
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

module.exports = router;
