import { Router } from "express";
import {
  checkPostSaveOrNot,
  getAllSavedPost,
  savePost,
} from "../controllers/savePost.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

// ---------------------------- savePost ---------------------------
router.route("/save-unsave-post/:id").post(verifyJwt, savePost);

// ---------------------------- getAllSavedPost---------------------------
router.route("/get-all-save-post/:id").get(verifyJwt, getAllSavedPost);

// ------------------------ check post save or not------------------------
router.route("/post-save-or-not/:id").get(verifyJwt, checkPostSaveOrNot);

export default router;
