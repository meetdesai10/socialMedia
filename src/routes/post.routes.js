import { Router } from "express";
import { createPost } from "../controllers/post.controller.js";
const router = Router();

// --------------------------- create post --------------------------

router.route("/create").post(createPost);

export default router;
