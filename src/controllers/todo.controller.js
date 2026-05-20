// controllers/todo.controller.js

import  {Todo}  from "../models/tood.model.js";

/**
 * @desc    Create new todo
 * @route   POST /api/todos
 * @access  Private
 */
export const createTodo = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const todo = await Todo.create({
      userId: req.user.id, // assuming auth middleware adds req.user
      title,
      description,
      status,
      priority,
      dueDate,
    });

    return res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: todo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all todos of logged-in user
 * @route   GET /api/todos
 * @access  Private
 */
export const getTodos = async (req, res) => {
  try {
    const { status, priority } = req.query;

    const filter = {
      userId: req.user.id,
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const todos = await Todo.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: todos.length,
      data: todos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get single todo
 * @route   GET /api/todos/:id
 * @access  Private
 */
export const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update todo
 * @route   PUT /api/todos/:id
 * @access  Private
 */
export const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Todo updated successfully",
      data: todo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete todo
 * @route   DELETE /api/todos/:id
 * @access  Private
 */
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
