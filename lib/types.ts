export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Personal Care",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
