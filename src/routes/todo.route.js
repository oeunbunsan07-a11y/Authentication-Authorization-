// routes/todo.route.js

import express from "express";

import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
} from "../controllers/todo.controller.js";

// import your auth middleware
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

/**
 * @route   /api/todos
 */

// Create Todo
router.post("/", requireAuth, createTodo);

// Get All Todos
router.get("/", requireAuth, getTodos);

/**
 * @route   /api/todos/:id
 */

// Get Single Todo
router.get("/:id", requireAuth, getTodoById);

// Update Todo
router.put("/:id", requireAuth, updateTodo);

// Delete Todo
router.delete("/:id", requireAuth, deleteTodo);

export default router;
