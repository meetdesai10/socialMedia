import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Post } from "../models/post.model.js";
import { SavePost } from "../models/savePost.model.js";

// ------------------------------save post ---------------------------
const savePost = asyncHandler(async (req, res) => {
  const { id } = req?.params;
  const { _id } = req?.user;

  // check post exist or not
  const post = await Post.findOne({ _id: id });
  if (!post) {
    throw new ApiError(401, "Post not found!!");
  }

  // chekck if post already save or not
  const isPostSave = await SavePost.findOne({ postId: id, userId: _id });
  if (!isPostSave) {
    const savePost = await SavePost.create({ postId: id, userId: _id });

    if (!savePost) {
      throw new ApiError(500, "sonthing went wrong while creating savepost!!");
    }

    return res.status(200).json(new ApiResponse(200, {}, true));
  } else {
    const unSavePost = await SavePost.findOneAndDelete({
      postId: id,
      userId: _id,
    });

    if (!unSavePost) {
      throw new ApiError(
        500,
        "sonthing went wrong while creating unSavepost!!"
      );
    }
    return res.status(200).json(new ApiResponse(200, {}, false));
  }
});

// ------------------------------get all save post-----------------------
const getAllSavedPost = asyncHandler(async (req, res) => {
  const { id } = req?.params;
  const { _id } = req?.user;

  // check the ig is account holder is or not
  if (id?.toString() !== _id?.toString()) {
    throw new ApiError(
      401,
      "You are not authorized to get save post history!!"
    );
  }

  // get all savsaved post
  const savedPost = await SavePost.find({ userId: id }).populate([
    {
      path: "postId",
    },
    {
      path: "userId",
      select:
        "-password -followers -following -contactNo -createdAt -updatedAt -gender -refreshToken",
    },
  ]);

  if (!savedPost) {
    throw new ApiError(401, "No saved post found!!");
  }

  return res.status(200).send(new ApiResponse(200, savedPost));
});
export { savePost, getAllSavedPost };
