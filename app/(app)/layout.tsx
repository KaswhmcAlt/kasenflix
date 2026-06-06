"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SearchBar } from "@/components/search-bar";
import { VideoModalPlayer } from "@/components/video-modal-player";
import { MediaDetailsModal } from "@/components/media-details-modal";
import { useApp } from "@/lib/context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { videoPlayerState, setVideoPlayerState } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <AppSidebar />

      <div className="flex-1 lg:ml-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 bg-background/80 backdrop-blur-sm px-4 py-3 pl-16 lg:px-8 lg:py-4 lg:pl-8">
          <SearchBar className="flex-1 max-w-lg" />
        </header>

        {/* Main content */}
        <main className="px-4 pb-24 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Details Modal */}
      <MediaDetailsModal />

      {/* Video Modal Player */}
      <VideoModalPlayer state={videoPlayerState} setState={setVideoPlayerState} />
    </div>
  );
}
