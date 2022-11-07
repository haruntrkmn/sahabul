const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
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
    unique: true,
  },

  email: {
    type: String,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  current_cart: {
    // unique if not null, validating it in middleware
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },

  active_appointments: {
    // unique if not null, validating it in middleware
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Appointment",
  },

  past_appointments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Appointment",
  },

  sahapuan: {
    type: Number,
    required: true,
    default: 0,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  console.log(`first middleware`);

  if (
    !user.isModified("current_cart") &&
    !user.isModified("active_appointments") &&
    !user.isModified("past_appointments")
  ) {
    return next();
  }

  // checks if current_cart is unique if it is not null
  if (user.current_cart) {
    try {
      const user_with_same_current_cart = await mongoose.models["User"].findOne(
        {
          current_cart: user.current_cart,
        }
      );
      if (user_with_same_current_cart) {
        return next(new Error("Another user exists with this current_cart"));
      }
      next();
    } catch (err) {
      return next(err);
    }
  }

  // checks if elements of active_appointments array are unique if array is not empty
  if (user.active_appointments) {
    if (user.active_appointments.length > 0) {
      try {
        for (const appointment_id in user.active_appointments) {
          const appointment = await mongoose.models["User"].findOne({
            active_appointments: appointment_id,
          });
          if (appointment) {
            return next(
              new Error("Appointment is already bought by another user")
            );
          }
        }
        next();
      } catch (err) {
        return next(err);
      }
    }
  }

  // checks if elements of past_appointments array are unique if array is not empty
  if (user.past_appointments) {
    if (user.past_appointments.length > 0) {
      try {
        for (const appointment_id in user.past_appointments) {
          const appointment = await mongoose.models["User"].findOne({
            past_appointments: appointment_id,
          });
          if (appointment) {
            return next(
              new Error(
                "Appointment is already in the past appointments of another user."
              )
            );
          }
        }
        next();
      } catch (err) {
        return next(err);
      }
    }
  }
});

userSchema.pre("save", function (next) {
  console.log(`second middleware`);
  // fills empty email or phone values
  const user = this;

  if (!user.isNew) {
    return next();
  }

  if (!user.email) {
    user.email = "undefined " + user._id.toString();
    console.log("Email is set to", user.email);
  } else if (!user.phone) {
    user.phone = "undefined " + user._id.toString();
    console.log("Phone is set to", user.phone);
  }

  next();
});

userSchema.pre("save", function (next) {
  console.log(`third middleware`);
  // hashes password
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      console.log("Password hashed successfully: ", hash);
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
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

mongoose.model("User", userSchema);
