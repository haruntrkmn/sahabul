const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    default: "in_cart",
  },

  saha: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Saha",
    required: true,
    unique: false, // unique false is set because (saha, day, hour) triplet will be index
  },

  day: {
    // start hour
    type: String,
    required: true,
    unique: false, // unique false is set because (saha, day, hour) pair will be index
  },

  hour: {
    type: Number,
    required: true,
    unique: false, // unique false is set because (saha, day, hour) pair will be index
  },

  whole_price: {
    type: Number,
    required: true,
  },

  advance_discount: {
    type: Number,
    required: true,
  },

  pre_payment_amount: {
    type: Number,
    required: true,
  },

  price_will_be_paid: {
    // if state === 'active', this is valid
    type: Number,
  },

  entrance_code: {
    // if state === 'active', this is valid
    type: String,
    unique: true,
  },
});

appointmentSchema.index({ saha: 1, day: 1, hour: 1 }, { unique: true });

appointmentSchema.pre("save", function (next) {
  const appointment = this;

  if (!appointment.isNew) {
    return next();
  }

  if (!appointment.entrance_code) {
    appointment.entrance_code = "undefined " + appointment._id.toString();
    console.log("Entrance code is set to", appointment.entrance_code);
  }

  next();
});

mongoose.model("Appointment", appointmentSchema);
