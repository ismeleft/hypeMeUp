'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

export default function ConfettiEffect({ trigger, onComplete }: ConfettiEffectProps) {
  useEffect(() => {
    if (trigger) {
      // Fire multiple confetti bursts
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 10000,
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      // Main confetti blast
      const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire from left
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FF0000', '#FFD700', '#00BFFF', '#EDEDED'],
        });

        // Fire from right
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FF0000', '#FFD700', '#00BFFF', '#EDEDED'],
        });
      }, 250);

      // Immediate burst on trigger
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF0000', '#FFD700', '#A01D1D', '#EDEDED'],
      });

      // Cleanup
      return () => {
        clearInterval(interval);
      };
    }
  }, [trigger, onComplete]);

  return null; // This component doesn't render anything
}
