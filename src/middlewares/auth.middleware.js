import jwt from "jsonwebtoken";
import { ApiError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { config } from "../../config.js";
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  // get token

  const token =
    req?.cookies?.accessToken ||
    req.header("Authorization")?.replace("bearer", "");

  // check if token is available or not

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  // decode token

  const decodedToken = jwt.verify(token, config.accessKey);

  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );

  // check user is exist or not

  if (!user) {
    throw new ApiError(401, "Invalid accessToken");
  }

  req.user = user;
  next();
});
