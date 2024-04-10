import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";

// ------------------------------- create post ------------------------------
const createPost = asyncHandler(async (req, res) => {
  const { postedBy, text, img } = req?.body;

  //   check fields
  if (!postedBy || !text) {
    throw new ApiError(401, "postedBy and Text fields are required!!");
  }

  //   check user exist or not
  const user = await User.findById(postedBy);

  if (!user) {
    throw new ApiError(401, "User not found!!");
  }

  //   check user is uthorized or not
  if (user._id.toString() !== req?.user?._id.toString()) {
    throw new ApiError(401, "User not authorized to create a post !!");
  }

  //   check text length
  if (text?.length > 500) {
    throw new ApiError(401, "text must be under 500 !!");
  }

  //   create post
  const newPost = await Post.create({ postedBy, text, img });

  //   send response
  return res
    .status(200)
    .json(new ApiResponse(200, newPost, "post created successfully!!"));
});

// ------------------------------ get posts ---------------------------------
const getPosts = asyncHandler(async (req, res) => {
  const { _id } = req?.user;

  const userPosts = await Post.find({
    postedBy: _id,
  });
  res.send(userPosts);
});

// ------------------------------ get posts ---------------------------------
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req?.params;

  const post = await Post.findByIdAndDelete(id);

  if (!post) {
    throw new ApiError(401, "User not found!!");
  }

  res.status(200).json(new ApiResponse(200, {}, "Post delete successfully!!"));
});
export { createPost, getPosts, deletePost };
