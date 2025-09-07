"use client";

import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(
  process.env.STRIPE_PUBLISHABLE_KEY || ""
);

export default function StripeProvider({ children }) {
  return <>{children}</>;
}
