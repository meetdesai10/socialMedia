import mongoose, { mongo } from "mongoose";
import { config } from "../../config.js";

export async function dbConnect() {
  return await mongoose
    .connect(config.DB_URL)
    .then(() => {
      console.log("dataBase Connect Successfully");
    })
    .catch((error) => {
      console.log("database connection fail", error);
    });
}
