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
            <div className="flex space-x-3">
              <button
                onClick={() => startTimer()}
                disabled={activeTimer}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <ApperIcon name="Play" className="w-4 h-4" />
                <span>Start Timer</span>
              </button>
              <button
                onClick={() => toast.info('Manual entry form would open here')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                <span>Add Entry</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Timer */}
            <div className="glass rounded-2xl p-6 shadow-glass">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-surface-900">Active Timer</h3>
                {activeTimer && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Running</span>
                  </div>
                )}
              </div>
              
              {activeTimer ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-surface-900 mb-2">
                      {formatTime(timerSeconds)}
                    </div>
                    <p className="text-surface-600">Project Alpha • Task Development</p>
                  </div>
                  <button
                    onClick={stopTimer}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <ApperIcon name="Square" className="w-4 h-4" />
                    <span>Stop Timer</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ApperIcon name="Clock" className="w-12 h-12 text-surface-400 mx-auto mb-3" />
                  <p className="text-surface-600">No active timer</p>
                  <p className="text-sm text-surface-500">Start a timer to track your work</p>
                </div>
              )}
            </div>

            {/* Time Analytics */}
            <div className="glass rounded-2xl p-6 shadow-glass">
              <h3 className="text-lg font-semibold text-surface-900 mb-4">Today's Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-surface-600">Today</span>
                    <span className="font-medium text-surface-900">{formatDuration(getTodayTotal())}</span>
                  </div>
                  <div className="w-full bg-surface-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((getTodayTotal() / (8 * 3600)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-surface-500">Goal: 8 hours</span>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-surface-600">This Week</span>
                    <span className="font-medium text-surface-900">{formatDuration(getWeekTotal())}</span>
                  </div>
                  <div className="w-full bg-surface-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((getWeekTotal() / (40 * 3600)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-surface-500">Goal: 40 hours</span>
                </div>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="glass rounded-2xl p-6 shadow-glass">
              <h3 className="text-lg font-semibold text-surface-900 mb-4">Recent Entries</h3>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-surface-200 rounded mb-2"></div>
                      <div className="h-3 bg-surface-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : recentEntries.length > 0 ? (
                <div className="space-y-3">
                  {recentEntries.map((entry, index) => (
                    <div key={entry.id || index} className="border-b border-surface-200 last:border-b-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-surface-900 text-sm">Project Alpha</p>
                          <p className="text-surface-600 text-xs">{entry.description || 'Working on task'}</p>
                          <p className="text-surface-500 text-xs">
                            {new Date(entry.startTime).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-surface-700">
                          {formatDuration(entry.duration || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ApperIcon name="Clock" className="w-12 h-12 text-surface-400 mx-auto mb-3" />
                  <p className="text-surface-600">No time entries yet</p>
                  <p className="text-sm text-surface-500">Start tracking your time to see entries here</p>
                </div>
              )}
            </div>
          </div>
        </div>
</div>
    </div>
  );
};

export default HomePage;