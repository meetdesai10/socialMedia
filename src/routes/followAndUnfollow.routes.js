import { Router } from "express";
import {
  acceptRequest,
  follow,
  getFollowers,
  getFollowings,
  rejectRequest,
  unFollow,
} from "../controllers/followAndUnfollow.conrtollers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

// ----------------------------- follow -------------------------
router.route("/follow/:id").post(verifyJwt, follow);

// ----------------------------- follow -------------------------
router.route("/unfollow/:id").post(verifyJwt, unFollow);

// ----------------------------- follow -------------------------
router.route("/acceptRequest/:senderId").post(verifyJwt, acceptRequest);

// ----------------------------- follow -------------------------
router.route("/rejectRequest/:senderId").post(verifyJwt, rejectRequest);

// ------------------- getfollowing -----------------------------
router.route("/get-followings/:id").get(verifyJwt, getFollowings);

// ------------------- getFollowers------------------------------
router.route("/get-followers/:id").get(verifyJwt, getFollowers);

export default router;
