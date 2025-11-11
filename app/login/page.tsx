"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { useAppStore } from "@/stores/app";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loggedIn, setLoggedIn } = useAppStore((state) => state);

  const router = useRouter();

  useEffect(() => {
    if (loggedIn) router.push("/");
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    try {
      setLoading(true);

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
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to login:", error);
      // setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white p-5 rounded shadow max-w-sm mx-auto">
        <h1 className="text-3xl font-bold mb-7">Welcome!</h1>
        <form className="mt-3 flex flex-col gap-3" onSubmit={handleLogin}>
          <div className="flex flex-col gap-3">
            <Label>Email</Label>
            <Input
              name="username"
              type="username"
              placeholder="Your email address"
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label>Password</Label>
            <Input name="password" type="password" placeholder="" />
          </div>
          <hr className="my-1" />
          <Button className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                Logging in
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
        {error ? (
          <p className="mt-3 px-3 py-2 text-xs border border-red-600 rounded-md bg-red-50 text-red-500">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Login;
