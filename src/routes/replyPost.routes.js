import { Router } from "express";
import { commentOnPost, deleteComment, postAllComment } from "../controllers/replyPost.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

// --------------------------- comment -------------------------------
router.route("/comment").post(verifyJwt, commentOnPost);

// --------------------------- post all comment -------------------------------
router.route("/getAllComments/:id").get(verifyJwt, postAllComment);

// --------------------------- delete comment -------------------------------
router.route("/delete-comments/:id").get(verifyJwt, deleteComment);
export default router;
