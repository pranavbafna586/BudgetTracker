import { Currencies } from "@/lib/currency";
import { z } from "zod";
export const UpdateUserCurrencySchema = z.object({
  currency: z.custom((value) => {
    const found = Currencies.some((c) => c.value === value);
    if (!found) {
      throw new Error(`Invalid currency:${value}`);
    }
    return value;
  }),
});
