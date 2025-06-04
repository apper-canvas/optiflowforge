import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ApperIcon from '../ApperIcon';
import HeaderNavButton from '../molecules/HeaderNavButton';

const AppHeader = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'Home' },
    { path: '/time-tracking', label: 'Time Tracking', icon: 'Clock' }
  ];

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <ApperIcon name="Zap" className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              FlowForge
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <HeaderNavButton
                key={item.path}
                to={item.path}
                icon={item.icon}
                isActive={location.pathname === item.path}
              >
                {item.label}
              </HeaderNavButton>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg hover:bg-white/50 transition-colors">
              <ApperIcon name="Menu" className="w-6 h-6 text-surface-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;