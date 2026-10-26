import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
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

    limit: {
      type: Number,
      required: true,
      min: [0.01, "Budget must be greater than zero"]
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },

    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100
    }
  },
  {
    timestamps: true
  }
);

budgetSchema.index(
  {
    category: 1,
    month: 1,
    year: 1
  },
  {
    unique: true
  }
);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;