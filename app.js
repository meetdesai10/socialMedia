import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import cors from "cors";

export const app = express();

// to accept json data
app.use(express.json());

// cors
// app.use(
//   cors({
//     origin: "http://localhost:8000",
//     credentials: true,
//   })
// );

app.use(cors());

// to accept all url
app.use(express.urlencoded({ extended: true }));

// to parse cookies
app.use(cookieParser());

//---------------------------- import user router --------------------------------

import userRouter from "./src/routes/user.routes.js";
app.use("/api/v1/users", userRouter);

// ---------------------------- import message router ------------------------------

import messageRouter from "./src/routes/message.routes.js";
app.use("/api/v1/messages", messageRouter);

// --------------------------- import post router-----------------------------------

import postRouter from "./src/routes/post.routes.js";
app.use("/api/v1/post", postRouter);
