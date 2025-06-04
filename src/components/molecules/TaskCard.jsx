import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../atoms/Icon';
import Avatar from '../atoms/Avatar';

const TaskCard = ({
  task,
  getPriorityColor,
  getAssigneeAvatar,
  getAssigneeName,
  formatDate,
  isOverdue,
  handleDragStart,
  onClick
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -2, shadow: "0 8px 25px rgba(0,0,0,0.15)" }}
      whileDrag={{ rotate: 5, scale: 1.05 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={(e) => handleDragStart(e, task)}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 cursor-grab active:cursor-grabbing border border-white/30 hover:border-primary/30 transition-all duration-200"
      onClick={() => onClick(task)}
    >
      <div className="flex items-start justify-between mb-3">
        <h5 className="font-medium text-surface-900 leading-tight line-clamp-2">
          {task.title}
        </h5>
        <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 ml-2`}></div>
      </div>

      {task.description && (
        <p className="text-sm text-surface-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar char={getAssigneeAvatar(task.assignee)} />
          <span className="text-xs text-surface-600 hidden sm:block">
            {getAssigneeName(task.assignee)}
          </span>
        </div>

        {task.dueDate && (
          <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
            isOverdue(task.dueDate)
              ? 'bg-red-100 text-red-700'
              : 'bg-surface-100 text-surface-600'
          }`}>
            <Icon name="Calendar" className="w-3 h-3" />
<span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>

      {/* Time Tracking Section */}
      <div className="mt-3 pt-3 border-t border-surface-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" className="w-3 h-3 text-surface-500" />
            <span className="text-xs text-surface-600">
              {task.totalTime ? `${Math.round(task.totalTime / 3600)}h ${Math.round((task.totalTime % 3600) / 60)}m` : '0h 0m'}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle timer start - this would be passed from parent
              }}
              className="p-1 hover:bg-surface-100 rounded transition-colors"
              title="Start Timer"
            >
              <Icon name="Play" className="w-3 h-3 text-green-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle timer stop - this would be passed from parent
              }}
              className="p-1 hover:bg-surface-100 rounded transition-colors"
              title="Stop Timer"
            >
              <Icon name="Pause" className="w-3 h-3 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;