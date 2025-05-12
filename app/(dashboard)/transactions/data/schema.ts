import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string(),
  category: z.string(),
  categoryIcon: z.string().optional().default(""),
  description: z.string(),
  date: z.string(), // ISO string format
  type: z.enum(["income", "expense"]),
  amount: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;
