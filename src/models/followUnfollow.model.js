import mongoose from "mongoose";

const folloUnfolloSchema = new mongoose.Schema(
  {
    logginUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    followUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true }
);

export const FollowAndUnfollow = mongoose.model(
  "FollowAndUnfollow",
  folloUnfolloSchema
);
