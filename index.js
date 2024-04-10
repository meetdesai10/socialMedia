import { app } from "./app.js";
import { config } from "./config.js";
import { dbConnect } from "./src/db/dbConnection.js";

const port = config.port || 9999;

dbConnect()
  .then(() => {
    app.listen(port, () => {
      console.log(`server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("somthig went wrong", error);
  });


// PORT = 8000
// DB_URL = mongodb + srv://meetdesai10:Meet1008@cluster0.zcopetw.mongodb.net/socialMedia
// # DB_URL = mongodb://localhost:27017/socialMedia
// ACCESSTOKEN_SECRATE = dhaslasjdhashdu464654asdis7asmo@#d&%^%&
//   REFERESHTOKEN_SECRATE=sdhasodsdh ^%# * B)U# *& T#G# & (GT#) dsdas
// ACCESSTOKEN_EXPIRY = 1h