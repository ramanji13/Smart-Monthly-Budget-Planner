import express from "express";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

const router = express.Router();

router.get("/", async (req, res) => {
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

    const startDate = new Date(
      Date.UTC(year, month - 1, 1)
    );

    const endDate = new Date(
      Date.UTC(year, month, 1)
    );

    const [transactions, budgets] = await Promise.all([
      Transaction.find({
        date: {
          $gte: startDate,
          $lt: endDate
        }
      }),

      Budget.find({
        month,
        year
      })
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;

    const categoryTotals = {};

    for (const transaction of transactions) {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;

        categoryTotals[transaction.category] =
          (categoryTotals[transaction.category] || 0) +
          transaction.amount;
      }
    }

    const totalBudget = budgets.reduce(
      (sum, budget) => sum + budget.limit,
      0
    );

    const categorySpending = Object.entries(
      categoryTotals
    ).map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2))
    }));

    const budgetDetails = budgets.map((budget) => {
      const spent = categoryTotals[budget.category] || 0;
      const remaining = budget.limit - spent;

      return {
        _id: budget._id,
        category: budget.category,
        budgetLimit: budget.limit,
        spent: Number(spent.toFixed(2)),
        remaining: Number(remaining.toFixed(2)),
        exceeded: remaining < 0
      };
    });

    res.json({
      month,
      year,
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      balance: Number(
        (totalIncome - totalExpenses).toFixed(2)
      ),
      totalBudget: Number(totalBudget.toFixed(2)),
      budgetRemaining: Number(
        (totalBudget - totalExpenses).toFixed(2)
      ),
      transactionCount: transactions.length,
      categorySpending,
      budgets: budgetDetails
    });
  } catch (error) {
    console.error("Summary error:", error.message);

    res.status(500).json({
      message: "Failed to generate monthly summary"
    });
  }
});

export default router;