import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { FollowAndUnfollow } from "../models/followUnfollow.model.js";

// -------------------follow----------------------------------------
const follow = asyncHandler(async (req, res) => {
  const receiverId = req?.params?.id;
  const senderId = req?.user?._id;

  if (receiverId.toString() === senderId.toString()) {
    throw new ApiError(401, "You cannot follow your self!!");
  }
  // check receiverUser
  const receiverUser = await User.findById(receiverId);
  if (!receiverId) {
    throw new ApiError(401, "User not found!!");
  }

  // check if user already follow
  const isFollowed = await FollowAndUnfollow.findOne({
    receiverId,
    senderId,
  });

  if (!isFollowed) {
    if (receiverUser?.privateAccount) {
      // sent a request to a receiver cause privaete account
      await FollowAndUnfollow.create({
        senderId,
        receiverId,
        status: "pending",
      }).then((response) => {
        return res
          .status(200)
          .send(
            new ApiResponse(
              200,
              {},
              `request has been sent to ${
                receiverUser?.fristName + receiverUser?.lastName
              }`
            )
          );
      });
    } else {
      // followed!!!
      await FollowAndUnfollow.create({
        senderId,
        receiverId,
        status: "accept",
      }).then(async (response) => {
        await User.findByIdAndUpdate(senderId, { $inc: { following: 1 } });
        await User.findByIdAndUpdate(receiverId, { $inc: { followers: 1 } });
        return res
          .status(200)
          .send(
            new ApiResponse(
              200,
              {},
              `You followd ${
                receiverUser?.fristName + receiverUser?.lastName
              }!!`
            )
          );
      });
    }
  } else {
    if (isFollowed?.status == "pending") {
      return res
        .status(200)
        .send(
          new ApiResponse(
            200,
            {},
            `you already sent a request to ${
              receiverUser?.fristName + receiverUser?.lastName
            }!!`
          )
        );
    } else {
      return res
        .status(200)
        .send(
          new ApiResponse(
            200,
            {},
            `you already followed ${
              receiverUser?.fristName + receiverUser?.lastName
            }!!`
          )
        );
    }
  }
});

// -------------------unFollow----------------------------------------
const unFollow = asyncHandler(async (req, res) => {
  const receiverId = req?.params?.id;
  const senderId = req?.user?._id;

  if (receiverId.toString() === senderId.toString()) {
    throw new ApiError(401, "You cannot unFollow your self!!");
  }
  // find reciver user
  const receiverUser = await User.findById(receiverId);
  if (!receiverUser) {
    throw new ApiError(401, "User not found!!");
  }

  // unfollow
  const receiverUserUnfollowed = await FollowAndUnfollow.findOneAndDelete({
    receiverId,
    senderId,
    status: "accept",
  });
  if (!receiverUserUnfollowed) {
    throw new ApiError(401, "somthing went wrong while unfollow!!");
  }

  await User.findByIdAndUpdate(senderId, { $inc: { following: -1 } });
  await User.findByIdAndUpdate(receiverId, { $inc: { followers: -1 } });
  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        {},
        `you unFollowed ${receiverUser?.fristName + receiverUser?.lastName}`
      )
    );
});

// ------------------------ acceptrequest----------------------
const acceptRequest = asyncHandler(async (req, res) => {
  const { senderId } = req?.params;
  const receiverId = req?.user?._id;

  // find sender
  const sendUser = await User.findById(senderId);
  if (!sendUser) {
    throw new ApiError(401, "User not found!!");
  }

  // find request
  const findRequest = await FollowAndUnfollow.findOneAndUpdate(
    { senderId, receiverId },
    { status: "accept" },
    {
      new: true,
    }
  );
  if (findRequest?.status == "accept") {
    await User.findByIdAndUpdate(senderId, { $inc: { following: 1 } });
    await User.findByIdAndUpdate(receiverId, { $inc: { followers: 1 } });
  }
  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        {},
        `${`you accept ${sendUser?.fristName + sendUser?.lastName}'s request`}`
      )
    );
});

// ------------------------ rejctRequest----------------------
const rejectRequest = asyncHandler(async (req, res) => {
  const { senderId } = req?.params;
  const receiverId = req?.user?._id;

  // find sender
  const sendUser = await User.findById(senderId);
  if (!sendUser) {
    throw new ApiError(401, "User not found!!");
  }

  // find request
  const findRequest = await FollowAndUnfollow.findOneAndDelete({
    senderId,
    receiverId,
    status: "pending",
  });
  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        {},
        `${`you rejects ${sendUser?.fristName + sendUser?.lastName}'s request`}`
      )
    );
});

// ------------------------- get followings ------------------------
const getFollowings = asyncHandler(async (req, res) => {
  const { id } = req?.params;
  const user = req?.user;

  const followings = await FollowAndUnfollow.find({
    senderId: id,
    status: "accept",
  })
    .select("-createdAt -updatedAt -logginUser")
    .populate({
      path: "receiverId",
      select:
        "-email -contactNo -password -gender -followers -following -bio -createdAt -updatedAt -refreshToken",
    });
  if (followings.length == 0) {
    throw new ApiError(401, "followings not found!!");
  }

  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        followings,
        `followings of ${user?.fristName + user?.lastName}`
      )
    );
});

// ------------------------- get followers---------------------------
const getFollowers = asyncHandler(async (req, res) => {
  const { id } = req?.params;
  const user = req?.user;

  const followers = await FollowAndUnfollow.find({
    receiverId: id,
    status: "accept",
  })
    .select("-createdAt -updatedAt -followUser")
    .populate({
      path: "senderId",
      select:
        "-email -contactNo -password -gender -followers -following -bio -createdAt -updatedAt -refreshToken",
    });
  if (followers.length == 0) {
    throw new ApiError(401, "followers not found!!");
  }

  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        followers,
        `followers of ${user?.fristName + user?.lastName}`
      )
    );
});
export {
  follow,
  unFollow,
  acceptRequest,
  rejectRequest,
  getFollowings,
  getFollowers,
};