// src/components/GameCard.jsx

import React, { useState } from "react";
import placeholder from "../assets/images/placeholder.png";
import "./GameCard.css";

export default function GameCard({ imagePath, title, alt, link }) {
  const [imgSrc, setImgSrc] = useState(imagePath || placeholder);

  const handleError = () => {
    setImgSrc(placeholder);
  };

  return (
    <a href={link} className="game-card">
      <img
        src={imgSrc}
        alt={alt || "Game Logo"}
        className="game-image"
        onError={handleError}
      />
      <h3>{title}</h3>
    </a>
  );
}
