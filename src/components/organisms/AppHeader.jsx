import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../atoms/Icon';
import Avatar from '../atoms/Avatar';
import HeaderNavButton from '../molecules/HeaderNavButton';

const AppHeader = () => {
  return (
    <motion.header
      className="glass sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-4 border-b border-white/20"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar icon="Layers" className="w-10 h-10 shadow-soft" />
          <div>
            <h1 className="text-xl font-bold text-surface-900">FlowForge</h1>
            <p className="text-sm text-surface-600 hidden sm:block">Modern Project Management</p>
          </div>
        </div>

        <nav className="flex items-center space-x-2 sm:space-x-4">
          <HeaderNavButton iconName="Search" onClick={() => console.log('Search clicked')} />
          <HeaderNavButton iconName="Bell" onClick={() => console.log('Notifications clicked')} />
          <Avatar icon="User" />
        </nav>
      </div>
    </motion.header>
  );
};

export default AppHeader;