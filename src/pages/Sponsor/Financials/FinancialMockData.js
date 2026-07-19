/*
  Static mock data removed as part of Item 19 (dynamic Financials).

  All budgets, payments, receivables and invoices now come from
  services/financialService.js on a per-study basis. The named exports are
  kept as empty arrays so any lingering imports elsewhere continue to work
  and simply yield no seed data (proper empty-state behavior).
*/

export const budgetSummary = {
  totalBudget: 0,
  utilized: 0,
  remaining: 0,
  budgetStatus: "",
};

export const payments = [];
export const receivables = [];
export const invoiceData = [];
