"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import UserForm from "@/components/UserForm";
import { APP } from "@/enums/app";
import { useEffect, useState } from "react";

import PaymentMethodForm from "@/components/PaymentMethodForm";
import TransactionPolicyForm from "@/components/TransactionPolicyForm";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { useAppStore } from "@/stores/app";
import { Elements } from "@stripe/react-stripe-js";
import { Plus } from "lucide-react";

import { stripePromise } from "@/components/StripeProvider";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function PaymentsPage() {
  const [policies, setPolicies] = useState([]);
  const [users, setUsers] = useState([]);

  const [fetchUsersLoading, setFetchUsersLoading] = useState(true);

  const router = useRouter();

  const {
    loggedIn,
    createUserModalOpen,
    setCreateUserModalOpen,
    createUserPaymentMethodModalOpen,
    setCreateUserPaymentMethodModalOpen,
    createUserModalLoading,
    setCreateUserModalLoading,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
    setSelectedUser,
    stripe,
    setStripe,
    stripeClientSecret,
    setStripeClientSecret,
    paymentProcessingLoading,
    setPaymentProcessingLoading,
  } = useAppStore((state) => state);

  useEffect(() => {
    if (!loggedIn) return router.replace("/");

    stripePromise.then((resolvedStripe) => {
      setStripe(resolvedStripe);
    });
    fetchPolicies();
    fetchUsers();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch("/api/payments");
      const data = await response.json();
      setPolicies(data);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    }
  };

  const fetchUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setSelectedUser(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setFetchUsersLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setFetchUsersLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setFetchUsersLoading(false);
    }
  };

  const handleCreatePolicy = async (paymentData: any) => {
    try {
      setPaymentProcessingLoading(true);

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        toast.error("Oops! Something went wrong. Try again.");
      }

      if (response.ok) {
        setSelectedUserId("");
        // fetchPolicies();
        toast.success("Payment processed successfully!");
        router.replace("/");
      }
    } catch (error) {
      console.error("Failed to create policy:", error);
      toast.error("Oops! Something went wrong. Try again.");
    } finally {
      setPaymentProcessingLoading(false);
    }
  };

  const handleUserSelect = (value: any) => {
    if (value === APP.NewUser) {
      setCreateUserModalOpen(true);
      return;
    }
    setSelectedUserId(value.value);
    fetchUser(value.value);
    fetchClientSecret(value.value);
  };

  const handleCreateUser = async (userData) => {
    try {
      setCreateUserModalLoading(true);

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const user = await response.json();
        setSelectedUser(user);
        setSelectedUserId(user.stripeCustomerId);
        setCreateUserModalOpen(false);
        setCreateUserPaymentMethodModalOpen(true);
        await fetchClientSecret(user.stripeCustomerId);
        await fetchUsers();
      }
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setCreateUserModalLoading(false);
    }
  };

  const fetchClientSecret = async (userId) => {
    try {
      const response = await fetch("/api/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.error) {
        return;
      } else {
        setStripeClientSecret(data.client_secret);
      }
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const handleClick = () => {
    setCreateUserModalOpen(true);
  };

  const handlePaymentMethodSuccess = (paymentMethod) => {
    setCreateUserPaymentMethodModalOpen(false);
    fetchUser(selectedUserId);
  };

  return !loggedIn ? (
    <p>Verifying...</p>
  ) : (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Payment</h1>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div className="bg-white p-6 rounded border w-full lg:w-4/12">
          <h2 className="text-xl font-bold mb-4">Select a user</h2>

          <div>
            <div className="flex gap-2">
              {fetchUsersLoading ? (
                <Input value="Fetching users..." disabled readOnly />
              ) : (
                <Combobox
                  initialValue={selectedUserId}
                  onValueChange={handleUserSelect}
                  data={users.map((user) => ({
                    value: user.id,
                    label: `${user.name} (${user.email})`,
                  }))}
                >
                  <Button
                    className="w-full"
                    variant={"ghost"}
                    onClick={handleClick}
                  >
                    <Plus />
                    Create new user
                  </Button>
                </Combobox>
              )}

              {/* <Select
                value={selectedUserId}
                onValueChange={handleUserSelect}
                required
              >
                <SelectTrigger className="w-80 max-w-full">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {users.length
                      ? users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))
                      : null}
                  </SelectGroup>
                  <SelectItem className="cursor-pointer" value={APP.NewUser}>
                    <Plus /> Create new
                  </SelectItem>
                </SelectContent>
              </Select> */}

              <Dialog
                modal
                open={createUserModalOpen}
                onOpenChange={(value) => setCreateUserModalOpen(value)}
              >
                <DialogTitle className="sr-only">Create new user</DialogTitle>
                <DialogContent>
                  <UserForm
                    loading={createUserModalLoading}
                    onSubmit={handleCreateUser}
                  />
                </DialogContent>
              </Dialog>

              <Dialog
                modal
                open={createUserPaymentMethodModalOpen}
                onOpenChange={(value) =>
                  setCreateUserPaymentMethodModalOpen(value)
                }
              >
                <DialogTitle className="sr-only">
                  Add new payment method
                </DialogTitle>
                <DialogContent>
                  <p>
                    Add payment method for {selectedUser.name} (
                    {selectedUser.email})
                  </p>
                  <ScrollArea className="max-h-[85vh]">
                    {selectedUserId && stripeClientSecret && stripe && (
                      <Elements
                        stripe={stripe}
                        options={{ clientSecret: stripeClientSecret }}
                      >
                        <PaymentMethodForm
                          userId={selectedUserId}
                          onSuccess={handlePaymentMethodSuccess}
                        />
                      </Elements>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {selectedUserId && (
          <div className="bg-white p-6 rounded border w-full lg:w-8/12">
            <TransactionPolicyForm
              loading={paymentProcessingLoading}
              user={selectedUser}
              userId={selectedUserId}
              onSubmit={handleCreatePolicy}
            />
          </div>
        )}
      </div>

      {policies.length ? (
        <div className="bg-white p-6 rounded border">
          <h2 className="text-xl font-bold mb-4">All Payments</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Payment Name</th>
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
                      <tr
                        key={policy._id}
                        className="border-b hover:bg-gray-50"
                      >
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
      ) : null}
    </div>
  );
}
