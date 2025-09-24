"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Spinner from "./ui/spinner";

export default function UserForm({ onSubmit, loading, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: {
      street: initialData?.address?.street || "",
      city: initialData?.address?.city || "",
      state: initialData?.address?.state || "",
      zipCode: initialData?.address?.zipCode || "",
      country: initialData?.address?.country || "AU",
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Address</h3>

        <Input
          type="text"
          name="address.street"
          placeholder="Street Address"
          value={formData.address.street}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="text"
            name="address.city"
            placeholder="City"
            value={formData.address.city}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="address.state"
            placeholder="State"
            value={formData.address.state}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="text"
            name="address.zipCode"
            placeholder="ZIP Code"
            value={formData.address.zipCode}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="address.country"
            placeholder="Country"
            value={formData.address.country}
            onChange={handleChange}
            readOnly
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? <Spinner /> : null}
        {initialData
          ? "Update user"
          : loading
          ? "Creating user..."
          : "Create user"}
      </Button>
    </form>
  );
}
