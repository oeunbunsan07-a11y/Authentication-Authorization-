// Entry file
import { connectDB } from "./src/config/db.js";
import http from "http";
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    const server = http.createServer(app);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on PORT: ${PORT}`);
    });
  } catch (error) {
    console.log("Error while starting the Server:", error);
    process.exit(1);
  }
};

startServer();
