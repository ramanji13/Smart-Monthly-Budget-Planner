import { useCallback, useEffect, useState } from "react";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  RefreshCw,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  ReceiptText,
  CalendarDays,
  CircleDollarSign
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import {
  getMonthlySummary,
  getTransactions,
  createTransaction,
  deleteTransaction,
  getBudgets,
  createBudget,
  deleteBudget
} from "./services/api";

const INCOME_CATEGORIES = [
  "Salary",
  "Business",
  "Investment",
  "Other"
];

const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Education",
  "Healthcare",
  "Entertainment",
  "Other"
];

const CHART_COLORS = [
  "#16a36a",
  "#4c8bf5",
  "#f59e0b",
  "#e76f51",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#64748b"
];

const EMPTY_SUMMARY = {
  totalIncome: 0,
  totalExpenses: 0,
  balance: 0,
  totalBudget: 0,
  budgetRemaining: 0,
  transactionCount: 0,
  categorySpending: [],
  budgets: []
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  });
}

function getCurrentDate() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    date: [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("-")
  };
}

function App() {
  const currentDate = getCurrentDate();

  const [month, setMonth] = useState(currentDate.month);
  const [year, setYear] = useState(currentDate.year);

  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [transactionForm, setTransactionForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: currentDate.date,
    note: ""
  });

  const [budgetForm, setBudgetForm] = useState({
    category: "Food",
    limit: ""
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        summaryData,
        transactionData,
        budgetData
      ] = await Promise.all([
        getMonthlySummary(month, year),
        getTransactions(),
        getBudgets(month, year)
      ]);

      setSummary({
        ...EMPTY_SUMMARY,
        ...summaryData
      });

      setTransactions(
        transactionData.transactions || []
      );

      setBudgets(
        budgetData.budgets || []
      );
    } catch (err) {
      setError(
        err.message ||
        "Could not load dashboard data. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const monthlyTransactions = transactions.filter(
    (transaction) => {
      const date = new Date(transaction.date);

      return (
        date.getUTCMonth() + 1 === month &&
        date.getUTCFullYear() === year
      );
    }
  );

  function handleTransactionFieldChange(event) {
    const { name, value } = event.target;

    setTransactionForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "type"
        ? {
            category:
              value === "income"
                ? "Salary"
                : "Food"
          }
        : {})
    }));
  }

  async function handleTransactionSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const amount = Number(transactionForm.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    try {
      setSaving(true);

      await createTransaction({
        ...transactionForm,
        amount
      });

      setTransactionForm({
        title: "",
        amount: "",
        type: "expense",
        category: "Food",
        date: currentDate.date,
        note: ""
      });

      setSuccess("Transaction added successfully.");

      await loadData();
    } catch (err) {
      setError(
        err.message || "Could not add the transaction."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleTransactionDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteTransaction(id);

      setSuccess("Transaction deleted successfully.");

      await loadData();
    } catch (err) {
      setError(
        err.message || "Could not delete the transaction."
      );
    }
  }

  async function handleBudgetSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const limit = Number(budgetForm.limit);

    if (!Number.isFinite(limit) || limit <= 0) {
      setError("Enter a budget limit greater than zero.");
      return;
    }

    try {
      setSaving(true);

      await createBudget({
        category: budgetForm.category,
        limit,
        month,
        year
      });

      setBudgetForm({
        category: "Food",
        limit: ""
      });

      setSuccess("Monthly budget created successfully.");

      await loadData();
    } catch (err) {
      setError(
        err.message ||
        "Could not create the budget. A budget for this category and month may already exist."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleBudgetDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteBudget(id);

      setSuccess("Budget deleted successfully.");

      await loadData();
    } catch (err) {
      setError(
        err.message || "Could not delete the budget."
      );
    }
  }

  const expenseChartData = summary.categorySpending || [];

  const comparisonData = [
    {
      name: "Income",
      amount: summary.totalIncome
    },
    {
      name: "Expenses",
      amount: summary.totalExpenses
    }
  ];

  const recentTransactions = [...monthlyTransactions]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

  const monthOptions = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const yearOptions = Array.from(
    { length: 11 },
    (_, index) => currentDate.year - 5 + index
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Wallet size={25} />
          </div>

          <div>
            <h1>BudgetWise</h1>
            <p>Monthly Budget Planner</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-link active">
            <CircleDollarSign size={19} />
            <span>Dashboard</span>
          </a>

          <a href="#transactions" className="nav-link">
            <ReceiptText size={19} />
            <span>Transactions</span>
          </a>

          <a href="#budgets" className="nav-link">
            <PiggyBank size={19} />
            <span>Budgets</span>
          </a>

          <a href="#analytics" className="nav-link">
            <TrendingUp size={19} />
            <span>Analytics</span>
          </a>
        </nav>

        <div className="sidebar-note">
          <div className="note-icon">
            <PiggyBank size={20} />
          </div>

          <h3>Build better habits</h3>

          <p>
            Track your spending, set limits, and make
            smarter financial decisions every month.
          </p>
        </div>

        <div className="sidebar-footer">
          Smart Monthly Budget Planner
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h2 id="dashboard">Dashboard</h2>
            <p className="topbar-subtitle">
              Understand your money at a glance.
            </p>
          </div>

          <div className="period-controls">
            <CalendarDays size={18} />

            <select
              aria-label="Select month"
              value={month}
              onChange={(event) =>
                setMonth(Number(event.target.value))
              }
            >
              {monthOptions.map((monthName, index) => (
                <option key={monthName} value={index + 1}>
                  {monthName}
                </option>
              ))}
            </select>

            <select
              aria-label="Select year"
              value={year}
              onChange={(event) =>
                setYear(Number(event.target.value))
              }
            >
              {yearOptions.map((yearValue) => (
                <option key={yearValue} value={yearValue}>
                  {yearValue}
                </option>
              ))}
            </select>

            <button
              className="icon-button refresh-button"
              type="button"
              onClick={loadData}
              title="Refresh dashboard"
              aria-label="Refresh dashboard"
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={loading ? "spinning" : ""}
              />
            </button>
          </div>
        </header>

        {error && (
          <div className="alert alert-error" role="alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="status">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-panel">
            <RefreshCw className="spinning" size={28} />
            <p>Loading your financial overview...</p>
          </div>
        ) : (
          <>
            <section className="summary-grid">
              <article className="summary-card income-card">
                <div className="summary-card-top">
                  <div className="summary-icon income-icon">
                    <TrendingUp size={21} />
                  </div>

                  <span className="summary-label">
                    Total Income
                  </span>
                </div>

                <h3>{formatCurrency(summary.totalIncome)}</h3>

                <p>
                  <ArrowUpRight size={15} />
                  Money received this month
                </p>
              </article>

              <article className="summary-card expense-card">
                <div className="summary-card-top">
                  <div className="summary-icon expense-icon">
                    <TrendingDown size={21} />
                  </div>

                  <span className="summary-label">
                    Total Expenses
                  </span>
                </div>

                <h3>{formatCurrency(summary.totalExpenses)}</h3>

                <p>
                  <ArrowDownRight size={15} />
                  Money spent this month
                </p>
              </article>

              <article className="summary-card balance-card">
                <div className="summary-card-top">
                  <div className="summary-icon balance-icon">
                    <Wallet size={21} />
                  </div>

                  <span className="summary-label">
                    Available Balance
                  </span>
                </div>

                <h3>{formatCurrency(summary.balance)}</h3>

                <p>
                  Income minus expenses
                </p>
              </article>

              <article className="summary-card budget-card">
                <div className="summary-card-top">
                  <div className="summary-icon budget-icon">
                    <PiggyBank size={21} />
                  </div>

                  <span className="summary-label">
                    Total Budget
                  </span>
                </div>

                <h3>{formatCurrency(summary.totalBudget)}</h3>

                <p>
                  {budgets.length} budget
                  {budgets.length === 1 ? "" : "s"} set
                  this month
                </p>
              </article>
            </section>

            <section className="content-panel add-transaction-panel">
              <div className="panel-heading">
                <div>
                  <h3>Add a Transaction</h3>
                  <p>
                    Record income or expenses to keep your
                    finances up to date.
                  </p>
                </div>
              </div>

              <form
                className="transaction-form"
                onSubmit={handleTransactionSubmit}
              >
                <div className="form-field">
                  <label htmlFor="transactionTitle">
                    Transaction name
                  </label>

                  <input
                    id="transactionTitle"
                    name="title"
                    type="text"
                    value={transactionForm.title}
                    onChange={handleTransactionFieldChange}
                    placeholder="e.g. Grocery shopping"
                    maxLength="100"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="transactionAmount">
                    Amount (₹)
                  </label>

                  <input
                    id="transactionAmount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={handleTransactionFieldChange}
                    placeholder="e.g. 1500"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="transactionType">
                    Transaction type
                  </label>

                  <select
                    id="transactionType"
                    name="type"
                    value={transactionForm.type}
                    onChange={handleTransactionFieldChange}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="transactionCategory">
                    Category
                  </label>

                  <select
                    id="transactionCategory"
                    name="category"
                    value={transactionForm.category}
                    onChange={handleTransactionFieldChange}
                  >
                    {(transactionForm.type === "income"
                      ? INCOME_CATEGORIES
                      : EXPENSE_CATEGORIES
                    ).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="transactionDate">
                    Date
                  </label>

                  <input
                    id="transactionDate"
                    name="date"
                    type="date"
                    value={transactionForm.date}
                    onChange={handleTransactionFieldChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="transactionNote">
                    Note (optional)
                  </label>

                  <input
                    id="transactionNote"
                    name="note"
                    type="text"
                    value={transactionForm.note}
                    onChange={handleTransactionFieldChange}
                    placeholder="Add a short note"
                    maxLength="500"
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={saving}
                  >
                    <Plus size={18} />
                    {saving ? "Saving..." : "Add Transaction"}
                  </button>
                </div>
              </form>
            </section>

            <section
              className="content-panel"
              id="budgets"
            >
              <div className="panel-heading">
                <div>
                  <h3>Monthly Budget Management</h3>
                  <p>
                    Set a spending limit for each expense category.
                  </p>
                </div>
              </div>

              <form
                className="budget-form"
                onSubmit={handleBudgetSubmit}
              >
                <div className="form-field">
                  <label htmlFor="budgetCategory">
                    Expense category
                  </label>

                  <select
                    id="budgetCategory"
                    value={budgetForm.category}
                    onChange={(event) =>
                      setBudgetForm({
                        ...budgetForm,
                        category: event.target.value
                      })
                    }
                  >
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="budgetLimit">
                    Monthly limit (₹)
                  </label>

                  <input
                    id="budgetLimit"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={budgetForm.limit}
                    onChange={(event) =>
                      setBudgetForm({
                        ...budgetForm,
                        limit: event.target.value
                      })
                    }
                    placeholder="e.g. 5000"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={saving}
                  >
                    <Plus size={18} />
                    {saving ? "Saving..." : "Set Budget"}
                  </button>
                </div>
              </form>

              <div className="managed-budget-list">
                <h4>Budgets for the selected month</h4>

                {budgets.length === 0 ? (
                  <p className="budget-empty">
                    No budgets created for this month yet.
                  </p>
                ) : (
                  budgets.map((budget) => (
                    <div
                      className="managed-budget-row"
                      key={budget._id}
                    >
                      <div>
                        <strong>{budget.category}</strong>

                        <span>
                          {formatCurrency(budget.limit)} per month
                        </span>
                      </div>

                      <button
                        className="delete-button"
                        type="button"
                        onClick={() =>
                          handleBudgetDelete(budget._id)
                        }
                        aria-label={`Delete ${budget.category} budget`}
                        title="Delete budget"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="content-panel budget-status-panel">
              <div className="panel-heading">
                <div>
                  <h3>Budget Status</h3>
                  <p>
                    Compare your spending with your category limits.
                  </p>
                </div>
              </div>

              {summary.budgets.length === 0 ? (
                <div className="empty-state">
                  <PiggyBank size={32} />

                  <h4>No budget status available</h4>

                  <p>
                    Create a monthly budget above to track
                    your spending.
                  </p>
                </div>
              ) : (
                <div className="budget-status-list">
                  {summary.budgets.map((budget) => {
                    const percentage =
                      budget.budgetLimit > 0
                        ? (budget.spent / budget.budgetLimit) * 100
                        : 0;

                    const progressWidth = Math.min(
                      percentage,
                      100
                    );

                    return (
                      <div
                        className="budget-status-item"
                        key={budget._id}
                      >
                        <div className="budget-status-top">
                          <div>
                            <h4>{budget.category}</h4>

                            <p>
                              {formatCurrency(budget.spent)} spent
                              {" of "}
                              {formatCurrency(budget.budgetLimit)}
                            </p>
                          </div>

                          <div className="budget-status-amount">
                            <strong>
                              {Math.round(percentage)}%
                            </strong>

                            <span
                              className={
                                budget.exceeded
                                  ? "over-budget"
                                  : "within-budget"
                              }
                            >
                              {budget.exceeded
                                ? `${formatCurrency(
                                    Math.abs(budget.remaining)
                                  )} over`
                                : `${formatCurrency(
                                    budget.remaining
                                  )} left`}
                            </span>
                          </div>
                        </div>

                        <div
                          className="progress-track"
                          role="progressbar"
                          aria-valuenow={Math.round(percentage)}
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-label={`${budget.category} budget usage`}
                        >
                          <div
                            className={`progress-fill ${
                              budget.exceeded
                                ? "progress-danger"
                                : percentage >= 80
                                  ? "progress-warning"
                                  : "progress-normal"
                            }`}
                            style={{
                              width: `${progressWidth}%`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section
              className="charts-grid"
              id="analytics"
            >
              <article className="content-panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Spending by Category</h3>
                    <p>
                      See where your money goes this month.
                    </p>
                  </div>
                </div>

                {expenseChartData.length === 0 ? (
                  <div className="chart-empty">
                    <TrendingDown size={30} />
                    <p>
                      Add expense transactions to see your
                      category breakdown.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="chart-container">
                      <ResponsiveContainer
                        width="100%"
                        height={270}
                      >
                        <PieChart>
                          <Pie
                            data={expenseChartData}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={88}
                            paddingAngle={3}
                          >
                            {expenseChartData.map(
                              (entry, index) => (
                                <Cell
                                  key={entry.category}
                                  fill={
                                    CHART_COLORS[
                                      index % CHART_COLORS.length
                                    ]
                                  }
                                />
                              )
                            )}
                          </Pie>

                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(value)
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-legend">
                      {expenseChartData.map((item, index) => (
                        <div
                          className="legend-item"
                          key={item.category}
                        >
                          <span
                            className="legend-dot"
                            style={{
                              backgroundColor:
                                CHART_COLORS[
                                  index % CHART_COLORS.length
                                ]
                            }}
                          />

                          <span>{item.category}</span>

                          <strong>
                            {formatCurrency(item.amount)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </article>

              <article className="content-panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Income vs Expenses</h3>
                    <p>
                      Compare money earned and money spent.
                    </p>
                  </div>
                </div>

                <div className="chart-container">
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <BarChart
                      data={comparisonData}
                      margin={{
                        top: 15,
                        right: 10,
                        left: 10,
                        bottom: 5
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                          value >= 1000
                            ? `₹${Math.round(value / 1000)}k`
                            : `₹${value}`
                        }
                      />

                      <Tooltip
                        formatter={(value) =>
                          formatCurrency(value)
                        }
                      />

                      <Bar
                        dataKey="amount"
                        name="Amount"
                        fill="#16a36a"
                        radius={[7, 7, 0, 0]}
                        maxBarSize={70}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="comparison-summary">
                  <div>
                    <span>Income</span>
                    <strong className="text-income">
                      {formatCurrency(summary.totalIncome)}
                    </strong>
                  </div>

                  <div>
                    <span>Expenses</span>
                    <strong className="text-expense">
                      {formatCurrency(summary.totalExpenses)}
                    </strong>
                  </div>
                </div>
              </article>
            </section>

            <section
              className="content-panel transactions-panel"
              id="transactions"
            >
              <div className="panel-heading transaction-heading">
                <div>
                  <h3>Transactions</h3>
                  <p>
                    Your income and expenses for{" "}
                    {monthOptions[month - 1]} {year}.
                  </p>
                </div>

                <span className="transaction-count">
                  {recentTransactions.length} records
                </span>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="empty-state">
                  <ReceiptText size={32} />

                  <h4>No transactions this month</h4>

                  <p>
                    Add your first income or expense using
                    the form above.
                  </p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="transaction-table">
                    <thead>
                      <tr>
                        <th>Transaction</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th className="amount-column">
                          Amount
                        </th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>

                    <tbody>
                      {recentTransactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td>
                            <div className="transaction-name-cell">
                              <div
                                className={`transaction-type-icon ${
                                  transaction.type === "income"
                                    ? "transaction-income-icon"
                                    : "transaction-expense-icon"
                                }`}
                              >
                                {transaction.type === "income" ? (
                                  <TrendingUp size={17} />
                                ) : (
                                  <TrendingDown size={17} />
                                )}
                              </div>

                              <div>
                                <strong>{transaction.title}</strong>

                                {transaction.note && (
                                  <span className="transaction-note">
                                    {transaction.note}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="category-pill">
                              {transaction.category}
                            </span>
                          </td>

                          <td className="date-cell">
                            {formatDate(transaction.date)}
                          </td>

                          <td>
                            <span
                              className={`type-label ${
                                transaction.type === "income"
                                  ? "type-income"
                                  : "type-expense"
                              }`}
                            >
                              {transaction.type === "income"
                                ? "Income"
                                : "Expense"}
                            </span>
                          </td>

                          <td
                            className={`amount-column transaction-amount ${
                              transaction.type === "income"
                                ? "text-income"
                                : "text-expense"
                            }`}
                          >
                            {transaction.type === "income"
                              ? "+"
                              : "−"}
                            {formatCurrency(transaction.amount)}
                          </td>

                          <td>
                            <button
                              className="delete-button"
                              type="button"
                              onClick={() =>
                                handleTransactionDelete(
                                  transaction._id
                                )
                              }
                              title="Delete transaction"
                              aria-label={`Delete ${transaction.title}`}
                            >
                              <Trash2 size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <footer className="main-footer">
              <span>
                <Wallet size={16} />
                BudgetWise
              </span>

              <p>
                Make every rupee count.
              </p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

export default App;