const mongoose = require("mongoose");

const sahaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  district: {
    type: String,
    required: true,
  },

  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },

  price_morning: {
    type: Number,
    required: true,
  },

  price_evening: {
    type: Number,
    required: true,
  },

  pre_payment_amount: {
    type: Number,
    required: true,
  },

  advance_discount: {
    type: Number,
    required: true,
  },

  neighbour_districts: {
    type: [String],
    required: true,
  },

  opening_hour: {
    type: Number, // between 0 and 24
    required: true,
  },

  closing_hour: {
    type: Number, // between 0 and 24
    required: true,
  },

  timeslots: {
    type: [Object], // [{day: Date, hours: [Number]}] (0: available, 1: in_cart, 2: bought, 3: member, 4: unavailable)
    required: true,
  },

  images: {
    type: [String],
    unique: true,
    required: true,
  },

  size_width: {
    type: Number,
    required: true,
  },

  size_length: {
    type: Number,
    required: true,
  },

  suggested_player_amount: {
    type: Number,
    required: true,
  },

  overall_rating: {
    type: Number,
  },

  amenities: {
    type: [String], // ["wc", "soyunma odası"]
    required: true,
  },

  memberships: {
    type: [Object], // [{day: string, hour: number, name: string}]
  },
});

sahaSchema.pre("save", function (next) {
  // checking if added membership already exists in the saha
  const saha = this;

  if (!saha.isModified("memberships")) {
    return next();
  }

  console.log("MIDDLEWARE MEMBERSHIP");

  var new_added_membership = saha.memberships[saha.memberships.length - 1];
  for (let i = 0; i < saha.memberships.length - 1; i++) {
    if (
      new_added_membership.day === saha.memberships[i].day &&
      new_added_membership.hour === saha.memberships[i].hour
    ) {
      return next(new Error("Membership already exists in this saha"));
    }
  }

  next();
});

mongoose.model("Saha", sahaSchema);
