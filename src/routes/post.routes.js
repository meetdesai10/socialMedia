import { Router } from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
} from "../controllers/post.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

// --------------------------- create post ------------------------------
router.route("/create").post(verifyJwt, upload.fields([{ name: "postImage", maxCount: 1 }]), createPost);

// --------------------------- get posts --------------------------------
router.route("/get-all-posts/:id").get(verifyJwt, getAllPosts);

// --------------------------- get posts --------------------------------
router.route("/delete-post/:id").delete(verifyJwt, deletePost);

// --------------------------- get IndividualPosts -----------------------
router.route("/get-post/:id").get(verifyJwt, getPost);

export default router;
