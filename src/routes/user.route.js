import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  res.send("memememem")
})

export default router;
