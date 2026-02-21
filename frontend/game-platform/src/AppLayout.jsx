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
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Loading bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-black/10">
          <div className="h-full bg-purple-500 animate-loading-bar" />
        </div>
      )}

      {/* Navbar */}
      <Navbar title={title} />

      {/* 
        IMPORTANT:
        pt-16 ensures strict boundary so content
        never hides behind navbar (64px height)
      */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
}