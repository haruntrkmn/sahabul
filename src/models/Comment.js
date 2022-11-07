const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: false,
  },

  text: {
    type: String,
    required: true,
  },

  saha: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Saha",
    required: true,
    unique: false,
  },
});

// 1 user can have 1 comment on a post, (user, saha) pair is unique
commentSchema.index({ user: 1, saha: 1 }, { unique: true });

mongoose.model("Comment", commentSchema);
