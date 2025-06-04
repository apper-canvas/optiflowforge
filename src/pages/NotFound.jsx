import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <motion.div 
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass rounded-3xl p-8 sm:p-12 shadow-glass">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-24 h-24 mx-auto mb-6"
          >
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <ApperIcon name="Search" className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-6xl sm:text-7xl font-bold text-surface-900 mb-4">404</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-surface-700 mb-4">Page Not Found</h2>
          <p className="text-surface-600 mb-8 leading-relaxed">
            Looks like this page got lost in the project pipeline. Let's get you back on track!
          </p>
          
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <ApperIcon name="Home" className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound