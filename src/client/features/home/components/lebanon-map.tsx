'use client';

import { motion } from 'motion/react';
import {
  LEBANON_CITIES,
  LEBANON_PATH,
  LEBANON_VIEWBOX,
} from '@/client/features/home/lib/lebanon-geo';

/**
 * Real map of Lebanon rendered as inline SVG — the border comes from actual
 * geodata (geoBoundaries, gbOpen LBN ADM0), simplified and projected. Fully
 * self-contained: no map library, tiles, API keys, or network requests.
 */
const PIN_PATH = 'M0 0 C -3.5 -5 -5.5 -7.5 -5.5 -11 a 5.5 5.5 0 1 1 11 0 C 5.5 -7.5 3.5 -5 0 0 Z';

export function LebanonMap() {
  return (
    <svg
      viewBox={LEBANON_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label="Map of Lebanon showing billboard coverage"
    >
      <defs>
        <linearGradient id="lb-land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eef2ff" />
        </linearGradient>
        <filter id="lb-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#1e3a8a" floodOpacity="0.15" />
        </filter>
      </defs>

      <path
        d={LEBANON_PATH}
        fill="url(#lb-land)"
        stroke="#93c5fd"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#lb-shadow)"
      />

      {LEBANON_CITIES.map((city, index) => (
        <g key={city.name} transform={`translate(${city.x} ${city.y})`}>
          <motion.g
            animate={{ y: [0, -3.5, 0] }}
            transition={{ duration: 3 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {city.primary ? (
              <motion.circle
                cy={-11}
                r={5.5}
                fill="#2563eb"
                animate={{ r: [5.5, 13], opacity: [0.4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              />
            ) : null}
            <path
              d={PIN_PATH}
              fill={city.primary ? '#2563eb' : '#3b82f6'}
              stroke="#ffffff"
              strokeWidth={1.2}
            />
            <circle cy={-11} r={2} fill="#ffffff" />
            <text
              x={city.side === 'right' ? 9 : -9}
              y={-8}
              textAnchor={city.side === 'right' ? 'start' : 'end'}
              fontSize={12}
              fontWeight={600}
              fill="#475569"
              stroke="#ffffff"
              strokeWidth={3}
              paintOrder="stroke"
              className="select-none"
            >
              {city.name}
            </text>
          </motion.g>
        </g>
      ))}
    </svg>
  );
}
