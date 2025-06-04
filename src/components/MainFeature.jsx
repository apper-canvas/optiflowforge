import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import { taskService, userService } from '../services'

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    status: 'todo'
  })

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-surface-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'review', title: 'Review', color: 'bg-amber-50' },
    { id: 'done', title: 'Done', color: 'bg-green-50' }
  ]

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [tasksResult, usersResult] = await Promise.all([
          taskService.getAll(),
          userService.getAll()
        ])
        setTasks(tasksResult || [])
        setUsers(usersResult || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status) || []
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-surface-300'
    }
  }

  const getAssigneeAvatar = (assigneeId) => {
    const user = users.find(u => u.id === assigneeId)
    return user?.name?.charAt(0).toUpperCase() || '?'
  }

  const getAssigneeName = (assigneeId) => {
    const user = users.find(u => u.id === assigneeId)
    return user?.name || 'Unassigned'
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    if (!draggedTask || draggedTask.status === newStatus) return

    try {
      const updatedTask = { ...draggedTask, status: newStatus }
      await taskService.update(draggedTask.id, updatedTask)
      
      setTasks(prev => prev.map(task => 
        task.id === draggedTask.id ? updatedTask : task
      ))
      
      toast.success(`Task moved to ${columns.find(col => col.id === newStatus)?.title}`)
    } catch (err) {
      toast.error('Failed to update task')
    } finally {
      setDraggedTask(null)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    try {
      const createdTask = await taskService.create({
        ...newTask,
        projectId: 'default',
        labels: []
      })
      
      setTasks(prev => [...prev, createdTask])
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        status: 'todo'
      })
      setShowTaskModal(false)
      
      toast.success('Task created successfully!')
    } catch (err) {
      toast.error('Failed to create task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      setSelectedTask(null)
      toast.success('Task deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete task')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && dueDate
  }

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
    )
  }

  if (error) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <ApperIcon name="AlertTriangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-8 shadow-glass">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-2">Task Board</h3>
          <p className="text-surface-600">Drag and drop tasks to update their status</p>
        </div>
        <button
          onClick={() => setShowTaskModal(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Kanban Board */}
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
                  <motion.div
                    key={task.id}
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
                    onClick={() => setSelectedTask(task)}
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
                        <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {getAssigneeAvatar(task.assignee)}
                          </span>
                        </div>
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
                          <ApperIcon name="Calendar" className="w-3 h-3" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={() => {
                  setNewTask(prev => ({ ...prev, status: column.id }))
                  setShowTaskModal(true)
                }}
                className="w-full py-3 border-2 border-dashed border-surface-300 rounded-xl text-surface-500 hover:border-primary hover:text-primary transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                <span className="text-sm">Add task</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowTaskModal(false)}
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
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all h-20 resize-none"
                    placeholder="Enter task description"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Assignee</label>
                    <select
                      value={newTask.assignee}
                      onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value="">Select assignee</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 px-6 py-3 border border-surface-300 text-surface-700 rounded-xl hover:bg-surface-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTask(null)}
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
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
                </button>
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
                    <ApperIcon name="User" className="w-4 h-4 text-surface-500" />
                    <span className="text-sm font-medium text-surface-700">Assignee</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {getAssigneeAvatar(selectedTask.assignee)}
                      </span>
                    </div>
                    <span className="text-sm text-surface-900">{getAssigneeName(selectedTask.assignee)}</span>
                  </div>
                </div>

                {selectedTask.dueDate && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <ApperIcon name="Calendar" className="w-4 h-4 text-surface-500" />
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
                <button
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4" />
                  <span>Delete Task</span>
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 px-6 py-3 border border-surface-300 text-surface-700 rounded-xl hover:bg-surface-50 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature