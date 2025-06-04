import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import ProgressBar from '../atoms/ProgressBar';

const ProjectCard = ({ project, index, getStatusColor, getProgressColor }) => {
  return (
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
        <Badge className={getStatusColor(project.status)}>
          {project.status}
        </Badge>
      </div>

      <p className="text-sm text-surface-600 mb-6 line-clamp-2">
        {project.description}
      </p>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-surface-600">Progress</span>
          <span className="font-medium text-surface-900">{project.progress}%</span>
        </div>
        <ProgressBar progress={project.progress} colorClass={getProgressColor(project.progress)} />
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
          <Icon name="Calendar" className="w-4 h-4 mr-1" />
          {new Date(project.endDate).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;