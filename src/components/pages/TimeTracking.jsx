import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AppHeader from '../organisms/AppHeader';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Select from '../atoms/Select';
import Card from '../atoms/Card';
import Icon from '../atoms/Icon';
import { timeEntryService, taskService, projectService, userService } from '../../services';

const TimeTracking = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTimers, setActiveTimers] = useState(new Map());
  const [selectedTab, setSelectedTab] = useState('timer');
  
  // Manual entry form state
  const [manualEntry, setManualEntry] = useState({
    taskId: '',
    projectId: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: ''
  });

  // Filter state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    projectId: '',
    taskId: '',
    userId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [timeEntriesResult, tasksResult, projectsResult, usersResult] = await Promise.all([
        timeEntryService.getAll(),
        taskService.getAll(),
        projectService.getAll(),
        userService.getAll()
      ]);
      
      setTimeEntries(timeEntriesResult || []);
      setTasks(tasksResult || []);
      setProjects(projectsResult || []);
      setUsers(usersResult || []);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load time tracking data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = async (taskId) => {
    try {
      const currentUser = users[0]?.id || 'user_default';
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
      
      setTimeEntries(prev => [...prev, timeEntry]);
      toast.success(`Time logged: ${Math.round(timeEntry.duration / 60)} minutes`);
    } catch (err) {
      toast.error(err.message || 'Failed to stop timer');
    }
  };

  const handleManualEntrySubmit = async (e) => {
    e.preventDefault();
    if (!manualEntry.taskId || !manualEntry.projectId || (!manualEntry.duration && (!manualEntry.startTime || !manualEntry.endTime))) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let duration = parseInt(manualEntry.duration) * 60; // Convert minutes to seconds
      
      if (!duration && manualEntry.startTime && manualEntry.endTime) {
        const start = new Date(`2024-01-01T${manualEntry.startTime}`);
        const end = new Date(`2024-01-01T${manualEntry.endTime}`);
        duration = (end - start) / 1000;
      }

      const entry = await timeEntryService.create({
        taskId: manualEntry.taskId,
        projectId: manualEntry.projectId,
        userId: users[0]?.id || 'user_default',
        description: manualEntry.description,
        startTime: manualEntry.startTime ? `2024-01-01T${manualEntry.startTime}:00.000Z` : new Date().toISOString(),
        endTime: manualEntry.endTime ? `2024-01-01T${manualEntry.endTime}:00.000Z` : new Date().toISOString(),
        duration
      });

      setTimeEntries(prev => [...prev, entry]);
      setManualEntry({
        taskId: '',
        projectId: '',
        description: '',
        startTime: '',
        endTime: '',
        duration: ''
      });
      
      toast.success('Time entry logged successfully!');
    } catch (err) {
      toast.error('Failed to log time entry');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await timeEntryService.delete(entryId);
      setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Time entry deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete time entry');
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTaskName = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'Unknown Task';
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const filteredTimeEntries = timeEntries.filter(entry => {
    if (filters.projectId && entry.projectId !== filters.projectId) return false;
    if (filters.taskId && entry.taskId !== filters.taskId) return false;
    if (filters.userId && entry.userId !== filters.userId) return false;
    // Add date filtering logic here if needed
    return true;
  });

  const getTotalTime = () => {
    return filteredTimeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  };

  const tabs = [
    { id: 'timer', label: 'Active Timers', icon: 'Clock' },
    { id: 'manual', label: 'Log Time', icon: 'Plus' },
    { id: 'entries', label: 'Time Entries', icon: 'List' },
    { id: 'reports', label: 'Reports', icon: 'BarChart3' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-300 rounded mb-6 w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-surface-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Time Tracking</h1>
          <p className="text-surface-600">Manage your time entries and track productivity</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? 'primary' : 'outline'}
              onClick={() => setSelectedTab(tab.id)}
              icon={tab.icon}
              className="px-4 py-2"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Active Timers Tab */}
        {selectedTab === 'timer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => {
              const currentUser = users[0]?.id || 'user_default';
              const activeTimer = activeTimers.get(`${task.id}_${currentUser}`);
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-card border border-surface-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-surface-900 mb-1">{task.title}</h3>
                      <p className="text-sm text-surface-600">{getProjectName(task.projectId)}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${activeTimer ? 'bg-green-500' : 'bg-surface-300'}`}></div>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-surface-600 mb-4 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon name="Clock" className="w-4 h-4 text-surface-500" />
                      <span className="text-sm text-surface-600">
                        {task.totalTime ? formatDuration(task.totalTime) : '0h 0m'}
                      </span>
                    </div>
                    
                    {activeTimer ? (
                      <Button
                        variant="danger"
                        onClick={() => handleStopTimer(task.id)}
                        icon="Square"
                        className="px-3 py-1 text-sm"
                      >
                        Stop
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => handleStartTimer(task.id)}
                        icon="Play"
                        className="px-3 py-1 text-sm"
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Manual Entry Tab */}
        {selectedTab === 'manual' && (
          <Card className="max-w-2xl mx-auto p-6">
            <h2 className="text-xl font-semibold text-surface-900 mb-6">Log Time Entry</h2>
            
            <form onSubmit={handleManualEntrySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Project *
                  </label>
                  <Select
                    value={manualEntry.projectId}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, projectId: e.target.value }))}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Task *
                  </label>
                  <Select
                    value={manualEntry.taskId}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, taskId: e.target.value }))}
                    required
                  >
                    <option value="">Select Task</option>
                    {tasks.filter(task => !manualEntry.projectId || task.projectId === manualEntry.projectId)
                      .map(task => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                      ))}
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Description
                </label>
                <Input
                  type="text"
                  value={manualEntry.description}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What did you work on?"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Start Time
                  </label>
                  <Input
                    type="time"
                    value={manualEntry.startTime}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    End Time
                  </label>
                  <Input
                    type="time"
                    value={manualEntry.endTime}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={manualEntry.duration}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 60"
                    min="1"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" icon="Plus">
                Log Time Entry
              </Button>
            </form>
          </Card>
        )}

        {/* Time Entries Tab */}
        {selectedTab === 'entries' && (
          <div>
            {/* Filters */}
            <Card className="p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={filters.projectId}
                  onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value }))}
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </Select>
                
                <Select
                  value={filters.taskId}
                  onChange={(e) => setFilters(prev => ({ ...prev, taskId: e.target.value }))}
                >
                  <option value="">All Tasks</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </Select>
                
                <Select
                  value={filters.userId}
                  onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                >
                  <option value="">All Users</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </Select>
                
                <div className="text-right">
                  <span className="text-sm text-surface-600">Total: </span>
                  <span className="font-semibold text-surface-900">
                    {formatDuration(getTotalTime())}
                  </span>
                </div>
              </div>
            </Card>

            {/* Time Entries List */}
            <div className="space-y-4">
              {filteredTimeEntries.map(entry => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl p-6 shadow-card border border-surface-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold text-surface-900">{getTaskName(entry.taskId)}</h3>
                        <span className="text-sm text-surface-500">•</span>
                        <span className="text-sm text-surface-600">{getProjectName(entry.projectId)}</span>
                      </div>
                      
                      {entry.description && (
                        <p className="text-surface-600 mb-2">{entry.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm text-surface-500">
                        <div className="flex items-center space-x-1">
                          <Icon name="User" className="w-4 h-4" />
                          <span>{getUserName(entry.userId)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="Calendar" className="w-4 h-4" />
                          <span>{formatDate(entry.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="Clock" className="w-4 h-4" />
                          <span>{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-surface-900">
                        {formatDuration(entry.duration || 0)}
                      </span>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteEntry(entry.id)}
                        icon="Trash2"
                        className="text-red-600 hover:bg-red-50"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredTimeEntries.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="Clock" className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                  <p className="text-surface-600">No time entries found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {selectedTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-surface-900 mb-4">Time by Project</h3>
              <div className="space-y-3">
                {projects.map(project => {
                  const projectTime = timeEntries
                    .filter(entry => entry.projectId === project.id)
                    .reduce((total, entry) => total + (entry.duration || 0), 0);
                  
                  const percentage = getTotalTime() > 0 ? (projectTime / getTotalTime()) * 100 : 0;
                  
                  return (
                    <div key={project.id} className="flex items-center justify-between">
                      <span className="text-surface-700">{project.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-surface-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-surface-900 w-16 text-right">
                          {formatDuration(projectTime)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-surface-900 mb-4">Time by User</h3>
              <div className="space-y-3">
                {users.map(user => {
                  const userTime = timeEntries
                    .filter(entry => entry.userId === user.id)
                    .reduce((total, entry) => total + (entry.duration || 0), 0);
                  
                  const percentage = getTotalTime() > 0 ? (userTime / getTotalTime()) * 100 : 0;
                  
                  return (
                    <div key={user.id} className="flex items-center justify-between">
                      <span className="text-surface-700">{user.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-surface-200 rounded-full h-2">
                          <div
                            className="bg-secondary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-surface-900 w-16 text-right">
                          {formatDuration(userTime)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracking;