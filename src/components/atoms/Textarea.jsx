import React from 'react';

const Textarea = ({ value, onChange, placeholder, className = '' }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all h-20 resize-none ${className}`}
      placeholder={placeholder}
    />
  );
};

export default Textarea;