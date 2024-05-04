import { app } from "./app.js";
import { config } from "./config.js";
import { dbConnect } from "./src/db/dbConnection.js";
import { User } from "./src/models/user.model.js";

const port = config.port || 9999;

dbConnect()
  .then(async () => {
    app.listen(port, () => {
      console.log(`server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("somthig went wrong", error);
  });




