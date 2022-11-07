const express = require("express");
const mongoose = require("mongoose");
const requireAdminAuth = require("../middlewares/requireAdminAuth");
const requireOwnerAuth = require("../middlewares/requireOwnerAuth");
const Saha = mongoose.model("Saha");

const router = express.Router();

router.post("/admin/create-saha", requireAdminAuth, async (req, res) => {
  const {
    name,
    city,
    district,
    location,
    price_morning,
    price_evening,
    pre_payment_amount,
    advance_discount,
    neighbour_districts,
    opening_hour,
    closing_hour,
    timeslots,
    images,
    size_width,
    size_length,
    suggested_player_amount,
    amenities,
  } = req.body;

  try {
    const saha = new Saha({
      name,
      city,
      district,
      location,
      price_morning,
      price_evening,
      pre_payment_amount,
      advance_discount,
      neighbour_districts,
      opening_hour,
      closing_hour,
      timeslots,
      images,
      size_width,
      size_length,
      suggested_player_amount,
      amenities,
    });
    var new_saha = await saha.save();

    res.send(`Saha created successfully with id of ${new_saha._id}`);
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post("/owner/add-timeslots", requireOwnerAuth, async (req, res) => {
  const { saha, days } = req.body;
  const day_strings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  try {
    var saha_to_be_updated = await Saha.findById(saha);
    for (let day of days) {
      // checking if that day already exists in the saha
      const day_already_exists =
        saha_to_be_updated.timeslots.filter((timeslot) => {
          return timeslot.day === day;
        }).length != 0;

      if (day_already_exists) {
        throw new Error(
          `Trying to insert a day which is already in the saha's timeslots: ${day}`
        );
      }

      const hours = []; // this will store states of hours of one day

      // filling it with zeros, which is initial operation
      for (let i = 0; i < 24; i++) {
        hours.push(0);
      }

      // making saha's closed hours' state unavailable (4)
      let ctr = saha_to_be_updated.closing_hour;
      while (true) {
        hours[ctr] = 4;
        ctr++;
        if (ctr === 24) {
          ctr = 0;
        }
        if (ctr === saha_to_be_updated.opening_hour) {
          break;
        }
      }

      // making saha's membership hours' state (3)
      const converted_day = new Date(day);
      const day_string = day_strings[converted_day.getUTCDay()]; // day_string: Mon, Tue etc.

      console.log(`${day} -> ${day_string}`);

      for (let membership of saha_to_be_updated.memberships) {
        if (membership.day === day_string) {
          hours[membership.hour] = 3;
        }
      }

      const day_object = { day, hours };
      saha_to_be_updated.timeslots.push(day_object);
    }
    await saha_to_be_updated.save();
    res.send("Timeslots added successfully");
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post("/owner/create-membership", requireOwnerAuth, async (req, res) => {
  const session = await mongoose.startSession();
  const { saha, day, hour } = req.body;
  const day_strings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  try {
    session.startTransaction();

    const saha_to_be_updated = await Saha.findById(saha);

    saha_to_be_updated.memberships.push({ day, hour }); // adding membership
    await saha_to_be_updated.save();

    // setting corresponding hour state to 3
    // iterating over all days, checking if day is membership's day, if so, setting state to 3
    for (let i = 0; i < saha_to_be_updated.timeslots.length; i++) {
      let timeslot = saha_to_be_updated.timeslots[i];

      let day_of_timeslot = new Date(timeslot.day).getUTCDay(); // day_of_timeslot: 1
      day_of_timeslot = day_strings[day_of_timeslot]; // day_of_timeslot: 'Mon'

      if (day_of_timeslot === day) {
        console.log(`4: ${hour}`);
        // saha_to_be_updated.timeslots[i].hours[hour] = 3;
        const query_string = "timeslots.$.hours." + hour.toString();
        console.log(query_string);

        await Saha.updateMany(
          { _id: saha, "timeslots.day": day },
          { $set: { "timeslots.$.hours": [] } },
          { session }
        );
      }
    }

    await session.commitTransaction();
    res.send("Membership added successfully");
  } catch (err) {
    await session.abortTransaction();

    return res.status(422).send(err.message);
  } finally {
    session.endSession();
  }
});

module.exports = router;
