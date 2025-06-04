import React from 'react';
import ApperIcon from '../ApperIcon';

const Button = ({ children, icon, onClick, className = '', type = 'button', variant = 'primary' }) => {
  const baseClasses = "flex items-center justify-center space-x-2 transition-all duration-200";
  let variantClasses = "";

  switch (variant) {
    case 'primary':
      variantClasses = "bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105";
      break;
    case 'secondary':
      variantClasses = "bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600";
      break;
    case 'ghost':
      variantClasses = "p-2 hover:bg-white/50 rounded-lg";
      break;
    case 'dashed':
      variantClasses = "w-full py-3 border-2 border-dashed border-surface-300 rounded-xl text-surface-500 hover:border-primary hover:text-primary";
      break;
    case 'danger':
        variantClasses = "bg-red-500 text-white rounded-xl hover:bg-red-600";
        break;
    case 'outline':
      variantClasses = "border border-surface-300 text-surface-700 rounded-xl hover:bg-surface-50";
      break;
    default:
      variantClasses = "bg-gray-200 text-gray-800 px-4 py-2 rounded-md";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {icon && <ApperIcon name={icon} className="w-5 h-5" />}
      {children}
    </button>
  );
};

export default Button;