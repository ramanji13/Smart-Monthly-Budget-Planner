import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Transaction title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"]
    },

    type: {
      type: String,
      required: true,
      enum: ["income", "expense"]
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Salary",
        "Business",
        "Investment",
        "Food",
        "Travel",
        "Shopping",
        "Bills",
        "Education",
        "Healthcare",
        "Entertainment",
        "Other"
      ]
    },

    date: {
      type: Date,
      required: true,
      default: Date.now
    },

    note: {
      type: String,
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters"],
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);

export default Transaction;