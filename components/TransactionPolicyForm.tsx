"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function TransactionPolicyForm({
  userId,
  onSubmit,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    upfrontAmount: initialData?.upfrontAmount || 0,
    recurringAmount: initialData?.recurringAmount || 0,
    frequency: initialData?.frequency || "month",
    recurringDate: initialData?.recurringDate || "",
    paymentMethodId: initialData?.paymentMethodId || "",
    paymentMethodType: initialData?.paymentMethodType || "card",
    metadata: initialData?.metadata || {},
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [metadataFields, setMetadataFields] = useState([]);

  useEffect(() => {
    // Convert metadata object to array for form handling
    if (initialData?.metadata) {
      const fields = Object.entries(initialData.metadata).map(
        ([key, value]) => ({
          key,
          value,
        })
      );
      setMetadataFields(fields);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert metadata array back to object
    const metadata = metadataFields.reduce((acc, field) => {
      if (field.key && field.value) {
        acc[field.key] = field.value;
      }
      return acc;
    }, {});

    onSubmit({
      ...formData,
      userId,
      metadata,
    });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const addMetadataField = () => {
    setMetadataFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeMetadataField = (index) => {
    setMetadataFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMetadataField = (index, field, value) => {
    setMetadataFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Policy Name</label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Upfront Amount ($)
        </label>
        <Input
          type="number"
          name="upfrontAmount"
          value={formData.upfrontAmount}
          onChange={handleChange}
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Recurring Amount ($)
        </label>
        <Input
          type="number"
          name="recurringAmount"
          value={formData.recurringAmount}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Frequency</label>
        <select
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          required
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      {(formData.frequency === "month" || formData.frequency === "year") && (
        <div>
          <label className="block text-sm font-medium mb-1">
            {formData.frequency === "month"
              ? "Day of Month (1-31)"
              : "Day of Year (1-365)"}
          </label>
          <Input
            type="number"
            name="recurringDate"
            value={formData.recurringDate}
            onChange={handleChange}
            min={formData.frequency === "month" ? 1 : 1}
            max={formData.frequency === "month" ? 31 : 365}
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Payment Method ID
        </label>
        <Input
          type="text"
          name="paymentMethodId"
          value={formData.paymentMethodId}
          onChange={handleChange}
          placeholder="pm_xxxxxxxxxx"
          required
        />
        <p className="text-xs text-gray-600 mt-1">
          Use the payment method setup form to get this ID.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          This should list all the existing payment methods of a customer.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          If no payment method exists, add Dialog to add payment method from
          right here.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Payment Method Type
        </label>
        <select
          name="paymentMethodType"
          value={formData.paymentMethodType}
          onChange={handleChange}
        >
          <option value="card">Credit/Debit Card</option>
          <option value="bank_account">Bank Account</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Metadata</label>
        {metadataFields.map((field, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              type="text"
              placeholder="Key"
              value={field.key}
              onChange={(e) =>
                updateMetadataField(index, "key", e.target.value)
              }
              className="flex-4"
            />
            <Input
              type="text"
              placeholder="Value"
              value={field.value}
              onChange={(e) =>
                updateMetadataField(index, "value", e.target.value)
              }
              className="flex-8"
            />
            <Button
              variant={"destructive"}
              type="button"
              onClick={() => removeMetadataField(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addMetadataField} variant={"secondary"}>
          Add Metadata Field
        </Button>
      </div>

      <Button type="submit">
        {initialData ? "Update Policy" : "Create Policy"}
      </Button>
    </form>
  );
}
