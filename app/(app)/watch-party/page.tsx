"use client";

import { useState } from "react";
import { Link2, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WatchPartyRoom {
  code: string;
  hostName: string;
  mediaTitle: string;
  participants: number;
}

// Mock active rooms
const MOCK_ROOMS: WatchPartyRoom[] = [
  { code: "A9F8X1", hostName: "John", mediaTitle: "The Boys S4E1", participants: 5 },
  { code: "B2K4M3", hostName: "Sarah", mediaTitle: "Oppenheimer", participants: 3 },
];

export default function WatchPartyPage() {
  const [partyCode, setPartyCode] = useState("");
  const [rooms] = useState<WatchPartyRoom[]>(MOCK_ROOMS);

  const handleConnect = () => {
    if (partyCode.trim()) {
      // Mock connection - in real app, this would connect to WebSocket
      alert(`Connecting to room: ${partyCode}`);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center pt-8">
        <h1 className="text-4xl font-bold italic text-foreground mb-4">
          Kasenflix Cinema Parties
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Stream movies and TV episodes alongside friends in a fully synchronized room with a real-time live chat panel.
        </p>
      </div>

      {/* Main cards */}
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Join a Room Card */}
        <div className="rounded-2xl border-2 border-primary/50 bg-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Link2 className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Enter Party Code</h2>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="EX: A9F8X1"
              value={partyCode}
              onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
              className="h-12 text-center text-lg tracking-widest bg-secondary border-0"
              maxLength={6}
            />
            <Button
              onClick={handleConnect}
              className="w-full h-12 text-base bg-primary hover:bg-primary/90"
              disabled={!partyCode.trim()}
            >
              Connect to Room
            </Button>
          </div>
        </div>

        {/* Host a Room Card */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Host Your Own Room</h2>
          </div>

          <p className="text-muted-foreground mb-6">
            Want to control the screening? Select any movie card or TV show episode in details and click &quot;Start Watch Party&quot; to generate your shareable party code.
          </p>

          <div className="rounded-lg bg-secondary/50 p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Hosts are capable of synchronizing play actions for all joined audience members.
            </p>
          </div>
        </div>
      </div>

      {/* Active Rooms */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6">Active Rooms</h2>

        {rooms.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.code}
                className="rounded-xl bg-card border border-border p-4 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded">
                    {room.code}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {room.participants} watching
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{room.mediaTitle}</h3>
                <p className="text-sm text-muted-foreground">Hosted by {room.hostName}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl bg-card border border-dashed border-border">
            <p className="text-muted-foreground">No active rooms at the moment</p>
            <p className="text-sm text-muted-foreground/70">Be the first to host a watch party!</p>
          </div>
        )}
      </div>
    </div>
  );
}
