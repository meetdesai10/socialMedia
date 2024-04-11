import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Reply } from "../models/reply.models.js";
import { Post } from "../models/post.model.js";

// ----------------------------commentOnPost=---------------------------
const commentOnPost = asyncHandler(async (req, res) => {
  const { postId, text } = req?.body;
  const user = req?.user;

  if (!postId || !text) {
    throw new ApiError(401, "all fields are required!!");
  }

  //   create reply
  const replyCreate = await Reply.create({ postId, userId: user?._id, text });
  if (!replyCreate) {
    throw new ApiError(500, "something went wrong while creating reply!!");
  }
  // increse count of replise
  const replyCount = await Post.findOneAndUpdate(
    { _id: postId },
    { $inc: { replies: 1 } }
  );
  if (!replyCount) {
    throw new ApiError(500, "somthign went wrong while increase counting!!");
  }
  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        {},
        `${user?.fristName + user?.lastName} commented your post!!`
      )
    );
});

// --------------------------------postAllComment -------------------------
const postAllComment = asyncHandler(async (req, res) => {
  const { id } = req?.params;
  const allComments = await Reply.find({ postId: id }).populate({
    path: "userId",
    select:
      "-password -refreshToken -email -contactNo -bio -gender -followers  -following -createdAt -updatedAt",
  });
  if (!allComments) {
    throw new ApiError(500, "somthing went wrong while finding all comments!!");
  }

  return res.status(200).send(new ApiResponse(200, allComments));
});

// --------------------------------delete Comment -------------------------
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req?.params;

  const deleteComments = await Reply.findByIdAndDelete(id);
  if (!deleteComments) {
    throw new ApiError(500, "somthing went wrong while delete comment!!");
  }
  // increse count of replise
  const replyCount = await Post.findOneAndUpdate(
    { _id: deleteComments?.postId },
    { $inc: { replies: -1 } }
  );
  if (!replyCount) {
    throw new ApiError(
      500,
      "somthing went wrong while decrease commentcount!!"
    );
  }
  return res.status(200).send(new ApiResponse(200, {}, "commet deleted!!"));
});
export { commentOnPost, postAllComment, deleteComment };
