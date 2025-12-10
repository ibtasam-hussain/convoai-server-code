"use client";

import Sidebar from "@/Components/Admin/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // List of public pages (NO SIDEBAR)
  const publicPages = ["/admin/login", "/admin/signup", "/admin/forgot-password"];

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  // Protect route
  useEffect(() => {
    if (!publicPages.includes(pathname)) {
      if (!token) {
        router.replace("/admin/login");
      }
    }
  }, [pathname, token]);

  // No sidebar for public pages
  if (publicPages.includes(pathname)) {
    return <>{children}</>;
  }

  // Show sidebar for logged-in admin pages
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
