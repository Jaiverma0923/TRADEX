import {z} from "zod";
export const TransactionSchema=z.object({
    symbol: z
    .string()
    .trim()
    .min(1, "Symbol is required")
    .max(10, "Symbol is too long"),

  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required"),

  type: z.enum(["BUY", "SELL"]),

  quantity: z.coerce
  .number()
  .positive("Quantity must be greater than 0"),

price: z.coerce
  .number()
  .positive("Price must be greater than 0"),
});
