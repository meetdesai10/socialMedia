import { Router } from "express";
import {
  forgetPassword,
  getCurrentUserProfile,
  logOutUser,
  loginUser,
  otpVerfication,
  registerUser,
  resetPassword,
  sendMail,
  sideBarUser,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

//--------------------- register user-------------------------
router.route("/register").post(registerUser);

// -------------------------login user------------------------
router.route("/login").post(loginUser);

//------------------------ logout-----------------------------
router.route("/logout").post(verifyJwt, logOutUser);
export default router;
// ---------------------get current users---------------------
router.route("/get-current-user-profile").get(verifyJwt, getCurrentUserProfile);


// ------------------------get user for sidebar---------------
router.route("/get-sider-bar-users").get(verifyJwt, sideBarUser);

//--------------------------- reset password------------------
router.route("/reset-password").post(verifyJwt, resetPassword);

// --------------------------forget password------------------
router.route("/forget-password").post(verifyJwt, forgetPassword);

//---------------------- update Account Details---------------
router.route("/update-account-details").post(verifyJwt, updateAccountDetails);

// ---- send otp mail to user for forgetpassword--------------
router.route("/send-otp-mail").post(sendMail);

// ---------------------- otp verification ------------------
router.route("/verify-otp/:otpClient").post(otpVerfication);
