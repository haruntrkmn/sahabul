const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ownerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  surname: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  sahas: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Saha",
    required: true,
  },
});

ownerSchema.pre("save", function (next) {
  // hashes password
  const owner = this;

  if (!owner.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(owner.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      owner.password = hash;
      console.log("Password hashed successfully: ", hash);
      next();
    });
  });
});

ownerSchema.methods.comparePassword = function (candidatePassword) {
  const owner = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, owner.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }

      if (!isMatch) {
        return reject({ message: "Password is invalid" });
      }
      console.log("Given password matches with hashed password");
      resolve(true);
    });
  });
};

mongoose.model("Owner", ownerSchema);
