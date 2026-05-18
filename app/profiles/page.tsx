"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default function ProfilesPage() {
  const { 
    profiles, 
    setCurrentProfile, 
    addProfile, 
    removeProfile,
    isAuthenticated,
    isManagingProfiles,
    setIsManagingProfiles
  } = useApp();
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const router = useRouter();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const handleSelectProfile = (profile: Profile) => {
    if (isManagingProfiles) return;
    setCurrentProfile(profile);
    router.push("/home");
  };

  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      addProfile(newProfileName.trim());
      setNewProfileName("");
      setIsAddingProfile(false);
    }
  };

  const handleDeleteProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this profile?")) {
      removeProfile(profileId);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative text-center">
        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {isManagingProfiles ? "Manage Profiles" : "Select Profile"}
        </h1>
        {isManagingProfiles && (
          <p className="text-muted-foreground mb-8">Click on a profile to edit or delete it</p>
        )}

        {/* Profiles grid */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 mt-8">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleSelectProfile(profile)}
              className={cn(
                "group flex flex-col items-center gap-3 transition-transform",
                !isManagingProfiles && "hover:scale-105"
              )}
            >
              <div className="relative">
                <Avatar className={cn(
                  "h-28 w-28 border-4 transition-colors",
                  isManagingProfiles 
                    ? "border-muted-foreground/30" 
                    : "border-transparent group-hover:border-primary"
                )}>
                  <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Delete button when managing */}
                {isManagingProfiles && (
                  <button
                    onClick={(e) => handleDeleteProfile(e, profile.id)}
                    className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Edit icon overlay when managing */}
                {isManagingProfiles && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Pencil className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                {profile.name}
              </span>
            </button>
          ))}

          {/* Add Profile button */}
          {!isAddingProfile ? (
            <button
              onClick={() => setIsAddingProfile(true)}
              className="group flex flex-col items-center gap-3 transition-transform hover:scale-105"
            >
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50 group-hover:border-primary transition-colors">
                <Plus className="h-12 w-12 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                Add Profile
              </span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                <Plus className="h-12 w-12 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="h-9 w-32 bg-secondary border-0 text-center"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddProfile();
                    if (e.key === "Escape") setIsAddingProfile(false);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddProfile} disabled={!newProfileName.trim()}>
                  Add
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAddingProfile(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {profiles.length === 0 && !isAddingProfile && (
          <p className="text-muted-foreground mb-8">
            No profiles yet. Click &quot;Add Profile&quot; to create one.
          </p>
        )}

        {/* Manage Profiles button */}
        <Button
          variant="outline"
          onClick={() => setIsManagingProfiles(!isManagingProfiles)}
          className={cn(
            "border-muted-foreground/50 text-muted-foreground hover:text-foreground",
            "hover:border-foreground transition-colors",
            isManagingProfiles && "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
          )}
        >
          {isManagingProfiles ? "DONE" : "MANAGE PROFILES"}
        </Button>
      </div>
    </div>
  );
}
