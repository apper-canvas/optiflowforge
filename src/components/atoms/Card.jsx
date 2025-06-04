import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', motionProps = {}, onClick }) => {
  return (
    <motion.div
      className={`glass rounded-2xl p-6 ${className}`}
      {...motionProps}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;