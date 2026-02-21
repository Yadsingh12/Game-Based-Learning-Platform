import React from "react";
import { Outlet, useMatches, useNavigation } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function AppLayout() {
  const navigation = useNavigation();
  const matches = useMatches();
  const last = matches[matches.length - 1];
  const title = last?.handle?.title ?? "Sign Language Learning";
  const isLoading = navigation.state === "loading";

  return (
    // Full viewport height, no overflow on the shell
    <div className="h-dvh flex flex-col overflow-hidden">

      {/* Loading bar — fixed so it doesn't affect layout */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[2px]">
          <div className="h-full bg-gradient-to-r from-violet-600 to-blue-500 animate-loading-bar" />
        </div>
      )}

      {/* Navbar — fixed height, never grows */}
      <div className="flex-none">
        <Navbar title={title} />
      </div>

      {/* Content area — takes exactly the remaining height, scrolls independently */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>

    </div>
  );
}