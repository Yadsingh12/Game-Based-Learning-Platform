// src/components/SignVisual.jsx
import React, { useState, useEffect } from 'react';

// Helper to render SVG shapes from inline data
const renderSVGShape = (shapeData, color = "#4CAF50") => {
  const { type } = shapeData;
  
  switch (type) {
    case "polygon":
      return (
        <polygon 
          points={shapeData.points} 
          fill={color} 
          stroke="#333" 
          strokeWidth="2" 
        />
      );
      
    case "circle":
      return (
        <circle 
          cx={shapeData.cx} 
          cy={shapeData.cy} 
          r={shapeData.r} 
          fill={color} 
          stroke="#333" 
          strokeWidth="2" 
        />
      );
      
    case "ellipse":
      return (
        <ellipse 
          cx={shapeData.cx} 
          cy={shapeData.cy} 
          rx={shapeData.rx} 
          ry={shapeData.ry} 
          fill={color} 
          stroke="#333" 
          strokeWidth="2" 
        />
      );
      
    case "path":
      return (
        <path 
          d={shapeData.d} 
          fill={shapeData.fill || color} 
          fillRule={shapeData.fillRule}
          stroke="#333" 
          strokeWidth="2" 
        />
      );
      
    case "g":
      return <g dangerouslySetInnerHTML={{ __html: shapeData.d }} />;
      
    default:
      return null;
  }
};

export default function SignVisual({ visual, assets, className = "" }) {
  const [svgPathData, setSvgPathData] = useState(null);

  // Load SVG path data for states
  useEffect(() => {
    if (visual?.type === 'svg-path' && visual?.svgId) {
      fetch('/assets/RecognizeState/india.svg')
        .then(res => res.text())
        .then(svgText => {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
          const pathElement = svgDoc.querySelector(`[id="${visual.svgId}"]`);
          if (pathElement) {
            setSvgPathData({
              d: pathElement.getAttribute('d'),
            });
          }
        })
        .catch(err => console.error('Error loading SVG:', err));
    }
  }, [visual]);

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

    case "svg-inline":
      if (!visual.data) return null;
      return (
        <div className={`w-full h-full flex items-center justify-center ${className}`}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            className="w-full h-full"
          >
            {renderSVGShape(visual.data, visual.color)}
          </svg>
        </div>
      );

    // Handle state SVG paths from India map - CENTERED VERSION
    case "svg-path": {
      if (!svgPathData) {
        return <div className={`w-full h-full rounded-xl bg-gray-200 ${className}`} />;
      }

      // Helper function to calculate bounding box from path data
      const getBBox = (pathData) => {
        try {
          // Create temporary SVG elements to calculate bounds
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('style', 'position: absolute; visibility: hidden;');
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', pathData);
          svg.appendChild(path);
          document.body.appendChild(svg);
          
          const bbox = path.getBBox();
          
          document.body.removeChild(svg);
          return bbox;
        } catch (error) {
          console.error('Error calculating bbox:', error);
          // Return default if calculation fails
          return { x: 0, y: 0, width: 100, height: 100 };
        }
      };

      const bbox = getBBox(svgPathData.d);
      const padding = 5; // Padding around the shape
      
      // Create a viewBox centered on the state shape
      const centeredViewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;
      
      return (
        <div className={`w-full h-full flex items-center justify-center rounded-xl ${className}`}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox={centeredViewBox}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <path 
              d={svgPathData.d} 
              fill={visual.color || "#4CAF50"} 
              stroke="#333" 
              strokeWidth="2" 
            />
          </svg>
        </div>
      );
    }

    default:
      return null;
  }
}