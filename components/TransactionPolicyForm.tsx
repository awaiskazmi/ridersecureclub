"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { useAppStore } from "@/stores/app";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

export default function TransactionPolicyForm({
  loading,
  user,
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
    // paymentMethodType: initialData?.paymentMethodType || "card",
    metadata: initialData?.metadata || {},
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [metadataFields, setMetadataFields] = useState([]);
  const [fetchPaymentMethodsLoading, setFetchPaymentMethodsLoading] =
    useState(false);

  const {
    createUserPaymentMethodModalOpen,
    setCreateUserPaymentMethodModalOpen,
  } = useAppStore();

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

    if (!formData.paymentMethodId) {
      toast.error("Please select a valid payment method!");
      return;
    }

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
      [name]: value,
    }));
  };

  const handleFrequencyChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      frequency: value,
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

  const renderPaymentMethodOption = ({
    type,
    id,
    ...rest
  }: {
    type: "card" | "au_becs_debit";
    id: string;
  }) => {
    switch (type) {
      case "au_becs_debit":
        return `AU Bank account ending in ${rest.au_becs_debit.last4}`;
      case "card":
        return `${rest.card.display_brand.toUpperCase()} card ending in ${
          rest.card.last4
        }`;
    }
  };

  useEffect(() => {
    if (!userId) return;

    const getUserPaymentMethods = async () => {
      try {
        setFetchPaymentMethodsLoading(true);
        const response = await fetch(`/api/users/${userId}/payment-methods`);
        const data = await response.json();
        setPaymentMethods(data);
      } catch (error) {
        console.log(error);
      } finally {
        setFetchPaymentMethodsLoading(false);
      }
    };

    getUserPaymentMethods();
  }, [userId, user]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Invoice ID</label>
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
          className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
          type="number"
          name="upfrontAmount"
          value={formData.upfrontAmount}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Recurring Amount ($)
        </label>
        <Input
          className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
          type="number"
          name="recurringAmount"
          value={formData.recurringAmount}
          onChange={handleChange}
        />
      </div>

      {formData.recurringAmount > 0 ? (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Frequency</label>

            <Select
              name="frequency"
              value={formData.frequency}
              onValueChange={handleFrequencyChange}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[
                    { value: "week", label: "Week" },
                    { value: "month", label: "Month" },
                  ].map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select> */}
          </div>

          {(formData.frequency === "month" ||
            formData.frequency === "week") && (
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                name="recurringDate"
                value={formData.recurringDate}
                onChange={handleChange}
                required
              />
            </div>
          )}
        </>
      ) : null}

      <div>
        <label className="block text-sm font-medium mb-1">Payment Method</label>

        <Select
          disabled={fetchPaymentMethodsLoading}
          value={formData.paymentMethodId}
          onValueChange={(value) => {
            setFormData((prev) => ({
              ...prev,
              paymentMethodId: value,
            }));
          }}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Please select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {paymentMethods.length
                ? paymentMethods.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {renderPaymentMethodOption(option)}
                    </SelectItem>
                  ))
                : null}
            </SelectGroup>
            <Button
              variant={"ghost"}
              size={"lg"}
              className="w-full"
              onClick={() => setCreateUserPaymentMethodModalOpen(true)}
            >
              <Plus /> Add new payment method
            </Button>
          </SelectContent>
        </Select>

        {/* <select
          name="paymentMethodId"
          value={formData.paymentMethodId}
          onChange={handleChange}
          required
        >
          <option value="">Please select...</option>
          {paymentMethods &&
            paymentMethods.map((p) => renderPaymentMethodOption(p))}
        </select> */}
      </div>

      {/* <div>
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
      </div> */}

      {/* <div>
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
      </div> */}

      <Button type="submit" disabled={loading}>
        {initialData
          ? "Update Payment"
          : loading
          ? "Processing..."
          : "Process Payment"}
      </Button>
    </form>
  );
}
