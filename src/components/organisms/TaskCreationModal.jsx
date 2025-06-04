import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import FormField from '../molecules/FormField';

const TaskCreationModal = ({ showModal, onClose, newTask, setNewTask, handleCreateTask, users }) => {
  const userOptions = [{ value: '', label: 'Select assignee' }, ...users.map(user => ({ value: user.id, label: user.name }))];

  return (
    <AnimatePresence>
      {showModal && (
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
            className="glass rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-glass"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-surface-900">Create New Task</h3>
              <Button variant="ghost" onClick={onClose} className="p-2">
                <Icon name="X" className="w-5 h-5 text-surface-500" />
              </Button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 sm:space-y-6">
              <FormField
                label="Title"
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
              />

              <FormField
                label="Description"
                type="textarea"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Priority"
                  type="select"
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' }
                  ]}
                />

                <FormField
                  label="Assignee"
                  type="select"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                  options={userOptions}
                />
              </div>

              <FormField
                label="Due Date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 px-6 py-3"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 px-6 py-3"
                >
                  Create Task
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskCreationModal;