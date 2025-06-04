import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import ProjectCard from '../molecules/ProjectCard';
import { projectService } from '../../services';

const ProjectOverview = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const result = await projectService.getAll();
        setProjects(result || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-secondary text-white';
      case 'completed': return 'bg-primary text-white';
      case 'on-hold': return 'bg-accent text-white';
      default: return 'bg-surface-300 text-surface-700';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-secondary';
    if (progress >= 50) return 'bg-primary';
    if (progress >= 25) return 'bg-accent';
    return 'bg-surface-300';
  };

  return (
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
        <Button icon="Plus" className="self-start sm:self-auto">
          New Project
        </Button>
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
          <Icon name="AlertTriangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects?.slice(0, 6).map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              getStatusColor={getStatusColor}
              getProgressColor={getProgressColor}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ProjectOverview;