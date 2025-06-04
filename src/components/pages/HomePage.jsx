import React from 'react';
import { motion } from 'framer-motion';
import AppHeader from '../organisms/AppHeader';
import WelcomeSection from '../molecules/WelcomeSection';
import ProjectOverview from '../organisms/ProjectOverview';
import KanbanBoard from '../organisms/KanbanBoard';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <WelcomeSection />
        <ProjectOverview />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <KanbanBoard />
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;