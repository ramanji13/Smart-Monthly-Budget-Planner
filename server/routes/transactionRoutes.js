import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const router = express.Router();

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

// Create a transaction
router.post("/", async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);

    res.status(201).json({
      message: "Transaction added successfully",
      transaction
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Get all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({
      date: -1,
      createdAt: -1
    });

    res.json({
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transactions"
    });
  }
});

// Get one transaction
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid transaction ID"
      });
    }

    const transaction = await Transaction.findById(
      req.params.id
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transaction"
    });
  }
});

// Update a transaction
router.put("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid transaction ID"
      });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    res.json({
      message: "Transaction updated successfully",
      transaction
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Delete a transaction
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid transaction ID"
      });
    }

    const transaction = await Transaction.findByIdAndDelete(
      req.params.id
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    res.json({
      message: "Transaction deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete transaction"
    });
  }
});

export default router;