"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Gift, LayoutDashboard, Settings, Shapes } from "lucide-react";
import { QuickAdd } from "./quick-add";
import { PwaRegister } from "./pwa-register";
import { cx } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/templates", label: "Templates", icon: Shapes },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">SU</div><div><strong>Study Unlock</strong><span>output → reward</span></div></div>
      <nav>{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cx("nav-item", pathname.startsWith(href) && "active")}><Icon size={18}/><span>{label}</span></Link>)}</nav>
      <div className="sidebar-note">Today is independent.<br/>No streaks. No debt.</div>
    </aside>
    <main className="content">{children}</main>
    <QuickAdd />
    <nav className="mobile-nav">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cx(pathname.startsWith(href) && "active")}><Icon size={18}/><span>{label}</span></Link>)}</nav>
    <PwaRegister />
  </div>;
}
