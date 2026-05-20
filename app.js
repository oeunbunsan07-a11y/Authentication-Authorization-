import express from "express"
import cookieParser from "cookie-parser";

import authRouter from "./src/routes/auth.route.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);

app.get("/health", (_req, res) => {
  res.json({
    status : "ok"
  })
})



