// src/pages/ErrorPage.jsx
// Shown for React Router loader errors (404, failed fetch, offline)
// Also detects navigator.onLine to show a specific offline message.

import React, { useEffect, useState } from 'react';
import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';
import { WifiOff, AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Derive message from error type
  let heading, message, icon;

  if (!isOnline) {
    icon    = <WifiOff size={56} className="text-blue-400" />;
    heading = "You're offline";
    message = "Check your internet connection and try again. Any packs you've already loaded are still playable.";
  } else if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      icon    = <AlertTriangle size={56} className="text-yellow-400" />;
      heading = 'Page not found';
      message = "That page doesn't exist. Head back home and try again.";
    } else {
      icon    = <AlertTriangle size={56} className="text-red-400" />;
      heading = `Something went wrong (${error.status})`;
      message = error.data ?? 'An unexpected error occurred while loading this page.';
    }
  } else {
    icon    = <AlertTriangle size={56} className="text-red-400" />;
    heading = 'Something went wrong';
    message = error?.message ?? 'An unexpected error occurred.';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">

        <div className="flex justify-center mb-6">{icon}</div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">{heading}</h1>
        <p className="text-gray-500 mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
          >
            <Home size={18} /> Go Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            <RefreshCw size={18} /> Try Again
          </button>
        </div>

        {/* Re-enable navigation once back online */}
        {!isOnline && (
          <p className="mt-6 text-sm text-blue-500 animate-pulse">
            Waiting for connection...
          </p>
        )}
      </div>
    </div>
  );
}