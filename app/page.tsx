"use client";

import { useState } from "react";

import Dashboard from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });

      if (!response.ok) {
        setError("Incorrect username/password");
      }

      if (response.ok) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error("Failed to create policy:", error);
      setError(error);
    }
  };

  return loggedIn ? (
    <div>
      <Dashboard />
    </div>
  ) : (
    <div className="bg-white p-5 rounded shadow max-w-sm mx-auto">
      <h1 className="text-3xl font-bold mb-7">Welcome!</h1>
      <form className="mt-3 flex flex-col gap-3" onSubmit={handleLogin}>
        <div className="flex flex-col gap-3">
          <Label>Username</Label>
          <Input name="username" type="username" />
        </div>
        <div className="flex flex-col gap-3">
          <Label>Password</Label>
          <Input name="password" type="password" />
        </div>
        <hr className="my-1" />
        <Button className="w-full">Log in</Button>
      </form>
      {error ? (
        <p className="mt-3 px-3 py-2 text-xs border border-red-600 rounded-md bg-red-50 text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
