"use client";

import { useAppStore } from "@/stores/app";
import { redirect } from "next/navigation";
import { Button } from "../ui/button";

const LogoutButton = () => {
  const { setLoggedIn } = useAppStore((state) => state);

  const handleClick = () => {
    setLoggedIn(false);
    redirect("/");
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      Log out
    </Button>
  );
};

export default LogoutButton;
