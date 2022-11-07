const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");

const router = express.Router();

router.post("/signup", async (req, res) => {
  var req_keys = Object.keys(req.body);

  try {
    if (req_keys.includes("email")) {
      // signup with email
      const { name, surname, email, password } = req.body;

      var user = new User({ name, surname, email, password });
    } else if (req_keys.includes("phone")) {
      // signup with phone
      const { name, surname, phone, password } = req.body;

      user = new User({ name, surname, phone, password });
    } else {
      return res
        .status(500)
        .send("Phone or email is not found in request body.");
    }
    await user.save();

    var token = jwt.sign({ userId: user._id }, "sahabu1_k3y");

    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post("/signin", async (req, res) => {
  const { email, phone, password } = req.body;
  try {
    if (email) {
      // email sign in
      if (!password) {
        return res.status(422).send({ error: "Must provide a password" });
      }

      var user = await User.findOne({ email });
    } else if (phone) {
      // phone sign in
      if (!password) {
        return res.status(422).send({ error: "Must provide a password" });
      }

      user = await User.findOne({ phone });
    } else {
      return res
        .status(500)
        .send("Phone or email is not found in request body.");
    }

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    await user.comparePassword(password);

    const token = jwt.sign({ userId: user._id }, "sahabu1_k3y");

    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

module.exports = router;
