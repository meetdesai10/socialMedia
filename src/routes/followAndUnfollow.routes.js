import { Router } from "express";
import {
  followAndUnfollow,
  getFollowers,
  getFollowings,
} from "../controllers/followAndUnfollow.conrtollers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

// ----------------------------- follow -------------------------
router.route("/follow-and-unfollow/:id").post(verifyJwt, followAndUnfollow);

// ------------------- getfollowing -----------------------------
router.route("/get-followings/:id").get(verifyJwt, getFollowings);

// ------------------- getFollowers------------------------------
router.route("/get-followers/:id").get(verifyJwt, getFollowers);

export default router;
