import React from 'react';
import ApperIcon from '../ApperIcon';

const Avatar = ({ char, icon, className = '', colorClass = 'bg-gradient-to-br from-primary to-primary-dark' }) => {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass} ${className}`}>
      {char ? (
        <span className="text-xs font-medium text-white">
          {char.charAt(0).toUpperCase()}
        </span>
      ) : icon ? (
        <ApperIcon name={icon} className="w-4 h-4 text-white" />
      ) : null}
    </div>
  );
};

export default Avatar;