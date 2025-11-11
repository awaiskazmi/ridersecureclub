"use client";

import { useAppStore } from "@/stores/app";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import LogoutButton from "./LogoutButton";

const Header = () => {
  const { loggedIn } = useAppStore((state) => state);

  return (
    <>
      <nav className="bg-white shadow py-2 px-5 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl tracking-tight font-bold flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                width={96}
                height={96}
                className="size-10 md:size-12 rounded-md"
                alt="Logo of Rider Secure Club"
              />
              <span className="hidden md:block">Rider Secure Club</span>
            </Link>
          </h1>
          <ul className="flex items-center gap-5 text-sm">
            {/* <li>
              <Link href="/terms">Terms of use</Link>
            </li> */}
            <li>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
            {loggedIn ? (
              <li>
                <LogoutButton />
              </li>
            ) : (
              <li>
                <Button variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Header;
