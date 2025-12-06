'use client';

import { motion } from 'framer-motion';

interface HypeLevelSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const getHypeLevelColor = (level: number): string => {
  if (level <= 3) return 'var(--eva-green)';
  if (level <= 6) return 'var(--eva-purple)';
  return '#ff6600';
};

const getHypeLevelLabel = (level: number): string => {
  if (level <= 3) return 'Getting Started';
  if (level <= 6) return 'Making Progress';
  if (level <= 8) return 'Great Work';
  return 'Unstoppable';
};

export default function HypeLevelSlider({ value, onChange }: HypeLevelSliderProps) {
  const color = getHypeLevelColor(value);
  const label = getHypeLevelLabel(value);

  return (
    <div className="w-full space-y-3">
      {/* Label and Value Display */}
      <div className="flex justify-between items-center">
        <motion.span
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-medium"
          style={{ color }}
        >
          {label}
        </motion.span>
        <motion.span
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-base font-semibold"
          style={{ color }}
        >
          {value}/10
        </motion.span>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="eva-slider w-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${
              (value / 10) * 100
            }%, var(--eva-medium-gray) ${(value / 10) * 100}%, var(--eva-medium-gray) 100%)`,
          }}
        />

        {/* Visual Markers */}
        <div className="flex justify-between mt-2 px-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mark) => (
            <div
              key={mark}
              className="w-0.5 h-2 transition-all duration-200"
              style={{
                backgroundColor: mark <= value ? color : 'var(--eva-border)',
                opacity: mark <= value ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
