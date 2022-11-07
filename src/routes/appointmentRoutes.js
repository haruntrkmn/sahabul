const express = require("express");
const mongoose = require("mongoose");
const Saha = mongoose.model("Saha");
const Appointment = mongoose.model("Appointment");
const User = mongoose.model("User");
const requireUserAuth = require("../middlewares/requireUserAuth");

const router = express.Router();

router.post("/create-appointment", requireUserAuth, async (req, res) => {
  const session = await mongoose.startSession();
  const day_strings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  try {
    session.startTransaction();

    const {
      saha,
      user,
      day,
      hour,
      whole_price,
      advance_discount,
      pre_payment_amount,
    } = req.body;

    var saha_to_be_updated = await Saha.findById(saha);

    const target_day = saha_to_be_updated.timeslots.filter((e) => {
      return e.day === day;
    });

    if (target_day.length === 0) {
      throw new Error(
        "Appointment day does not exist in the saha's timeslots."
      );
    }

    // target day: [{day: 'asd', hours: [0, 0, ..]}]

    if (target_day[0].hours[hour] !== 0) {
      throw new Error(
        `Hour is not available, state: ${target_day[0].hours[hour]}`
      );
    }

    // creating and saving new appointment document
    var appointment = new Appointment({
      saha,
      user,
      day,
      hour,
      whole_price,
      advance_discount,
      pre_payment_amount,
    });

    var new_appointment = await appointment.save({ session });

    // updating timeslot array of corresponding saha document
    const index = saha_to_be_updated.timeslots.findIndex((e) => {
      return e.day === day;
    });
    console.log(index);

    saha_to_be_updated.timeslots[index].hours[hour] = 1; // state is set to "in_cart"
    console.log(saha_to_be_updated);
    await saha_to_be_updated.save({ session });

    // await Saha.updateOne(
    //   { _id: saha, "timeslots.day": day },
    //   { $set: { "timeslots.$.hours": 1 } },
    //   { session }
    // );

    // adding new appointment to current cart of the user
    // OVVERRIDES OLD CURRENT_CART VALUE!!
    await User.findByIdAndUpdate(
      user,
      {
        $set: { current_cart: new_appointment._id },
      },
      { session }
    );

    await session.commitTransaction();

    res.send(
      `Appointment created successfully with id of ${new_appointment._id}`
    );
  } catch (err) {
    await session.abortTransaction();

    return res.status(422).send(err.message);
  } finally {
    session.endSession();
  }
});

router.post("/delete-appointment-in-cart", async (req, res) => {
  // const session = await mongoose.startSession();

  try {
    // session.startTransaction();

    const { appointment_id } = req.body;

    const appointment_to_be_deleted = await Appointment.findById(
      appointment_id
    );

    if (appointment_to_be_deleted.state != "in_cart") {
      throw {
        message: "State of appointment to be deleted is not in_cart",
      };
    }

    console.log(appointment_to_be_deleted.hour);
    // setting state of timeslot of corresponding saha document to 0

    // const asd = await Saha.findOne({
    //   "timeslots.hour": appointment_to_be_deleted.hour,
    // });

    // TODO: date objectle ilgilen
    await Saha.updateOne(
      {
        _id: appointment_to_be_deleted.saha,
        "timeslots.hour": appointment_to_be_deleted.hour,
      },
      { $set: { "timeslots.$.state": 0 } }
      // { session }
    );

    // emptying current_cart of the user
    await User.findByIdAndUpdate(
      appointment_to_be_deleted.user,
      {
        $unset: { current_cart: 1 },
      }
      // { session }
    );

    // // deleting appointment
    // await Appointment.findByIdAndDelete(
    //   appointment_id,
    //   // function(err) {
    //   //   if (err) {
    //   //     throw err;
    //   //   }
    //   // },

    //   { session }
    // );

    // await session.commitTransaction();

    res.send(`Appointment deleted successfully`);
  } catch (err) {
    // await session.abortTransaction();

    return res.status(422).send(err.message);
  } finally {
    // session.endSession();
  }
});

router.post("/buy-appointment-in-cart", async (req, res) => {
  const { params } = req.body;

  try {
    const appointment = new Appointment({
      saha,
      user,
      hour,
      whole_price,
      advance_discount,
      pre_payment_amount,
    });
    var new_appointment = await appointment.save();

    res.send(
      `Appointment created successfully with id of ${new_appointment._id}`
    );
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post("/asd", async (req, res) => {
  try {
    const user = await User.findById("6146dddee117fda6b7ad6e33");
    user.current_cart = "6146ddfee117fda6b7ad6e3a";
    await user.save();

    res.send(`success`);
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post("/qqq", async (req, res) => {
  try {
    const user = await User.findById("6146dddee117fda6b7ad6e33");
    user.current_cart = "6146ddfee117fda6b7ad6e3a";
    await user.save();

    res.send(`success`);
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

module.exports = router;
