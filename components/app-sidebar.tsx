"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Film,
  Tv,
  Compass,
  Users,
  UserCircle,
  LogOut,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/movies", icon: Film, label: "Movies" },
  { href: "/tv", icon: Tv, label: "TV Shows" },
  { href: "/finder", icon: Compass, label: "Finder" },
  { href: "/watch-party", icon: Users, label: "Watch Party" },
  { href: "/watchlist", icon: Bookmark, label: "Watchlist" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentProfile, logout } = useApp();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          K
        </div>
        <span className="text-xl font-bold">
          <span className="text-primary">KASEN</span>
          <span className="text-foreground">FLIX</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border px-3 py-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/profiles"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            >
              <UserCircle className="h-5 w-5" />
              Switch Profile
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Current profile indicator */}
      {currentProfile && (
        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentProfile.avatarUrl} alt={currentProfile.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {currentProfile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-sidebar-foreground">
              {currentProfile.name}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
