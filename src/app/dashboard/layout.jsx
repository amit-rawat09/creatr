"use client";
import {
  FileText,
  LayoutDashboard,
  Menu,
  PenTool,
  Settings,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { useConvexQuery } from "../../../Hooks/useConvex";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";

const sidebar = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create Post",
    href: "/dashboard/create",
    icon: PenTool,
  },
  {
    title: "My Post",
    href: "/dashboard/posts",
    icon: FileText,
  },
  // {
  //   title: "Followers",
  //   href: "/dashboard/followers",
  //   icon: Users,
  // },
];
function layout({ children }) {
  const [isSLidebarOpen, setIsSLidebarOpen] = useState(false);
  const path = usePathname();
  const { data: draftPost } = useConvexQuery(api.posts.getUserDraft);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* MOBILE SIDEBAR */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 z-50 transition-transition duration-300 lg:translate-x-0",
          isSLidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex item-center justify-center p-5 border-b border-slate-700">
          <Link href={"/"} className="shrink-0">
            <Image
              src="/logo.png"
              alt="Creatr Logo"
              width={96}
              height={32}
              className="h-8 sm: sm:h-10 md:h-11 w-auto object-contain"
            />
          </Link>
          <Button
            varient="ghost"
            size="icon"
            onClick={() => setIsSLidebarOpen(!isSLidebarOpen)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* NAVIGATEION */}
        <nav className="p-4 space-y-2">
          {sidebar.map((item, index) => {
            const isActive =
              path === item.href ||
              (item.href !== "/dashboard" && path.startsWith(item.href));
            return (
              <Link
                key={index}
                href={item.href}
                onClick={() => setIsSLidebarOpen(false)}
              >
                <div
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-linear-to-r from-purple-600/20 to-blue-600/20 border border-purple-500 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-purple-400"
                        : "text-slate-400 group-hover:text-white",
                    )}
                  />
                  <span className="font-medium">{item.title}</span>
                  {item.title === "Create Post" && draftPost && (
                    <Badge
                      variant="secondary"
                      className="ml-auto text-xs bg-orange-500/20 text-orange-300 border-orange-500/20"
                    >
                      Draft
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/dashboard/settings">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-slate-300 hover:text-white rounded-xl p-4"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </aside>

      <div className="lg:ml-64 ml-0">
        <header className="fixed w-full top-0 right-0 z-30 bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSLidebarOpen(!isSLidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-10 flex items-center scroll-px-4">
              <UserButton />
            </div>
          </div>
        </header>
        <main className="mt-18">{children}</main>
        <Toaster richColors />
      </div>
    </div>
  );
}

export default layout;
