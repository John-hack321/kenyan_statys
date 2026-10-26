import { z } from "zod";
import { PRICE_MAX, PRICE_MIN } from "@/constants/listingLimits";

// digits only, no leading zeros
export const sanitizePrice = (s: string) => s.replace(/\D/g, "").replace(/^0+/, "");

// 12500 -> "12,500"  (done by hand: Intl is not reliable on every Android phone)
export const formatKes = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const priceFormSchema = z.object({
    price: z
        .string()
        .trim()
        .min(1, "Enter a price")
        .regex(/^\d+$/, "Numbers only, please")
        .refine((v) => Number(v) >= PRICE_MIN, `The lowest price is KSh ${formatKes(PRICE_MIN)}`)
        .refine((v) => Number(v) <= PRICE_MAX, `The highest price is KSh ${formatKes(PRICE_MAX)}`),
});
export type PriceForm = z.infer<typeof priceFormSchema>;
