import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"

import authRouter from "./src/routes/auth.route.js";
import todoRouter from "./src/routes/todo.route.js"

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use('/api/auth', authRouter);
app.use("/api/todos", todoRouter);


app.get("/health", (_req, res) => {
  res.json({
    status : "ok"
  })
})



