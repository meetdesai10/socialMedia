import express, { Router } from "express";
import {
  followAndUnfollow,
  getFollowingsAndFollowers,
} from "../controllers/post.conrtollers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

// ----------------------------- follow -------------------------
router.route("/followAndUnfollow/:id").post(verifyJwt, followAndUnfollow);

// ------------------- getFollowers and following -------------------
router
  .route("/getFollowingsAndFollowers/:id")
  .get(verifyJwt, getFollowingsAndFollowers);

export default router;
