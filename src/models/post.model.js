import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      maxLength: 500,
    },
    img: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    replies: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
