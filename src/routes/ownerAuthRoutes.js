const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Owner = mongoose.model("Owner");

const router = express.Router();

router.post("/owner/signup", async (req, res) => {
  const { name, surname, phone, email, password, sahas } = req.body;
  try {
    var owner = new Owner({ name, surname, phone, email, password, sahas });
    await owner.save();

    var token = jwt.sign({ ownerId: owner._id }, "sahabu1_k3y_owner");

    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post("/owner/signin", async (req, res) => {
  const { phone, password } = req.body;
  try {
    var owner = await Owner.findOne({ phone });

    if (!owner) {
      return res.status(404).send({ error: "Owner not found" });
    }

    await owner.comparePassword(password);

    var token = jwt.sign({ ownerId: owner._id }, "sahabu1_k3y_owner");
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

module.exports = router;
