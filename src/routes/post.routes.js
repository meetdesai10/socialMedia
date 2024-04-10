import { Router } from "express";
import { createPost, deletePost, getPosts } from "../controllers/post.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

// --------------------------- create post ----------------------------
router.route("/create").post(verifyJwt, createPost);

// --------------------------- get posts ----------------------------
router.route("/get-posts").get(verifyJwt, getPosts);

// --------------------------- get posts ----------------------------
router.route("/delete-post/:id").delete(verifyJwt, deletePost);

export default router;
