"use client";
import React, { useEffect } from "react";
import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";
import { Unauthenticated, Authenticated } from "convex/react";
import { useStoreUserEffect } from "../../Hooks/useStoreUserEffect";
import { BarLoader } from "react-spinners";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

function Header() {
  const { isLoading, isAuthenticated } = useStoreUserEffect();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && path === "/") {
      router.push("/feed");
    }
  }, [isLoading, isAuthenticated, path, router]);

  if (path !== "/" && path !== "/feed" && path.split("/").length >= 2) {
    return null;
  }
  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 sm:px-6 py-3 md:px-8 flex items-center justify-between gap-2">
        <Link href={isAuthenticated ? "/feed" : "/"} className="shrink-0 ">
          <Image
            src="/logo.png"
            alt="logo"
            width={96}
            height={32}
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </Link>
        {path === "/" && (
          <div className="hidden lg:flex space-x-6 flex-1 justify-center">
            <Link
              href="#features"
              className="text-white font-medium transition-all duration-300 hover:text-purple-300 cursor-pointer"
            >
              Features
            </Link>
            <Link
              href="#testimonial"
              className="text-white font-medium transition-all duration-300 hover:text-purple-300 cursor-pointer"
            >
              Testimonials
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Authenticated>
            <Link href="/dashboard">
              <Button variant="outline" className="hidden sm:flex" size="sm">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Dashboard</span>
              </Button>
            </Link>
            <UserButton />
          </Authenticated>

          <Unauthenticated>
            <SignInButton>
              <Button variant="ghost" className="" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="primary" className="whitespace-nowrap" size="sm">
                Get Started
              </Button>
            </SignUpButton>
          </Unauthenticated>
        </div>

        {isLoading && (
          <div className="fixed bottom-0 left-0 w-full z-40 flex justify-center">
            <BarLoader width={"95%"} color="#D8B4FE" />
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
