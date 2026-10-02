import { z } from "zod";
import { NIGERIAN_STATES, PROPERTY_TYPES } from "./constants";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
  message?: string;
};

export function flattenErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) return "0" + digits.slice(3);
  if (digits.length === 10) return "0" + digits;
  return digits;
}

const phone = z
  .string()
  .trim()
  .transform(normalizePhone)
  .refine((v) => /^0\d{10}$/.test(v), "Enter a valid Nigerian phone number, e.g. 0803 123 4567");

export const signupSchema = z
  .object({
    role: z.enum(["tenant", "landlord"], { message: "Choose how you will use RentNaija" }),
    name: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone,
    password: z.string().min(8, "Use at least 8 characters").max(100),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

const money = z
  .string()
  .transform((v) => Number(v.replace(/[^\d]/g, "")))
  .refine((n) => n >= 10_000, "Enter the yearly rent in Naira, at least ₦10,000")
  .refine((n) => n <= 1_000_000_000, "That rent looks too high. Check the amount");

const optionalInt = (max: number) =>
  z
    .string()
    .transform((v) => (v.trim() === "" ? null : Number(v.replace(/[^\d]/g, ""))))
    .refine((n) => n === null || (n >= 1 && n <= max), `Enter a number between 1 and ${max}`);

export const listingSchema = z.object({
  title: z.string().trim().min(5, "Give the listing a title of at least 5 characters").max(100),
  type: z.enum(PROPERTY_TYPES.map((t) => t.value) as [string, ...string[]], { message: "Choose a property type" }),
  state: z.enum(NIGERIAN_STATES, { message: "Choose a state" }),
  area: z.string().trim().min(2, "Enter the city or area").max(60),
  price: money,
  bedrooms: z.coerce.number().int().min(1, "At least 1 bedroom").max(20),
  bathrooms: z.coerce.number().int().min(1, "At least 1 bathroom").max(20),
  area_sqm: optionalInt(5000),
  tag: z.string().trim().max(30).transform((v) => v || null),
  description: z.string().trim().min(20, "Describe the property in at least 20 characters").max(2000),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone,
  message: z.string().trim().min(10, "Write a short message, at least 10 characters").max(1000),
});
