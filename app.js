import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import cors from "cors";

export const app = express();

// to accept json data
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// to accept all url
app.use(express.urlencoded({ extended: true }));

// to parse cookies
app.use(cookieParser());

//---------------------------- import user router --------------------------------

import userRouter from "./src/routes/user.routes.js";
app.use("/api/v1/users", userRouter);

// ---------------------------- import message router ----------------------------

import messageRouter from "./src/routes/message.routes.js";
app.use("/api/v1/messages", messageRouter);

// --------------------------- import followAndUnfollow router--------------------

import followAndUnfollowRouter from "./src/routes/followAndUnfollow.routes.js";
app.use("/api/v1/followAndUnfollow", followAndUnfollowRouter);

// --------------------------- import post router --------------------------------
import postRouter from "./src/routes/post.routes.js";
app.use("/api/v1/post", postRouter);

// --------------------------- import like router --------------------------------
import likeRouter from "./src/routes/like.routes.js";
app.use("/api/v1/like", likeRouter);

// --------------------------- import reply router --------------------------------
import replyRouter from "./src/routes/replyPost.routes.js";
app.use("/api/v1/reply", replyRouter);
