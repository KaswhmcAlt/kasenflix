"use client";

import { X } from "lucide-react";

interface TrailerModalProps {
  videoKey: string | null;
  title: string;
  onClose: () => void;
}

export function TrailerModal({ videoKey, title, onClose }: TrailerModalProps) {
  if (!videoKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Title */}
      <div className="absolute top-4 left-4 text-white font-medium">
        {title} - Trailer
      </div>

      {/* Video */}
      <div className="w-full max-w-5xl aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
          title={`${title} Trailer`}
          className="w-full h-full border-0 rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
