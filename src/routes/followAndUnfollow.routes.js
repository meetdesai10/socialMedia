import { Router } from "express";
import {
  followAndUnfollow,
  getFollowingsAndFollowers,
} from "../controllers/followAndUnfollow.conrtollers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

// ----------------------------- follow -------------------------
router.route("/follow-and-unfollow/:id").post(verifyJwt, followAndUnfollow);

// ------------------- getFollowers and following -------------------
router
  .route("/get-followings-and-followers/:id")
  .get(verifyJwt, getFollowingsAndFollowers);

export default router;
