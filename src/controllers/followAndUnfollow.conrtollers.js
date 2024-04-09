import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { config } from "../../config.js";
// -------------------followAndUnfollow--------------------------

const followAndUnfollow = asyncHandler(async (req, res) => {
  const { id } = req?.params;
  const loggedInUser = req?.user?._id;
  // check user is exist or not

  const user = await User.findById(id);
  const currentUser = await User.findById(loggedInUser);
  if (!(user && currentUser)) {
    throw new ApiError(config.BAD_REQUEST, "User not found!!");
  }

  if (id === loggedInUser.toString()) {
    throw new ApiError(
      config.BAD_REQUEST,
      "You can't follow or unFollow your self!!"
    );
  }

  // check user following or not

  const isFollowing = currentUser?.following?.includes(id);

  if (isFollowing) {
    // unfollow user
    await User.findByIdAndUpdate(loggedInUser, { $pull: { following: id } });
    await User.findByIdAndUpdate(id, {
      $pull: { followers: loggedInUser },
    });
    return res
      .status(config.SUCCESS)
      .json(
        new ApiResponse(
          config.SUCCESS,
          {},
          `you unFollowed ${user?.fristName} ${user?.lastName}`
        )
      );
  } else {
    // follow user
    await User.findByIdAndUpdate(loggedInUser, { $push: { following: id } });
    await User.findByIdAndUpdate(id, {
      $push: { followers: loggedInUser },
    });
    return res
      .status(config.SUCCESS)
      .json(
        new ApiResponse(
          config.SUCCESS,
          {},
          `you followed ${user?.fristName} ${user?.lastName}`
        )
      );
  }
});

// ------------------------- get followers and followings ------------------------

const getFollowingsAndFollowers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // check id

  if (!id) {
    throw new ApiError(401, "please provide user ID");
  }

  //   find user
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(401, "Invalid user Id!!");
  }
  // followers
  const userFollower = await user.populate({
    path: "followers",
    select: "-password -refreshToken -followers -following",
  });

  //   followings

  const userFollowing = await user.populate({
    path: "following",
    select: "-password -refreshToken -followers -following",
  });

  //   checkUser

  //   if (user.following.length == 0) {
  //     throw new ApiError(401, "no followings found!!");
  //   }
  res.status(200).json(
    new ApiResponse(config.SUCCESS, {
      followers: userFollower?.followers,
      followings: userFollowing?.following,
    })
  );
});
export { followAndUnfollow, getFollowingsAndFollowers };
