// src/components/SignVisual.jsx
import React from 'react';

export default function SignVisual({ visual, assets, className = "" }) {
  if (!visual) return null;

  switch (visual.type) {
    case "style":
      return (
        <div
          className={`
            relative w-full h-full
            flex items-center justify-center
            rounded-xl
            bg-gradient-to-br from-gray-100 to-gray-200
            shadow-inner
            ${className}
          `}
        >
          <span
            className="
              text-6xl sm:text-7xl md:text-8xl
              font-extrabold
              text-gray-800
              drop-shadow-sm
              select-none
            "
          >
            {visual.value}
          </span>
        </div>
      );

    case "color":
      return (
        <div
          className={`w-full h-full rounded-xl ${className}`}
          style={{ backgroundColor: visual.value }}
          aria-label={`Color ${visual.value}`}
        />
      );

    case "image": {
      const imgAsset = assets?.images?.[visual.value];
      if (!imgAsset) return null;
      return (
        <img
          src={imgAsset.src}
          alt="sign"
          className={`rounded-xl object-contain ${className}`}
        />
      );
    }

    case "svg": {
      const svgAsset = assets?.svgs?.find(s => s.id === visual.id);
      if (!svgAsset) return null;
      return (
        <img
          src={svgAsset.path}
          alt="sign"
          className={`rounded-xl ${className}`}
        />
      );
    }

    default:
      return null;
  }
}
