const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Owner = mongoose.model("Owner");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({ error: "Owner must be logged in." });
  }

  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, "sahabu1_k3y_owner", async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: "Owner must be logged in." });
    }
    const { ownerId } = payload;

    const owner = await Owner.findById(ownerId);
    req.owner = owner;
    next();
  });
};
