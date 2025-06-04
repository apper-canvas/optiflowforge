import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Avatar from '../atoms/Avatar';

const TaskDetailModal = ({
  selectedTask,
  onClose,
  getAssigneeAvatar,
  getAssigneeName,
  getPriorityColor,
  isOverdue,
  handleDeleteTask
}) => {
  return (
    <AnimatePresence>
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="glass rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-glass"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-surface-900 mb-2">{selectedTask.title}</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedTask.priority)}`}></div>
                  <span className="text-sm text-surface-600 capitalize">{selectedTask.priority} priority</span>
                </div>
              </div>
              <Button variant="ghost" onClick={onClose} className="p-2">
                <Icon name="X" className="w-5 h-5 text-surface-500" />
              </Button>
            </div>

            {selectedTask.description && (
              <div className="mb-6">
                <h4 className="font-medium text-surface-900 mb-2">Description</h4>
                <p className="text-surface-600 leading-relaxed">{selectedTask.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="User" className="w-4 h-4 text-surface-500" />
                  <span className="text-sm font-medium text-surface-700">Assignee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Avatar char={getAssigneeAvatar(selectedTask.assignee)} />
                  <span className="text-sm text-surface-900">{getAssigneeName(selectedTask.assignee)}</span>
                </div>
              </div>

              {selectedTask.dueDate && (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Calendar" className="w-4 h-4 text-surface-500" />
                    <span className="text-sm font-medium text-surface-700">Due Date</span>
                  </div>
                  <span className={`text-sm ${isOverdue(selectedTask.dueDate) ? 'text-red-600' : 'text-surface-900'}`}>
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                    {isOverdue(selectedTask.dueDate) && ' (Overdue)'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => handleDeleteTask(selectedTask.id)}
                variant="danger"
                icon="Trash2"
                className="flex-1 px-6 py-3"
              >
                Delete Task
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 px-6 py-3"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailModal;