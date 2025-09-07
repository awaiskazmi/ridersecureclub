"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import TransactionPolicyForm from "../../components/TransactionPolicyForm";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    fetchPolicies();
    fetchUsers();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch("/api/policies");
      const data = await response.json();
      setPolicies(data);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleCreatePolicy = async (policyData) => {
    try {
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policyData),
      });

      if (response.ok) {
        setShowForm(false);
        setSelectedUserId("");
        fetchPolicies();
      }
    } catch (error) {
      console.error("Failed to create policy:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transaction Policies</h1>
        <Button onClick={() => setShowForm(true)}>Create New Policy</Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded border mb-6">
          <h2 className="text-xl font-bold mb-4">
            Create New Transaction Policy
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Select User
            </label>
            <Select
              value={selectedUserId}
              onValueChange={(e) => setSelectedUserId(e)}
              required
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {users.length
                    ? users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    : null}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {selectedUserId && (
            <TransactionPolicyForm
              userId={selectedUserId}
              onSubmit={handleCreatePolicy}
            />
          )}

          <Button variant={"outline"} onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      )}

      <div className="bg-white p-6 rounded border">
        <h2 className="text-xl font-bold mb-4">All Policies</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Policy Name</th>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Upfront</th>
                <th className="text-left p-2">Recurring</th>
                <th className="text-left p-2">Frequency</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {policies.length
                ? policies.map((policy) => (
                    <tr key={policy._id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{policy.name}</td>
                      <td className="p-2">
                        {policy.userId?.name || "Unknown"}
                      </td>
                      <td className="p-2">
                        ${policy.upfrontAmount.toFixed(2)}
                      </td>
                      <td className="p-2">
                        ${policy.recurringAmount.toFixed(2)}
                      </td>
                      <td className="p-2 capitalize">{policy.frequency}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            policy.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {policy.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-2">
                        {new Date(policy.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
