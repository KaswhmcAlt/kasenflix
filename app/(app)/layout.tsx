"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SearchBar } from "@/components/search-bar";
import { useApp } from "@/lib/context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentProfile } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !pathname.startsWith("/login")) {
      router.push("/login");
    }
    // Redirect to profile selection if authenticated but no profile selected
    else if (isAuthenticated && !currentProfile && !pathname.startsWith("/profiles")) {
      router.push("/profiles");
    }
  }, [isAuthenticated, currentProfile, router, pathname]);

  // Don't show app shell on login or profile pages
  if (!isAuthenticated || !currentProfile) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <div className="flex-1 ml-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-background/80 backdrop-blur-sm px-8 py-4">
          <SearchBar className="flex-1 max-w-lg" />
          
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={currentProfile.avatarUrl} alt={currentProfile.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {currentProfile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main content */}
        <main className="px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
