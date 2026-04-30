import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSite } from '@/context/SiteContext';

interface InkopiaPenSVGProps {
  inkColor: string;
  isFilling: boolean;
  className?: string;
}

/**
 * InkopiaPenSVG Component
 * Renders the primary British Racing Green outline pen with a precision-mapped 
 * liquid ink filling animation.
 */
export const InkopiaPenSVG: React.FC<InkopiaPenSVGProps> = ({ inkColor, isFilling, className = "" }) => {
  const { content } = useSite();
  const [fillLevel, setFillLevel] = useState(0);

  useEffect(() => {
    if (isFilling) {
      // Trigger the "filling" animation sequence
      setFillLevel(1);
    } else {
      setFillLevel(0);
    }
  }, [isFilling, inkColor]); // Re-run when color changes to show "refilling"

  return (
    <div className={`relative flex items-center justify-center ${className} select-none`}>
      {/* 1. Ambient Glow - Matches Ink Color */}
      <motion.div
        key={`glow-${inkColor}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute w-[140%] h-[140%] rounded-full blur-[80px] pointer-events-none z-0"
        style={{ 
          background: `radial-gradient(circle, ${inkColor}33 0%, transparent 70%)`,
        }}
      />

      {/* 2. Base Pen Asset - The "British Racing Green" outline pen */}
      <motion.img
        src={content.penImage}
        alt="Inkopia Master Pen"
        className="relative z-30 h-full w-auto object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)] rotate-45 scale-[1.3]"
        initial={{ opacity: 0, y: 40, rotate: 45 }}
        animate={{ opacity: 1, y: 0, rotate: 45 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* 3. Antigravity Fluid Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        {/* We use a container that matches the aspect ratio or directly overlay the SVG */}
        <svg viewBox="0 0 100 100" className="h-[130%] w-auto aspect-square overflow-visible">
          <defs>
            <clipPath id="reservoir-mask">
              {/* Adjusted to target the lower barrel window */}
              <rect x="48.5" y="65" width="4" height="12" rx="0.5" />
            </clipPath>
          </defs>
          
          <g clipPath="url(#reservoir-mask)">
            {/* The Ink Liquid */}
            <motion.g
              key={inkColor} // Re-trigger animation on color change
              initial={{ y: 25 }} // Start below the reservoir
              animate={{ y: isFilling ? 0 : 25 }}
              transition={{
                duration: 2.8,
                ease: [0.16, 1, 0.3, 1], // easeOut
                type: "spring",
                stiffness: 15,
                damping: 15
              }}
            >
              {/* Main Liquid Body */}
              <rect
                x="47"
                y="65"
                width="7"
                height="15"
                fill={inkColor}
              />
              
              {/* Meniscus (Curved Surface) */}
              <ellipse
                cx="50.5"
                cy="65"
                rx="2"
                ry="1.5"
                fill={inkColor}
              />
            </motion.g>
          </g>
        </svg>
      </div>

      {/* 4. Subtle Shimmer / Glass Reflection */}
      <div className="absolute inset-0 z-40 pointer-events-none opacity-20 mix-blend-overlay flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-auto aspect-square">
           <rect x="48.5" y="46" width="1.5" height="24" fill="white" rx="0.5" />
        </svg>
      </div>
    </div>
  );
};
