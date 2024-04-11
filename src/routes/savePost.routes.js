import { Router } from "express";
import {
  getAllSavedPost,
  savePost,
} from "../controllers/savePost.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

// ---------------------------- savePost ---------------------------
router.route("/save-unsave-post/:id").post(verifyJwt, savePost);

// ---------------------------- getAllSavedPost---------------------------
router.route("/get-all-save-post/:id").get(verifyJwt, getAllSavedPost);
export default router;
