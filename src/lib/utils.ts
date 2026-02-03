import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ORDER_NUMBER_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Generate a unique 7-character alphanumeric order number (0-9, A-Z). */
export function generateOrderNumber(): string {
  const chars = ORDER_NUMBER_CHARS;
  let result = "";
  const random = typeof crypto !== "undefined" && crypto.getRandomValues
    ? (n: number) => crypto.getRandomValues(new Uint32Array(1))[0] % n
    : (n: number) => Math.floor(Math.random() * n);
  for (let i = 0; i < 7; i++) {
    result += chars[random(chars.length)];
  }
  return result;
}
