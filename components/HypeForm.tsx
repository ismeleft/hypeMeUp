'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HypeLevelSlider from './HypeLevelSlider';
import ConfettiEffect from './ConfettiEffect';

interface HypeFormProps {
  onSubmit?: (data: { content: string; hypeLevel: number }) => Promise<void>;
}

// Predefined praise messages
const PRAISE_MESSAGES = [
  'LEGENDARY!',
  'Promote this human immediately!',
  "You're the MVP!",
  'CALL THE PRESS!',
  'UNSTOPPABLE FORCE!',
  'CRUSHING IT!',
  'HALL OF FAME MATERIAL!',
  'EPIC WIN!',
  'ABSOLUTE LEGEND!',
  'NEXT LEVEL ACHIEVED!',
  'BEAST MODE ACTIVATED!',
  'SUPERHERO STATUS!',
];

// Random questions to ask
const QUESTIONS = [
  'What did you CRUSH today?',
  'Who were you a hero to?',
  'What epic win happened today?',
  'What made you a legend today?',
  'What would make your mom proud?',
];

export default function HypeForm({ onSubmit }: HypeFormProps) {
  const [content, setContent] = useState('');
  const [hypeLevel, setHypeLevel] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPraise, setShowPraise] = useState(false);
  const [praiseMessage, setPraiseMessage] = useState('');
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [shake, setShake] = useState(false);
  const [question] = useState(() => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Trigger shake effect
    setShake(true);
    setTimeout(() => setShake(false), 500);

    // Trigger confetti
    setTriggerConfetti(true);

    // Show random praise
    const randomPraise = PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
    setPraiseMessage(randomPraise);
    setShowPraise(true);

    try {
      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit({ content, hypeLevel });
      }

      // Wait for effects to complete
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Reset form
      setContent('');
      setHypeLevel(5);
    } catch (error) {
      console.error('Error submitting hype:', error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
      setShowPraise(false);
      setTriggerConfetti(false);
    }
  };

  return (
    <div className={shake ? 'shake' : ''}>
      <ConfettiEffect trigger={triggerConfetti} />

      <form onSubmit={handleSubmit} className="eva-card space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <div className="text-purple text-xs uppercase tracking-wide">
            Daily Check-in
          </div>
          <h2 className="text-lg font-semibold text-green">
            {question}
          </h2>
        </motion.div>

        {/* Text Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <label className="block text-dim text-xs uppercase tracking-wide mb-2">
            Your Achievement
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="I completed..."
            rows={5}
            className="eva-input"
            disabled={isSubmitting}
            required
          />
        </motion.div>

        {/* Hype Level Slider */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <label className="block text-purple text-xs uppercase tracking-wide mb-3">
            Hype Level
          </label>
          <HypeLevelSlider value={hypeLevel} onChange={setHypeLevel} />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="pt-2"
        >
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="eva-button w-full py-3 text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Submitting...
              </span>
            ) : (
              'Submit Achievement'
            )}
          </button>
        </motion.div>

        {/* Praise Message Overlay */}
        <AnimatePresence>
          {showPraise && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="text-center px-6 space-y-4"
              >
                <div className="text-purple text-xs uppercase tracking-wide">
                  Achievement Logged
                </div>
                <motion.h1
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="text-4xl md:text-5xl font-bold text-green"
                >
                  {praiseMessage}
                </motion.h1>
                <div className="text-dim text-xs">
                  Successfully synced to system
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
