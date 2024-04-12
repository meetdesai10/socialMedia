import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { config } from "../../config.js";
import { FollowAndUnfollow } from "../models/followUnfollow.model.js";

// -------------------followAndUnfollow--------------------------
const followAndUnfollow = asyncHandler(async (req, res) => {
  const { id } = req?.params;
  const loggedInUser = req?.user?._id;

  // check user existence
  const user = await User.findById(id);
  const currentUser = await User.findById(loggedInUser);
  if (!(user && currentUser)) {
    throw new ApiError(config.BAD_REQUEST, "User not found!!");
  }

  if (id === loggedInUser.toString()) {
    throw new ApiError(
      config.BAD_REQUEST,
      "You can't follow or unFollow yourself!!"
    );
  }

  // check if user is already following
  const isFollowing = await FollowAndUnfollow.findOne({
    logginUser: loggedInUser,
    followUser: id,
  });

  if (!isFollowing) {
    // follow user
    await FollowAndUnfollow.create({
      logginUser: loggedInUser,
      followUser: id,
    });
    await User.findByIdAndUpdate(loggedInUser, { $inc: { following: 1 } });
    await User.findByIdAndUpdate(id, { $inc: { followers: 1 } });
    return res
      .status(config.SUCCESS)
      .send(
        new ApiResponse(
          config.SUCCESS,
          {},
          `You followed ${user?.fristName} ${user?.lastName}`
        )
      );
  } else {
    // unfollow user
    await FollowAndUnfollow.findOneAndDelete({
      logginUser: loggedInUser,
      followUser: id,
    });
    await User.findByIdAndUpdate(loggedInUser, { $inc: { following: -1 } });
    await User.findByIdAndUpdate(id, { $inc: { followers: -1 } });
    return res
      .status(config.SUCCESS)
      .send(
        new ApiResponse(
          config.SUCCESS,
          {},
          `You unfollowed ${user?.fristName} ${user?.lastName}`
        )
      );
  }
});

// ------------------------- get followings ------------------------
const getFollowings = asyncHandler(async (req, res) => {
  const { id } = req?.params;
  const user = req?.user;

  const followings = await FollowAndUnfollow.find({ logginUser: id })
    .select("-createdAt -updatedAt -logginUser")
    .populate({
      path: "followUser",
      select:
        "-email -contactNo -password -gender -followers -following -bio -createdAt -updatedAt -refreshToken",
    });
  if (!followings) {
    throw new ApiError(401, "followers not found!!");
  }

  res
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

  const followers = await FollowAndUnfollow.find({ followUser: id })
    .select("-createdAt -updatedAt -followUser")
    .populate({
      path: "logginUser",
      select:
        "-email -contactNo -password -gender -followers -following -bio -createdAt -updatedAt -refreshToken",
    });
  if (!followers) {
    throw new ApiError(401, "followers not found!!");
  }

  res
    .status(200)
    .send(
      new ApiResponse(
        200,
        followers,
        `followings of ${user?.fristName + user?.lastName}`
      )
    );
});
export { followAndUnfollow, getFollowings, getFollowers };
