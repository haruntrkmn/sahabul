const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
});

adminSchema.pre("save", function (next) {
  // hashes password
  const admin = this;

  if (!admin.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(admin.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      admin.password = hash;
      console.log("Password hashed successfully: ", hash);
      next();
    });
  });
});

adminSchema.methods.comparePassword = function (candidatePassword) {
  const admin = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, admin.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }

      if (!isMatch) {
        return reject({ message: "Password is invalid." });
      }
      console.log("Given password matches with hashed password");
      resolve(true);
    });
  });
};

mongoose.model("Admin", adminSchema);
