import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dunkpcx1f",
  api_key: "768621355784659",
  api_secret: "1LYct_xT9WxrnsCE5f1-4Wov7WA",
});

async function uploadOnCloudinary(localFilePath) {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    console.log("file uploaded successfully on cloudinary", response?.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log(": uploadOnCloudinary -> error", error);
    fs.unlinkSync(localFilePath); //remove the locally save temporary file as the upload operation got failed
    return null;
  }
}

export { uploadOnCloudinary };
