import React, { useState, useEffect } from "react";

export default function Navbar() {
  const [theme, setTheme] = useState(() => {
    // Get saved theme from localStorage or fallback to light
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <nav className="navbar">
      <div className="logo">🎮 GameLearn</div>
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="#games">Games</a></li>
        <li><a href="#about">About</a></li>
      </ul>
      <button onClick={toggleTheme}>
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>
    </nav>
  );
}
