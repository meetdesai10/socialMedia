import mongoose from "mongoose";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { config } from "../../config.js";

// ----------------- cookie options --------------------
const options = {
  httpOnly: true,
  secure: true,
  path: "/",
};

// ----------------- methods -----------------

// generate referesh and accesstoken

async function generateAccessAndrefreshToken(userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    console.log(
      "🚀 ~ generateAccessAndrefreshToken ~ accessToken:",
      accessToken
    );
    const refreshToken = await user.generaterefreshToken();
    console.log("refreshToken:", refreshToken);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(config.INTERNAL_SERVER_ERROR, error);
  }
}

// ---------------------------- register user controller --------------------------------

const registerUser = asyncHandler(async (req, res) => {
  const {
    userName,
    fristName,
    lastName,
    email,
    contactNo,
    password,
    confirmPassword,
    gender,
  } = req.body;

  //  check all fields that are required

  if (
    [
      userName,
      fristName,
      lastName,
      email,
      contactNo,
      password,
      gender,
      confirmPassword,
    ].some((item) => item?.trim() == "")
  ) {
    throw new ApiError(config.BAD_REQUEST, "all markeble feilds are required");
  }

  // check password and confirmpassword same or not
  if (password !== confirmPassword) {
    throw new ApiError(401, "password and confirmpassword does not match!");
  }
  // check user exist or not in database

  const isUserExist = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (isUserExist) {
    throw new ApiError(config.BAD_REQUEST, "User already exist");
  }

  // entry in database

  const user = await User.create({
    userName,
    fristName,
    lastName,
    gender,
    email,
    contactNo,
    password,
  });

  // check user successfully created or not

  const isUserCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        config.SUCCESS,
        isUserCreated,
        "user register successfully"
      )
    );
});

// ---------------------------- login user controller --------------------------------

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  // check username or password

  if (!(userName || email)) {
    throw new ApiError(config.BAD_REQUEST, "username or email requried");
  }

  // check user exist or not

  const isUserExist = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!isUserExist) {
    throw new ApiError(config.BAD_REQUEST, "user does not exist");
  }

  // check password is correct or not

  const isPasswordCorrect = await isUserExist.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(config.BAD_REQUEST, "wrong password");
  }

  // call refresh token and access token

  const { accessToken, refreshToken } = await generateAccessAndrefreshToken(
    isUserExist?._id
  );

  await User.findByIdAndUpdate(
    isUserExist._id,
    {
      $set: {
        refreshToken,
      },
    },
    {
      new: true,
    }
  );

  //  check user loggin or not

  const loggedInUser = await User.findById(isUserExist?._id).select(
    "-password -refreshToken"
  );

  // send response
  res
    .cookie("accessToken", accessToken, options)
    .status(config.SUCCESS)
    .json(
      new ApiResponse(
        config.SUCCESS,
        { user: loggedInUser, accessToken },
        "loggedIn successfully!"
      )
    );
});

// ---------------------------- logout user controller --------------------------------

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User logged Out" });
});

export { registerUser, loginUser, logOutUser };
