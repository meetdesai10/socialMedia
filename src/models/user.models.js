import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../config.js";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "pelase provide fristname"],
    },
    fristName: {
      type: String,
      required: [true, "pelase provide fristname"],
    },
    lastName: {
      type: String,
      require: [true, "plase provide lastname"],
    },
    email: {
      type: String,
      required: [true, "please provide email"],
      trim: true,
      lowercase: true,
      validator: {
        validate: (value) => validator.isEmail(value),
        message: "please provide valid email",
      },
    },
    contactNo: {
      type: String,
      required: [true, "please provide your contact number"],
      trim: true,
      validator: {
        validate: (value) => validator.isMobilePhone(value),
        message: "please provide valid mobile number",
      },
    },
    password: {
      type: String,
      required: [true, "please provide password"],
      validator: {
        validate: (value) => validator.isStrongPassword(value),
        message: "password is not valid",
      },
    },
    DOB: {
      type: Date,
      validator: {
        validate: (value) => validator.isDate(value),
        message: "please enter valid brith of date",
      },
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
      lowercase: true,
    },
    address: {
      line: String,
      city: String,
      state: String,
      country: String,
      pinCode: String,
    },
    followers: Number,
    postCount: Number,
    following: Number,
    caption: String,
    profilePic: String,
    refreshToken: String,
  },
  { timestamps: true }
);

// secure password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// check password function

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generate accessToken

userSchema.methods.generateAccessToken = async function () {
  console.log("---------------generate token----------------");
  return jwt.sign(
    {
      _id: this._id,
      email: this._email,
      userName: this.userName,
      fristName: this.fristName,
      lastName: this.lastName,
    },
    config.accessKey,
    { expiresIn: config.accessExpiry }
  );
};

userSchema.methods.generaterefreshToken = async function () {
  console.log("-------------------- referesh token---------------");
  return jwt.sign(
    {
      _id: this._id,
    },
    config.refereshKey,
    {
      expiresIn: "30d",
    }
  );
};

export const User = mongoose.model("User", userSchema);
