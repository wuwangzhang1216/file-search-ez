/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion } from 'framer-motion';
import Particles from './magicui/particles';
import Ripple from './magicui/ripple';

interface ProgressBarProps {
  progress: number;
  total: number;
  message: string;
  fileName?: string;
  icon?: React.ReactNode;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, total, message, fileName, icon }) => {
  const percentage = total > 0 ? (progress / total) * 100 : 0;

  return (
    <div className="relative flex flex-col items-center justify-center h-full p-4 text-center overflow-hidden">
        <Particles
            className="absolute inset-0"
            quantity={50}
            ease={60}
            color="#2563eb"
            refresh={false}
        />
        <Ripple mainCircleSize={200} numCircles={5} />

        {icon && (
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="mb-8"
            >
                {icon}
            </motion.div>
        )}

        <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative text-2xl font-bold mb-2 bg-gradient-to-r from-gem-blue to-gem-teal bg-clip-text text-transparent z-10"
        >
            {message}
        </motion.h2>

        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative text-gem-offwhite/70 mb-4 h-6 truncate max-w-full px-4 z-10"
            title={fileName}
        >
            {fileName || ''}
        </motion.p>

        <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative w-full max-w-md bg-gem-mist rounded-full h-4 overflow-hidden shadow-lg z-10"
        >
            <motion.div
                className="bg-gradient-to-r from-gem-blue via-blue-500 to-gem-teal h-4 rounded-full transition-all duration-300 ease-in-out animate-progress-stripes shadow-inner"
                style={{
                    width: `${percentage}%`,
                    backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)',
                    backgroundSize: '1rem 1rem'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5 }}
            />
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
        </motion.div>

        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mt-4 text-lg font-semibold text-gem-offwhite z-10"
        >
            {`${progress} / ${total}`}
        </motion.p>
    </div>
  );
};

export default ProgressBar;