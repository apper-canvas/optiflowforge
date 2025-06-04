import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import { projectService } from '../services'

const Home = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      try {
        const result = await projectService.getAll()
        setProjects(result || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-secondary text-white'
      case 'completed': return 'bg-primary text-white'
      case 'on-hold': return 'bg-accent text-white'
      default: return 'bg-surface-300 text-surface-700'
    }
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-secondary'
    if (progress >= 50) return 'bg-primary'
    if (progress >= 25) return 'bg-accent'
    return 'bg-surface-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.header 
        className="glass sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-4 border-b border-white/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-soft">
              <ApperIcon name="Layers" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-900">FlowForge</h1>
              <p className="text-sm text-surface-600 hidden sm:block">Modern Project Management</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 hover:bg-white/50 rounded-lg transition-all duration-200">
              <ApperIcon name="Search" className="w-5 h-5 text-surface-600" />
            </button>
            <button className="p-2 hover:bg-white/50 rounded-lg transition-all duration-200">
              <ApperIcon name="Bell" className="w-5 h-5 text-surface-600" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="w-4 h-4 text-white" />
            </div>
          </nav>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 mb-3">
            Welcome back! 👋
          </h2>
          <p className="text-surface-600 text-base sm:text-lg max-w-2xl">
            Manage your projects with ease. Track progress, collaborate with your team, and deliver exceptional results.
          </p>
        </motion.div>

        {/* Projects Overview */}
        <motion.div 
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-surface-900 mb-4 sm:mb-0">
              Recent Projects
            </h3>
            <button className="self-start sm:self-auto bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2">
              <ApperIcon name="Plus" className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-surface-300 rounded mb-4"></div>
                  <div className="h-3 bg-surface-200 rounded mb-6"></div>
                  <div className="h-2 bg-surface-200 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-surface-300 rounded-full"></div>
                    <div className="w-8 h-8 bg-surface-300 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="glass rounded-2xl p-8 text-center">
              <ApperIcon name="AlertTriangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {projects?.slice(0, 6).map((project, index) => (
                <motion.div
                  key={project.id}
                  className="glass rounded-2xl p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold text-surface-900 group-hover:text-primary transition-colors">
                      {project.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <p className="text-surface-600 text-sm mb-6 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-surface-600">Progress</span>
                      <span className="font-medium text-surface-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-surface-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(project.progress)}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.teamMembers?.slice(0, 3).map((member, idx) => (
                        <div key={idx} className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {member.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ))}
                      {project.teamMembers?.length > 3 && (
                        <div className="w-8 h-8 bg-surface-300 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-xs font-medium text-surface-600">
                            +{project.teamMembers.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-surface-500">
                      <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                      {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Main Feature - Kanban Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <MainFeature />
        </motion.div>
      </div>
    </div>
  )
}

export default Home