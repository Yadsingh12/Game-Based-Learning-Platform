import React, { useState } from "react";
import { useNavigate, useMatches, useLocation } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";

function useBackPath() {
  const matches = useMatches();
  const last = matches[matches.length - 1];
  const { category, packId } = last?.params ?? {};
  switch (last?.id) {
    case "game":     return `/${category}/${packId}`;
    case "content":  return `/${category}`;
    case "signType": return "/";
    case "about":    return "/";
    default:         return null;
  }
}

export default function Navbar({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = useBackPath();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-purple-100 shadow-sm shadow-purple-100/50">

      {/* Gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-600 via-blue-500 to-violet-600" />

      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2">

        {/* Back button */}
        {backPath && (
          <button
            onClick={() => navigate(backPath)}
            aria-label="Go back"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500
                       hover:text-violet-700 hover:bg-violet-50
                       active:scale-90 transition-all duration-150"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        )}

        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 mr-auto group"
        >
          {/* Icon mark */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600
                          flex items-center justify-center shadow-md shadow-violet-200
                          group-hover:shadow-violet-300 group-hover:scale-105 transition-all duration-200">
            <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
              <path d="M5 15V8M5 8L10 5L15 8M15 8V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="10" cy="12" r="2.5" fill="white" fillOpacity="0.95"/>
            </svg>
          </div>

          {/* Wordmark */}
          <div className="flex flex-col leading-none">
            <span className="font-black text-[1.05rem] tracking-tight bg-gradient-to-r from-violet-700 to-blue-600 bg-clip-text text-transparent">
              SignLearn
            </span>
            {title && title !== "Sign Language Learning" && (
              <span className="text-[0.6rem] font-semibold tracking-widest uppercase text-gray-400 mt-0.5">
                {title}
              </span>
            )}
          </div>
        </button>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink active={isActive("/")} onClick={() => navigate("/")}>Home</NavLink>
          <NavLink active={isActive("/about")} onClick={() => navigate("/about")}>About</NavLink>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl
                     text-gray-500 hover:text-violet-700 hover:bg-violet-50
                     active:scale-90 transition-all duration-150"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out
                       ${menuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="border-t border-purple-50 bg-white/95 px-3 py-2 flex flex-col gap-1">
          <MobileNavLink active={isActive("/")}   onClick={() => { navigate("/");      setMenuOpen(false); }}>Home</MobileNavLink>
          <MobileNavLink active={isActive("/about")} onClick={() => { navigate("/about"); setMenuOpen(false); }}>About</MobileNavLink>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150
        ${active
          ? "text-violet-700 bg-violet-50"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/80"
        }`}
    >
      {children}
      {/* Animated underline */}
      <span className={`absolute bottom-1 left-3 right-3 h-[2px] rounded-full
                        bg-gradient-to-r from-violet-600 to-blue-500
                        transition-all duration-200 origin-left
                        ${active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`}
      />
    </button>
  );
}

function MobileNavLink({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-150 border-l-2
        ${active
          ? "bg-violet-50 text-violet-700 border-violet-500"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"
        }`}
    >
      {children}
    </button>
  );
}