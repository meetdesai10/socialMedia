import mongoose from "mongoose";

const folloUnfolloSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accept"],
    },
  },

  { timestamps: true }
);

export const FollowAndUnfollow = mongoose.model(
  "FollowAndUnfollow",
  folloUnfolloSchema
);
