import React from 'react';
import { motion } from 'framer-motion';

const WelcomeSection = () => {
  return (
    <motion.div
      className="mb-8 sm:mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 mb-3">
        Welcome back! 👋
      </h2>
      <p className="text-surface-600 text-base sm:text-lg max-w-2xl">
        Manage your projects with ease. Track progress, collaborate with your team, and deliver exceptional results.
      </p>
    </motion.div>
  );
};

export default WelcomeSection;