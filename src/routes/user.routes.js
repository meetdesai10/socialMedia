import { Router } from "express";
import {
  logOutUser,
  loginUser,
  registerUser,
  sideBarUser,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

// register user
router.route("/register").post(registerUser);

// login user
router.route("/login").post(loginUser);

// logout
router.route("/logOut").post(verifyJwt, logOutUser);
export default router;

// get user for sidebar
router.route("/getSiderBarUsers").get(verifyJwt, sideBarUser);
