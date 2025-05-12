import {
  ShoppingBag,
  Utensils,
  Home,
  Car,
  HeartPulse,
  Landmark,
  GraduationCap,
  Plane,
  ShoppingCart,
  Briefcase,
  Gift,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

export const transactionCategories = [
  {
    value: "groceries",
    label: "Groceries",
    icon: ShoppingCart,
  },
  {
    value: "dining",
    label: "Dining",
    icon: Utensils,
  },
  {
    value: "housing",
    label: "Housing",
    icon: Home,
  },
  {
    value: "transportation",
    label: "Transportation",
    icon: Car,
  },
  {
    value: "health",
    label: "Healthcare",
    icon: HeartPulse,
  },
  {
    value: "banking",
    label: "Banking",
    icon: Landmark,
  },
  {
    value: "education",
    label: "Education",
    icon: GraduationCap,
  },
  {
    value: "travel",
    label: "Travel",
    icon: Plane,
  },
  {
    value: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
  },
  {
    value: "income",
    label: "Income",
    icon: Briefcase,
  },
  {
    value: "gifts",
    label: "Gifts",
    icon: Gift,
  },
  {
    value: "other",
    label: "Other",
    icon: Wallet,
  },
];

export const transactionTypes = [
  {
    value: "income",
    label: "Income",
    icon: ArrowUpRight,
  },
  {
    value: "expense",
    label: "Expense",
    icon: ArrowDownLeft,
  },
];
