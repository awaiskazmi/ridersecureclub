"use client";

import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import PaymentMethodForm from "../../components/PaymentMethodForm";
import { stripePromise } from "../../components/StripeProvider";

export default function PaymentSetupPage() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [clientSecret, setClientSecret] = useState(null);
  const [loadingClientSecret, setLoadingClientSecret] = useState(false);
  const [error, setError] = useState(null);

  // New state to hold the resolved Stripe object
  const [stripe, setStripe] = useState(null);

  useEffect(() => {
    // Await the promise and set the Stripe object in state
    stripePromise.then((resolvedStripe) => {
      setStripe(resolvedStripe);
    });
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchClientSecret(selectedUserId);
    } else {
      setClientSecret(null);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchClientSecret = async (userId) => {
    setLoadingClientSecret(true);
    setError(null);
    try {
      const response = await fetch("/api/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setClientSecret(null);
      } else {
        setClientSecret(data.client_secret);
      }
    } catch (err) {
      setError("Failed to create setup intent.");
    } finally {
      setLoadingClientSecret(false);
    }
  };

  const handlePaymentMethodSuccess = (paymentMethod) => {
    setPaymentMethods((prev) => [...prev, paymentMethod]);
    alert("Payment method added successfully!");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Payment Method Setup</h1>

      <div className="bg-white p-6 rounded border">
        <h2 className="text-xl font-bold mb-4">Add Payment Method</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select User</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a user...</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {selectedUserId && loadingClientSecret && (
          <div className="p-4 text-center text-gray-500">
            Loading payment form...
          </div>
        )}

        {selectedUserId && !loadingClientSecret && error && (
          <div className="p-4 text-center text-red-500">{error}</div>
        )}

        {/* Conditionally render the Elements provider and the form only when both stripe and clientSecret are available */}
        {selectedUserId && clientSecret && stripe && (
          <Elements stripe={stripe} options={{ clientSecret }}>
            <PaymentMethodForm
              userId={selectedUserId}
              onSuccess={handlePaymentMethodSuccess}
            />
          </Elements>
        )}
      </div>

      {paymentMethods.length > 0 && (
        <div className="bg-white p-6 rounded border mt-6">
          <h2 className="text-xl font-bold mb-4">Added Payment Methods</h2>
          <div className="space-y-2">
            {paymentMethods.map((pm, index) => (
              <div key={index} className="p-3 border rounded">
                <p>
                  <strong>ID:</strong> {pm.id}
                </p>
                <p>
                  <strong>Type:</strong> {pm.type}
                </p>
                {pm.card && (
                  <p>
                    <strong>Card:</strong> **** **** **** {pm.card.last4} (
                    {pm.card.brand})
                  </p>
                )}
                {pm.us_bank_account && (
                  <p>
                    <strong>Bank:</strong> **** {pm.us_bank_account.last4}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
