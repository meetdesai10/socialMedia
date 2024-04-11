import { Like } from "../models/likes.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// -------------------------- like unlike ----------------------------
const likeUnlikes = asyncHandler(async (req, res) => {
  const postId = req?.params?.id;
  const user = req?.user;

  // check user like post or not

  const isAlreadyLike = await Like.findOne({ postId, userId: user?._id });
  if (!isAlreadyLike) {
    const like = await Like.create({ postId, userId: user?._id });
    const likeCountInc = await Post.findByIdAndUpdate(postId, {
      $inc: { likes: 1 },
    });
    if (!likeCountInc) {
      throw new ApiError(500, "somthing went wrong in likeIncrement");
    }
    if (!like) {
      throw new ApiError(500, "somthing went wrong in like");
    }
    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          {},
          `${user?.fristName + user?.lastName} liked your post`
        )
      );
  } else {
    const unlike = await Like.findOneAndDelete({ postId, userId: user?._id });
    const likeCountInc = await Post.findByIdAndUpdate(postId, {
      $inc: { likes: -1 },
    });
    if (!likeCountInc) {
      throw new ApiError(500, "somthing went wrong in likeDecrement");
    }
    if (!unlike) {
      throw new ApiError(500, "somthing went wrong in unLike");
    }
    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          {},
          `${user?.fristName + user?.lastName} UnLiked your post`
        )
      );
  }
});

// ----------------------------- postAllLikes ---------------------------
const postAllLikes = asyncHandler(async (req, res) => {
  const postId = req?.params?.id;

  const likes = await Like.find({ postId }).populate({
    path: "userId",
    select: "-password -refreshToken -email -contactNo -bio ",
  });
  if (!likes) {
    throw new ApiError(401, "no likes Found!!");
  }

  return res.status(200).send(200, likes);
});

export { likeUnlikes, postAllLikes };
