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

// Helper to render clock face
const ClockVisual = ({ hour, minute, period, className = "" }) => {
  const CLOCK_RADIUS = 100;
  const CENTER = { x: CLOCK_RADIUS, y: CLOCK_RADIUS };
  const HOUR_HAND_LENGTH = 50;
  const MINUTE_HAND_LENGTH = 70;

  // Convert time to angles
  const timeToAngle = ({ hour, minute }) => ({
    minute: (minute % 60) * 6,
    hour: ((hour % 12) + minute / 60) * 30,
  });

  // Convert angle to SVG coordinates
  const angleToCoords = (angleDeg, length) => {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: CENTER.x + length * Math.cos(rad),
      y: CENTER.y + length * Math.sin(rad),
    };
  };

  const angles = timeToAngle({ hour, minute });
  const hourHand = angleToCoords(angles.hour, HOUR_HAND_LENGTH);
  const minuteHand = angleToCoords(angles.minute, MINUTE_HAND_LENGTH);

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center ${className}`}>
      <svg
        width={2 * CLOCK_RADIUS}
        height={2 * CLOCK_RADIUS}
        viewBox={`0 0 ${2 * CLOCK_RADIUS} ${2 * CLOCK_RADIUS}`}
        className="w-full h-full"
        style={{ maxWidth: '200px', maxHeight: '200px' }}
      >
        {/* Clock face */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={CLOCK_RADIUS}
          fill="#fff"
          stroke="#000"
          strokeWidth="2"
        />

        {/* Hour ticks */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = CENTER.x + Math.cos(angle) * 80;
          const y1 = CENTER.y + Math.sin(angle) * 80;
          const x2 = CENTER.x + Math.cos(angle) * 90;
          const y2 = CENTER.y + Math.sin(angle) * 90;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth="2" />;
        })}

        {/* Hour numbers */}
        {[...Array(12)].map((_, i) => {
          const angle = ((i * 30 - 60) * Math.PI) / 180;
          const x = CENTER.x + Math.cos(angle) * 65;
          const y = CENTER.y + Math.sin(angle) * 65 + 5;
          return (
            <text key={i + 1} x={x} y={y} textAnchor="middle" fontSize="14" fontWeight="600" fill="#111">
              {i + 1}
            </text>
          );
        })}

        {/* Hour hand */}
        <line
          x1={CENTER.x}
          y1={CENTER.y}
          x2={hourHand.x}
          y2={hourHand.y}
          stroke="#111"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1={CENTER.x}
          y1={CENTER.y}
          x2={minuteHand.x}
          y2={minuteHand.y}
          stroke="#2563eb"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Center cap */}
        <circle cx={CENTER.x} cy={CENTER.y} r="4" fill="#000" />
      </svg>
      
      {/* Display time below clock */}
      <div className="mt-2 text-center">
        <span className="text-lg font-bold">
          {hour}:{minute.toString().padStart(2, '0')} {period}
        </span>
      </div>
    </div>
  );
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

    // NEW: Handle clock visuals
    case "clock":
      return (
        <ClockVisual 
          hour={visual.hour} 
          minute={visual.minute} 
          period={visual.period}
          className={className}
        />
      );

    default:
      return null;
  }
}