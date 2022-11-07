const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: false,
  },

  score: {
    type: Number, // 1, 2, 3, 4 or 5 (float)
    required: true,
  },

  saha: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Saha",
    required: true,
    unique: false,
  },
});

// 1 user can have 1 rating on a post, (user, saha) pair is unique
ratingSchema.index({ user: 1, saha: 1 }, { unique: true });

mongoose.model("Rating", ratingSchema);
