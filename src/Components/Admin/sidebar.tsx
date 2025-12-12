'use client';

import Link from "next/link";
import {
  Star,
  Phone,
  MessageSquare,
  Ticket,
  MessageCircle,
  BookOpen,
  Users as UsersIcon,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Building2,
  Grid2x2,
} from "lucide-react";
import Image from "next/image";
import Logo from "../../../public/assets/Admin/dashboard/logo.svg";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const BASE_W = 288; // Base Sidebar Width (18rem)
const FLYOUT_W = 280; // Flyout Width for Admin Panel

type AppUser = {
  name?: string;
  image?: string | null;
  role?: string;
};

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [openAdmin, setOpenAdmin] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);  // New state for dropdown

  // Load user from localStorage
  const loadUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return setUser(null);
      setUser(JSON.parse(raw) ?? null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUserFromStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") loadUserFromStorage();
    };

    const handleUserUpdate = () => loadUserFromStorage();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  const role = user?.role?.toLowerCase() || "user";
  const isSuperAdmin = role === "super-admin";
  const isAdminOnly = role === "admin";
const isViewer = role === "viewer";

  const isAdmin = isSuperAdmin || isAdminOnly;

  useEffect(() => {
    if (!isAdmin) {
      setOpenAdmin(false);
      return;
    }

const inAdmin =
  pathname.startsWith("/admin/company-settings") ||
  pathname.startsWith("/admin/agents") ||
  pathname.startsWith("/admin/integration");


    setOpenAdmin(inAdmin);
  }, [pathname, isAdmin]);

useEffect(() => {
  // Admins are allowed everywhere
  if (isAdmin) return;

  // Viewer restrictions
  const restricted =
    pathname.startsWith("/admin/company-settings") ||
    pathname.startsWith("/admin/integration") ||
    pathname.startsWith("/admin/organizations") ||
    pathname.startsWith("/admin/agents"); // admin agents page

  // ✅ Viewer allowed ONLY on users-agent
  if (restricted && !pathname.startsWith("/admin/users-agent")) {
    router.replace("/admin/account");
  }
}, [pathname, isAdmin, router]);


  const sidebarWidth = useMemo(
    () => BASE_W + (isAdmin && openAdmin ? FLYOUT_W : 0),
    [isAdmin, openAdmin]
  );

  const isAdminActive =
    isAdmin &&
    (openAdmin ||
      pathname.startsWith("/admin/company-settings") ||
      pathname.startsWith("/admin/agents") ||
      pathname.startsWith("/admin/integration"));

  const avatarSrc =
    user?.image ||
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%236b46c1'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='28'>U</text></svg>";

  return (
    <div
      className={`relative bg-[#1E0B40] text-white flex flex-col rounded-r-4xl h-screen sticky top-0 overflow-hidden transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? "w-[80px]" : `${sidebarWidth}px`
      }`}
      style={{
        ["--sidebar-w" as any]: `${sidebarWidth}px`,
      }}
    >
      <div className="w-full h-full overflow-y-auto flex flex-col">
        {/* Logo */}
        <div className="p-8 flex items-center gap-5">
          <Image src={Logo} alt="logo" width={40} height={40} />
          {!isSidebarCollapsed && (
            <span className="text-2xl font-semibold">ConverAIx</span>
          )}
        </div>

        {/* Toggle Button for Collapsing Sidebar */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-5 right-2 sm:hidden p-2 bg-[#1B0A3A] rounded-full text-white"
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={24} />
          ) : (
            <ChevronLeft size={24} />
          )}
        </button>

        {/* Navigation */}
        <nav className="px-4 py-4 mb-6 flex-1 overflow-y-auto">
          <NavItem
            className="my-4"
            href="/admin/dashboard"
            icon={<Star size={20} />}
            label="Dashboard"
            active={pathname === "/admin/dashboard"}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <NavItem
            className="my-4"
            href="/admin/call-logs"
            icon={<Phone size={20} />}
            label="Call Logs"
            active={pathname === "/admin/call-logs"}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <NavItem
            className="my-4"
            href="/admin/chat-logs"
            icon={<MessageSquare size={20} />}
            label="Chat Logs"
            active={pathname === "/admin/chat-logs"}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <NavItem
            className="my-4"
            href="/admin/tickets"
            icon={<Ticket size={20} />}
            label="Ticket Logs"
            badge="99+"
            active={pathname === "/admin/tickets"}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <NavItem
            className="my-4"
            href="/admin/pending-chats"
            icon={<MessageCircle size={20} />}
            label="Pending Chats"
            badge="99+"
            active={pathname === "/admin/pending-chats"}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <NavItem
            className="my-4"
            href="/admin/knowledge-sources"
            icon={<BookOpen size={20} />}
            label="Knowledge Sources"
            active={pathname === "/admin/knowledge-sources"}
            isSidebarCollapsed={isSidebarCollapsed}
          />

{isViewer && (
  <NavItem
    href="/admin/my-agent"
    icon={<UsersIcon size={18} />}
    label="Agents"
    active={pathname.startsWith("/admin/my-agent")}
    isSidebarCollapsed={isSidebarCollapsed}
  />
)}

{/* Admin Panel */}
{isAdmin && !isSuperAdmin && (  // Exclude Super Admin here
  <div>
    <NavItem
      className="my-4"
      href="/admin/company-settings"
      icon={<UsersIcon size={20} />}
      label="Admin Panel"
      active={isAdminActive}
      accessory={
        <ChevronRight
          size={16}
          className={`transition-transform ${dropdownOpen ? "rotate-90" : ""}`}
        />
      }
      onClick={() => setDropdownOpen(!dropdownOpen)}
      isSidebarCollapsed={isSidebarCollapsed}
    />
    {/* Dropdown for Admin Panel */}
    {dropdownOpen && (
      <div className="pl-8 mt-2 space-y-2">
        {/* Company Settings */}
        <NavItem
          href="/admin/company-settings"
          icon={<Building2 size={18} />}
          label="Company Settings"
          active={pathname.startsWith("/admin/company-settings")}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        {/* Users */}

        {/* Agents */}
        <NavItem
          href="/admin/agents"
          icon={<UsersIcon size={18} />}
          label="Agents"
          active={pathname.startsWith("/admin/agents")}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        {/* Integration */}
        <NavItem
          href="/admin/integration"
          icon={<Grid2x2 size={18} />}
          label="Integration"
          active={pathname.startsWith("/admin/integration")}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      </div>
    )}
  </div>
)}



{/* Master Admin */}
{isSuperAdmin && (
  <NavItem
    className="my-4"
    href="/admin/organizations"
    icon={<BookOpen size={20} />}
    label="Master Admin"
    active={pathname.startsWith("/admin/organization")}
    isSidebarCollapsed={isSidebarCollapsed}
  />
)}




        </nav>

        {/* Footer */}
        <div className="mt-auto">
          <Link
            href="/admin/support"
            className="p-4 border-t border-[#4B1D63] flex items-center justify-between hover:bg-white/10 rounded-md"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={20} />
              <span className="text-sm font-medium">Support</span>
            </div>
            <ChevronRight size={16} />
          </Link>

          <Link
            href="/admin/account"
            className="p-4 flex items-center gap-3 border-t border-[#3B1D63] hover:bg-white/10 rounded-md"
          >
            <img
              src={avatarSrc}
              width={40}
              height={40}
              className="rounded-full object-cover"
              alt="avatar"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold">{user?.name ?? "User"}</div>
              <div className="text-xs text-gray-300">Account settings</div>
            </div>
            <ChevronDown size={16} />
          </Link>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("userUpdated"));
            window.location.href = "/admin/login";
          }}
          className="p-4 w-full text-left flex items-center gap-3 border-t border-[#3B1D63] hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
            />
          </svg>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  badge?: string | null;
  className?: string;
  onClick?: () => void;
  accessory?: React.ReactNode;
  isSidebarCollapsed?: boolean;
};

function NavItem({
  icon,
  label,
  href,
  active = false,
  badge = null,
  className = "",
  onClick,
  accessory,
  isSidebarCollapsed = false,
}: NavItemProps) {
  return (
    <Link href={href} className={`block ${className}`} onClick={onClick}>
      <div
        className={`flex items-center px-4 py-2 rounded-xl cursor-pointer transition-colors ${
          active ? "bg-[#A855F7] text-white" : "hover:bg-white/10 text-white"
        }`}
      >
        <div className="mr-3">{icon}</div>
        {!isSidebarCollapsed && <span className="flex-1 text-sm font-medium">{label}</span>}

        {badge && (
          <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            {badge}
          </span>
        )}

        {accessory ?? null}
      </div>
    </Link>
  );
}

export default Sidebar;
