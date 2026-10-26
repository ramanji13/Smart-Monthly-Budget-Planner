const API_BASE_URL = "/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong. Please try again."
    );
  }

  return data;
}

// Monthly dashboard summary
export function getMonthlySummary(month, year) {
  return request(`/summary?month=${month}&year=${year}`);
}

// Transactions
export function getTransactions() {
  return request("/transactions");
}

export function createTransaction(transaction) {
  return request("/transactions", {
    method: "POST",
    body: JSON.stringify(transaction)
  });
}

export function updateTransaction(id, transaction) {
  return request(`/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(transaction)
  });
}

export function deleteTransaction(id) {
  return request(`/transactions/${id}`, {
    method: "DELETE"
  });
}

// Budgets
export function getBudgets(month, year) {
  return request(`/budgets/monthly?month=${month}&year=${year}`);
}

export function createBudget(budget) {
  return request("/budgets", {
    method: "POST",
    body: JSON.stringify(budget)
  });
}

export function updateBudget(id, budget) {
  return request(`/budgets/${id}`, {
    method: "PUT",
    body: JSON.stringify(budget)
  });
}

export function deleteBudget(id) {
  return request(`/budgets/${id}`, {
    method: "DELETE"
  });
}