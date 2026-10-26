import express from "express";
import mongoose from "mongoose";
import Budget from "../models/Budget.js";

const router = express.Router();

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

// Create a monthly budget
router.post("/", async (req, res) => {
  try {
    const budget = await Budget.create(req.body);

    res.status(201).json({
      message: "Budget created successfully",
      budget
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A budget already exists for this category and month"
      });
    }

    res.status(400).json({
      message: error.message
    });
  }
});

// Get all budgets
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find().sort({
      year: -1,
      month: -1,
      category: 1
    });

    res.json({
      count: budgets.length,
      budgets
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch budgets"
    });
  }
});

// Get budgets for a particular month
router.get("/monthly", async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      return res.status(400).json({
        message: "Provide a valid month and year"
      });
    }

    const budgets = await Budget.find({
      month,
      year
    }).sort({ category: 1 });

    res.json({
      count: budgets.length,
      budgets
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch monthly budgets"
    });
  }
});

// Update a budget
router.put("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid budget ID"
      });
    }

    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found"
      });
    }

    res.json({
      message: "Budget updated successfully",
      budget
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A budget already exists for this category and month"
      });
    }

    res.status(400).json({
      message: error.message
    });
  }
});

// Delete a budget
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid budget ID"
      });
    }

    const budget = await Budget.findByIdAndDelete(
      req.params.id
    );

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found"
      });
    }

    res.json({
      message: "Budget deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete budget"
    });
  }
});

export default router;