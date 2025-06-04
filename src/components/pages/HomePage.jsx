import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '../organisms/AppHeader';
import WelcomeSection from '../molecules/WelcomeSection';
import ProjectOverview from '../organisms/ProjectOverview';
import KanbanBoard from '../organisms/KanbanBoard';
import ApperIcon from '../ApperIcon';
import { toast } from 'react-hot-toast';
// Time Entry Service
const timeEntryService = {
  getAll: async () => {
    const entries = localStorage.getItem('timeEntries');
    return entries ? JSON.parse(entries) : [];
  },
  
  create: async (entry) => {
    const entries = await timeEntryService.getAll();
    const newEntry = { ...entry, id: Date.now().toString() };
    entries.push(newEntry);
    localStorage.setItem('timeEntries', JSON.stringify(entries));
    return newEntry;
  },
  
  update: async (id, updatedEntry) => {
    const entries = await timeEntryService.getAll();
    const index = entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      entries[index] = { ...updatedEntry, id };
      localStorage.setItem('timeEntries', JSON.stringify(entries));
      return entries[index];
    }
    throw new Error('Entry not found');
  }
};
const HomePage = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    loadTimeEntries();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      const entries = await timeEntryService.getAll();
      setTimeEntries(entries);
      
      // Check if there's an active timer
      const active = entries.find(entry => !entry.endTime);
      if (active) {
        setActiveTimer(active);
        const now = new Date();
        const start = new Date(active.startTime);
        setTimerSeconds(Math.floor((now - start) / 1000));
      }
    } catch (error) {
      toast.error('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async (projectId = 'project1', taskId = 'task1') => {
    try {
      if (activeTimer) {
        toast.warning('Please stop the current timer first');
        return;
      }

      const newEntry = {
        projectId,
        taskId,
        description: 'Working on task',
        startTime: new Date().toISOString(),
        endTime: null
      };

      const created = await timeEntryService.create(newEntry);
      setActiveTimer(created);
      setTimerSeconds(0);
      toast.success('Timer started');
    } catch (error) {
      toast.error('Failed to start timer');
    }
  };

  const stopTimer = async () => {
    try {
      if (!activeTimer) return;

      const updatedEntry = {
        ...activeTimer,
        endTime: new Date().toISOString(),
        duration: timerSeconds
      };

      await timeEntryService.update(activeTimer.id, updatedEntry);
      setActiveTimer(null);
      setTimerSeconds(0);
      loadTimeEntries();
      toast.success('Timer stopped');
    } catch (error) {
      toast.error('Failed to stop timer');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTodayTotal = () => {
    const today = new Date().toDateString();
    return timeEntries
      .filter(entry => entry.endTime && new Date(entry.startTime).toDateString() === today)
      .reduce((total, entry) => total + (entry.duration || 0), 0);
  };

  const getWeekTotal = () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    return timeEntries
      .filter(entry => entry.endTime && new Date(entry.startTime) >= weekStart)
      .reduce((total, entry) => total + (entry.duration || 0), 0);
  };

  const recentEntries = timeEntries
    .filter(entry => entry.endTime)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 5);

return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection />
        <ProjectOverview />
        <KanbanBoard />
        
        {/* Time Tracking Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-surface-900">Time Tracking</h2>
          </div>
          
          <TimeTrackingContent />
        </div>
      </div>
    </div>
  );
};

// Time Tracking Content Component
const TimeTrackingContent = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('timer');
  const [activeTimers, setActiveTimers] = useState(new Map());
  const [manualEntry, setManualEntry] = useState({
    taskId: '',
    projectId: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: ''
  });
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
    try {
      // Mock data for demonstration
      setTasks([
        { id: 'task1', title: 'Frontend Development', projectId: 'project1', description: 'Working on React components' },
        { id: 'task2', title: 'Backend API', projectId: 'project1', description: 'Developing REST endpoints' },
        { id: 'task3', title: 'Database Design', projectId: 'project2', description: 'Designing database schema' }
      ]);
      setProjects([
        { id: 'project1', name: 'Project Alpha' },
        { id: 'project2', name: 'Project Beta' }
      ]);
      setUsers([
        { id: 'user1', name: 'John Doe' }
      ]);
    } catch (err) {
      toast.error('Failed to load time tracking data');
    }
  };

  const handleStartTimer = async (taskId) => {
    try {
      const currentUser = users[0]?.id || 'user_default';
      const task = tasks.find(t => t.id === taskId);
      const timer = {
        id: Date.now().toString(),
        taskId,
        userId: currentUser,
        projectId: task?.projectId || 'default',
        startTime: new Date().toISOString(),
        description: task?.description || 'Working on task'
      };
      
      setActiveTimers(prev => new Map(prev.set(`${taskId}_${currentUser}`, timer)));
      toast.success('Timer started!');
    } catch (err) {
      toast.error('Failed to start timer');
    }
  };

  const handleStopTimer = async (taskId) => {
    try {
      const currentUser = users[0]?.id || 'user_default';
      const timer = activeTimers.get(`${taskId}_${currentUser}`);
      if (!timer) return;
      
      const endTime = new Date();
      const startTime = new Date(timer.startTime);
      const duration = Math.floor((endTime - startTime) / 1000);
      
      setActiveTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(`${taskId}_${currentUser}`);
        return newMap;
      });
      
      toast.success(`Time logged: ${Math.round(duration / 60)} minutes`);
    } catch (err) {
      toast.error('Failed to stop timer');
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

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getTaskName = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'Unknown Task';
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const tabs = [
    { id: 'timer', label: 'Active Timers', icon: 'Clock' },
    { id: 'manual', label: 'Log Time', icon: 'Plus' },
    { id: 'entries', label: 'Time Entries', icon: 'List' },
    { id: 'reports', label: 'Reports', icon: 'BarChart3' }
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              selectedTab === tab.id
                ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg'
                : 'bg-white text-surface-700 border border-surface-200 hover:bg-surface-50'
            }`}
          >
            <ApperIcon name={tab.icon} className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
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
                className="glass rounded-2xl p-6 shadow-glass"
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
                    <ApperIcon name="Clock" className="w-4 h-4 text-surface-500" />
                    <span className="text-sm text-surface-600">0h 0m</span>
                  </div>
                  
                  {activeTimer ? (
                    <button
                      onClick={() => handleStopTimer(task.id)}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                    >
                      <ApperIcon name="Square" className="w-3 h-3" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartTimer(task.id)}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-secondary to-secondary-light text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                    >
                      <ApperIcon name="Play" className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Manual Entry Tab */}
      {selectedTab === 'manual' && (
        <div className="glass rounded-2xl p-6 shadow-glass max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-surface-900 mb-6">Log Time Entry</h2>
          
          <form onSubmit={handleManualEntrySubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Project *
                </label>
                <select
                  value={manualEntry.projectId}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, projectId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Task *
                </label>
                <select
                  value={manualEntry.taskId}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, taskId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Task</option>
                  {tasks.filter(task => !manualEntry.projectId || task.projectId === manualEntry.projectId)
                    .map(task => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={manualEntry.description}
                onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What did you work on?"
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={manualEntry.startTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={manualEntry.endTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={manualEntry.duration}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 60"
                  min="1"
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              <span>Log Time Entry</span>
            </button>
          </form>
        </div>
      )}

      {/* Time Entries Tab */}
      {selectedTab === 'entries' && (
        <div className="text-center py-12">
          <ApperIcon name="Clock" className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          <p className="text-surface-600">No time entries found</p>
          <p className="text-sm text-surface-500">Start tracking time to see entries here</p>
        </div>
      )}

      {/* Reports Tab */}
      {selectedTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 shadow-glass">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Time by Project</h3>
            <div className="space-y-3">
              {projects.map(project => (
                <div key={project.id} className="flex items-center justify-between">
                  <span className="text-surface-700">{project.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-surface-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-surface-900 w-16 text-right">0h 0m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6 shadow-glass">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Time by User</h3>
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <span className="text-surface-700">{user.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-surface-200 rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-surface-900 w-16 text-right">0h 0m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;