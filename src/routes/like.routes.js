import { Router } from "express";
import { likeUnlikes, postAllLikes } from "../controllers/like.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

// --------------------------- likesUnlikes ------------------------------
router.route("/like-unlike/:id").get(verifyJwt, likeUnlikes);

// --------------------------- get post all likes ------------------------
router.route("/get-likes/:id").get(verifyJwt, postAllLikes);

export default router;
