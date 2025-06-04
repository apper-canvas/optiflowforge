import React from 'react';

const ProgressBar = ({ progress, colorClass = 'bg-primary' }) => {
  return (
    <div className="w-full bg-surface-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;