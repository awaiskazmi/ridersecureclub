"use client";

import Dashboard from "@/components/Dashboard";
import Landing from "@/components/Landing";
import { useAppStore } from "@/stores/app";

export default function Home() {
  const { loggedIn } = useAppStore((state) => state);

  return loggedIn ? <Dashboard /> : <Landing />;
}
