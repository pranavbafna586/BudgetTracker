import { Transaction } from "./schema";

export const mockTransactions: Transaction[] = [
  {
    id: "t1",
    category: "income",
    description: "Salary payment",
    date: new Date(2023, 9, 1).toISOString(),
    type: "income",
    amount: 3500.0,
    categoryIcon: ""
  },
  {
    id: "t2",
    category: "housing",
    description: "Monthly rent",
    date: new Date(2023, 9, 3).toISOString(),
    type: "expense",
    amount: 1200.0,
    categoryIcon: ""
  },
  {
    id: "t3",
    category: "groceries",
    description: "Weekly grocery shopping",
    date: new Date(2023, 9, 5).toISOString(),
    type: "expense",
    amount: 87.35,
    categoryIcon: ""
  },
  {
    id: "t4",
    category: "transportation",
    description: "Gas refill",
    date: new Date(2023, 9, 6).toISOString(),
    type: "expense",
    amount: 45.0,
    categoryIcon: ""
  },
  {
    id: "t5",
    category: "dining",
    description: "Dinner with friends",
    date: new Date(2023, 9, 8).toISOString(),
    type: "expense",
    amount: 64.8,
    categoryIcon: ""
  },
  {
    id: "t6",
    category: "shopping",
    description: "New clothes",
    date: new Date(2023, 9, 10).toISOString(),
    type: "expense",
    amount: 129.99,
    categoryIcon: ""
  },
  {
    id: "t7",
    category: "banking",
    description: "Interest payment",
    date: new Date(2023, 9, 15).toISOString(),
    type: "income",
    amount: 12.33,
    categoryIcon: ""
  },
  {
    id: "t8",
    category: "health",
    description: "Pharmacy",
    date: new Date(2023, 9, 18).toISOString(),
    type: "expense",
    amount: 32.5,
    categoryIcon: ""
  },
  {
    id: "t9",
    category: "income",
    description: "Freelance project",
    date: new Date(2023, 9, 20).toISOString(),
    type: "income",
    amount: 450.0,
    categoryIcon: ""
  },
  {
    id: "t10",
    category: "groceries",
    description: "Grocery shopping",
    date: new Date(2023, 9, 22).toISOString(),
    type: "expense",
    amount: 65.78,
    categoryIcon: ""
  },
];
