import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder, className = '', required = false }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${className}`}
      placeholder={placeholder}
      required={required}
    />
  );
};

export default Input;