import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import TaskCard from '../molecules/TaskCard';
import TaskCreationModal from './TaskCreationModal';
import TaskDetailModal from './TaskDetailModal';
import { taskService, userService, timeEntryService } from '../../services';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const [draggedTask, setDraggedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTimers, setActiveTimers] = useState(new Map());
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    status: 'todo'
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-surface-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'review', title: 'Review', color: 'bg-amber-50' },
    { id: 'done', title: 'Done', color: 'bg-green-50' }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [tasksResult, usersResult] = await Promise.all([
          taskService.getAll(),
          userService.getAll()
        ]);
        setTasks(tasksResult || []);
        setUsers(usersResult || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status) || [];
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-surface-300';
    }
  };

  const getAssigneeAvatar = (assigneeId) => {
    const user = users.find(u => u.id === assigneeId);
    return user?.name?.charAt(0).toUpperCase() || '?';
  };

  const getAssigneeName = (assigneeId) => {
    const user = users.find(u => u.id === assigneeId);
    return user?.name || 'Unassigned';
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === newStatus) return;

    try {
      const updatedTask = { ...draggedTask, status: newStatus };
      await taskService.update(draggedTask.id, updatedTask);

      setTasks(prev => prev.map(task =>
        task.id === draggedTask.id ? updatedTask : task
      ));

      toast.success(`Task moved to ${columns.find(col => col.id === newStatus)?.title}`);
    } catch (err) {
      toast.error('Failed to update task');
    } finally {
      setDraggedTask(null);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const createdTask = await taskService.create({
        ...newTask,
        projectId: 'default',
        labels: []
      });

      setTasks(prev => [...prev, createdTask]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        status: 'todo'
      });
      setShowTaskModal(false);

      toast.success('Task created successfully!');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setSelectedTask(null);
      toast.success('Task deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  const handleStartTimer = async (taskId) => {
    try {
      const currentUser = users[0]?.id || 'user_default'; // Default to first user for demo
      const task = tasks.find(t => t.id === taskId);
      const timer = await timeEntryService.startTimer(taskId, currentUser, task?.projectId || 'default');
      
      setActiveTimers(prev => new Map(prev.set(`${taskId}_${currentUser}`, timer)));
      toast.success('Timer started!');
    } catch (err) {
      toast.error(err.message || 'Failed to start timer');
    }
  };

  const handleStopTimer = async (taskId) => {
    try {
      const currentUser = users[0]?.id || 'user_default';
      const timeEntry = await timeEntryService.stopTimer(taskId, currentUser, '');
      
      setActiveTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(`${taskId}_${currentUser}`);
        return newMap;
      });
      
      toast.success(`Time logged: ${Math.round(timeEntry.duration / 60)} minutes`);
    } catch (err) {
      toast.error(err.message || 'Failed to stop timer');
    }
  };

  const getActiveTimer = (taskId) => {
    const currentUser = users[0]?.id || 'user_default';
    return activeTimers.get(`${taskId}_${currentUser}`);
  };

  if (loading) {
    return (
      <div className="glass rounded-3xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-300 rounded mb-6 w-48"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-surface-200 rounded"></div>
                <div className="h-32 bg-surface-100 rounded-xl"></div>
                <div className="h-32 bg-surface-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <Icon name="AlertTriangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-8 shadow-glass">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-2">Task Board</h3>
          <p className="text-surface-600">Drag and drop tasks to update their status</p>
        </div>
        <Button
          onClick={() => setShowTaskModal(true)}
          icon="Plus"
          className="mt-4 sm:mt-0"
        >
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {columns.map(column => (
          <div
            key={column.id}
            className={`${column.color} rounded-2xl p-4 sm:p-6 min-h-96`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h4 className="font-semibold text-surface-900">{column.title}</h4>
              <span className="bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-surface-700">
                {getTasksByStatus(column.id).length}
              </span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <AnimatePresence>
                {getTasksByStatus(column.id).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    getPriorityColor={getPriorityColor}
                    getAssigneeAvatar={getAssigneeAvatar}
                    getAssigneeName={getAssigneeName}
                    formatDate={formatDate}
                    isOverdue={isOverdue}
                    handleDragStart={handleDragStart}
                    onClick={setSelectedTask}
                  />
                ))}
              </AnimatePresence>

              <Button
                variant="dashed"
                onClick={() => {
                  setNewTask(prev => ({ ...prev, status: column.id }));
                  setShowTaskModal(true);
                }}
                icon="Plus"
                className="w-full"
              >
                Add task
              </Button>
            </div>
          </div>
        ))}
      </div>

      <TaskCreationModal
        showModal={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        newTask={newTask}
        setNewTask={setNewTask}
        handleCreateTask={handleCreateTask}
        users={users}
      />

      <TaskDetailModal
        selectedTask={selectedTask}
        onClose={() => setSelectedTask(null)}
        getAssigneeAvatar={getAssigneeAvatar}
        getAssigneeName={getAssigneeName}
getPriorityColor={getPriorityColor}
        isOverdue={isOverdue}
        handleDeleteTask={handleDeleteTask}
        timeEntryService={timeEntryService}
      />
    </div>
  );
};

export default KanbanBoard;