"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "./ui/button";

export default function PaymentMethodForm({ userId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // The `clientSecret` is now handled by the parent component, so we don't
    // need to fetch it here or pass it to `confirmSetup`.

    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    try {
      // Confirm setup intent
      const { error: stripeError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message);
      } else {
        // Save payment method
        const response = await fetch("/api/payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            paymentMethodId: setupIntent.payment_method,
          }),
        });

        const paymentMethod = await response.json();
        onSuccess(paymentMethod);
      }
    } catch (err) {
      setError(err.message);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded">
        {/* PaymentElement can now be rendered directly since it's wrapped by the Elements provider in the parent component */}
        <PaymentElement />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <Button type="submit" disabled={!stripe || isLoading}>
        {isLoading ? "Processing..." : "Add Payment Method"}
      </Button>
    </form>
  );
}
