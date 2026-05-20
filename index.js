// Entry file
import { connectDB } from "./src/config/db.js";
import http from "http";
import {app} from "./app.js"

import dotenv from "dotenv";
dotenv.config();

const startServe = async () => {
  await connectDB();
  const server = http.createServer(app);

  server.listen(process.env.PORT, () => {
    console.log("The server is running on PORT : " + process.env.PORT);
  })
};

startServe().catch((error) => {
  console.log("Error while starting the Server : ", error);
  process.exit(1);
})
