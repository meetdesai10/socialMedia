import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// ------------------------------- create post ------------------------------
const createPost = asyncHandler(async (req, res) => {
  const { postedBy, text } = req?.body;

  //   check fields
  if (!postedBy || !text) {
    throw new ApiError(401, "postedBy and Text fields are required!!");
  }

  const postImageLocalPath = req?.files?.postImage?.[0]?.path;

  if (!postImageLocalPath) {
    throw new ApiError(401, "please provide post image");
  }

  const postimg = await uploadOnCloudinary(postImageLocalPath);

  if (!postimg?.url) {
    throw new ApiError(
      500,
      "somthing has been wrong while uploading post image in cloudinary!!"
    );
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
  const newPost = await Post.create({ postedBy, text, img: postimg?.url });

  //   send response
  return res
    .status(200)
    .send(new ApiResponse(200, newPost, "post created successfully!!"));
});

// ------------------------------ get posts ---------------------------------
const getAllPosts = asyncHandler(async (req, res) => {
  const { id } = req?.params;

  const userPosts = await Post.find({
    postedBy: id,
  });

  if (!userPosts) {
    throw new ApiError(401, "post not found!!");
  }
  res.status(200).send(new ApiResponse(200, userPosts));
});

// ------------------------------ get IndividualPosts  ---------------------------------
const getPost = asyncHandler(async (req, res) => {
  const { id } = req?.params;

  const userPost = await Post.findById(id).populate({
    path: "postedBy",
    select: "-password -refreshToken",
  });
  if (!userPost) {
    throw new ApiError(401, "post not found!!");
  }
  res.status(200).send(new ApiResponse(200, userPost));
});

// ------------------------------ get posts ---------------------------------
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req?.params;

  const post = await Post.findById(id);

  if (!post) {
    throw new ApiError(401, "post not found!!");
  }
  // check it is owner or not
  if (post?.postedBy.toString() !== req?.user?._id.toString()) {
    throw new ApiError(401, "Only owner can delete the post!!");
  }

  const deletedPost = await Post.findByIdAndDelete(id);
  if (!deletedPost) {
    throw new ApiError(500, "somthing went wrong while deleting the post!!");
  }

  res.status(200).send(new ApiResponse(200, {}, "Post delete successfully!!"));
});

// ------------------------------- likeUnlikes---------------------------------------

export { createPost, getAllPosts, deletePost, getPost };
