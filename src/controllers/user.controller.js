import nodemailer from "nodemailer";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { config } from "../../config.js";
import crypto from "crypto";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
// ----------------- cookie options --------------------
const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
const thirtyDaysInMilliseconds = 30 * oneDayInMilliseconds;
const options = {
  maxAge: thirtyDaysInMilliseconds,
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

// ----------------- methods -----------------

//-------------------------------- generate referesh and accesstoken-----------------
async function generateAccessAndrefreshToken(userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generaterefreshToken();
    console.log("refreshToken:", refreshToken);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(config.INTERNAL_SERVER_ERROR, error);
  }
}

// ---------------------------------------generate otp -------------------------------

function generateOTP(length) {
  if (length <= 0 || length > 10) {
    throw new Error("Invalid OTP length. Length should be between 1 and 10.");
  }

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  // Generate a random number within the specified range
  const otp = Math.floor(min + Math.random() * (max - min + 1));
  return otp.toString();
}

// =============================================API's====================================

// ---------------------------- register user controller -----------------------------

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
    privateAccount,
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
    privateAccount: privateAccount ? privateAccount : false,
  });

  // check user successfully created or not

  const isUserCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .send(
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
    throw new ApiError(401, "wrong password");
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
    .send(
      new ApiResponse(
        config.SUCCESS,
        { loggedInUser, accessToken },
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
    .send({ message: "User logged Out" });
});

// ------------------------- get sidebar users ----------------------------------------

const getAllUser = asyncHandler(async (req, res) => {
  const loggedInUser = req.user?._id;
  const filterUsers = await User.find().select(
    "-password -refreshToken -updatedAt -createdAt"
  );
  if (!filterUsers)
    throw new ApiError(500, "somthing went wrong while fetching all users");

  return res.status(config.SUCCESS).send(config.SUCCESS, filterUsers);
});

// -------------------------------reset password --------------------------------------

const resetPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req?.body;
  const { _id } = req?.user;

  // find user

  const user = await User.findById(_id);

  // check old password

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password!!");
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(401, "new and confirm password does not match!!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .send(
      new ApiResponse(
        config.SUCCESS,
        {},
        "you password has been changed successfully!!"
      )
    );
});

// -------------------------------- forget password -----------------------------------

const forgetPassword = asyncHandler(async (req, res) => {
  const { newPassword, confirmPassword } = req?.body;
  const { _id } = req?.user;

  // find user

  const user = await User.findById(_id);

  if (newPassword !== confirmPassword) {
    throw new ApiError(401, "new and confirm password does not match");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .send(new ApiResponse(config.SUCCESS, {}, "password forget successfully"));
});

// ------------------------------------- upload profile----------------------------------
const profilePicture = asyncHandler(async (req, res) => {
  const profilePictureLocalPath = req?.files?.profilePic?.[0]?.path;
  if (!profilePictureLocalPath) {
    throw new ApiError(401, "profilepic is required!!");
  }

  const propic = await uploadOnCloudinary(profilePictureLocalPath);
  if (!propic?.url) {
    throw new ApiError(
      500,
      "somthign has been wrong while uoploading image on cloudinary"
    );
  }
  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      profilePic: propic?.url,
    },
    { new: true }
  );

  if (!user) {
    throw new ApiError(
      500,
      "somthing has been wrong while set propic url in the user details"
    );
  }

  return res
    .status(200)
    .send(
      new ApiResponse(200, user?.profilePic, "Image uploaded successfully!!")
    );
});

// --------------------------------- update account details ---------------------------

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { userName, fristName, lastName, email, contactNo, gender } = req?.body;

  if (
    [userName, fristName, lastName, email, contactNo, gender].some(
      (item) => item?.trim() == ""
    )
  ) {
    throw new ApiError(401, "all markable fields are required!!");
  }

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: { userName, fristName, lastName, email, contactNo, gender },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .send(
      new ApiResponse(
        config.SUCCESS,
        user,
        "account details updated successfully"
      )
    );
});

// ----------------------------------- get current user profile -----------------------
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const { _id } = req?.user;
  const user = await User.findOne(_id).select("-password -refreshToken");

  res.status(config.SUCCESS).send(config.SUCCESS, user);
});

// --------------------------------------get User Profile --------------------------------
const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req?.params;
  const user = await User.findOne({ _id: id }).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(401, "User not found!!");
  }
  return res.status(200).send(new ApiResponse(200, user));
});

// -------------------------------- send mail------------------------------------------
const sendMail = asyncHandler(async (req, res, next) => {
  const { email } = req?.body;
  // check email
  if (!email) {
    throw new ApiError(401, "please provide email Id!!");
  }

  // check useris exis or not
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(
      401,
      "enter your email address that you used for register!!"
    );
  }

  // connect with the smtp server
  const transporter = await nodemailer.createTransport({
    service: "gmail",
    secure: false,
    auth: {
      user: "dmeet1008@gmail.com",
      pass: "ckad jvpq nrwm tcoc",
    },
  });

  // check transporter
  if (!transporter) {
    throw new ApiError(
      config.INTERNAL_SERVER_ERROR,
      "something went wrong in transporter"
    );
  }

  // generate otp
  const otp = await generateOTP(4, email);
  if (!otp) {
    throw new ApiError(
      config.INTERNAL_SERVER_ERROR,
      "somthing went wrong while generating otp"
    );
  }

  // set otp to user
  const otpVerification = {
    otp,
    email,
  };

  user.otpDetails = otpVerification;
  await user.save({ validateBeforeSave: false });
  // send mail
  const info = await transporter.sendMail({
    from: email, // sender address
    to: "dmeet1008@gmail.com", // list of receivers
    subject: "Hello meet desai ✔", // Subject line
    html: `<b>your otp is ${otp} !!</b>`, // html body
  });

  // check mail send or not
  if (!info) {
    throw new ApiError(
      config.INTERNAL_SERVER_ERROR,
      "something went wrong while sending mail"
    );
  }
  return res.status(config.SUCCESS).send(
    new ApiResponse(config.SUCCESS, {
      message: `mail has been send successfully!!`,
      email,
    })
  );

  next();
});

// ---------------------------------- otp verification -----------------------------------
const otpVerfication = asyncHandler(async (req, res) => {
  const { otpClient } = req?.params;
  const { email } = req?.body;
  const user = await User.findOne({ email });

  if (otpClient.toString() !== user?.otpDetails?.otp) {
    throw new ApiError(401, "invalid or wrong otp!!");
  }
  user?.isVarify=true;
   user.save();
  return res
    .status(200)
    .send(new ApiResponse(200, {}, "verified successfully!!"));
});

//---------------------------------- export all files ---------------------------------

export {
  registerUser,
  loginUser,
  getCurrentUserProfile,
  logOutUser,
  getAllUser,
  forgetPassword,
  profilePicture,
  resetPassword,
  updateAccountDetails,
  sendMail,
  otpVerfication,
  getUserProfile,
};
