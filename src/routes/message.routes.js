import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getMeassages, messageSend } from "../controllers/message.controller.js";

const router = Router();

// send message

router.route("/send/:id").post(verifyJwt, messageSend);

// get message 
router.route("/getMeassages/:id").get(verifyJwt, getMeassages);
export default router;
