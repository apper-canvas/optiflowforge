class TimeEntryService {
  constructor() {
    this.activeTimers = new Map(); // Store active timers in memory
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const tableFields = [
        'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
        'ModifiedOn', 'ModifiedBy', 'project_id', 'user_id', 
        'description', 'start_time', 'end_time', 'duration', 'task_id'
      ];
      
      const params = {
        fields: tableFields,
        orderBy: [
          {
            fieldName: 'start_time',
            SortType: 'DESC'
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('time_entry', params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const tableFields = [
        'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
        'ModifiedOn', 'ModifiedBy', 'project_id', 'user_id', 
        'description', 'start_time', 'end_time', 'duration', 'task_id'
      ];
      
      const params = {
        fields: tableFields
      };

      const response = await this.apperClient.getRecordById('time_entry', id, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching time entry with ID ${id}:`, error);
      return null;
    }
  }

  async getByTaskId(taskId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: ['Name', 'task_id', 'project_id', 'user_id', 'description', 
                'start_time', 'end_time', 'duration', 'CreatedOn'],
        where: [
          {
            fieldName: 'task_id',
            operator: 'EqualTo',
            values: [taskId]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('time_entry', params);
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching time entries by task ID:', error);
      return [];
    }
  }

  async getByProjectId(projectId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: ['Name', 'task_id', 'project_id', 'user_id', 'description', 
                'start_time', 'end_time', 'duration', 'CreatedOn'],
        where: [
          {
            fieldName: 'project_id',
            operator: 'EqualTo',
            values: [projectId]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('time_entry', params);
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching time entries by project ID:', error);
      return [];
    }
  }

  async getByUserId(userId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: ['Name', 'task_id', 'project_id', 'user_id', 'description', 
                'start_time', 'end_time', 'duration', 'CreatedOn'],
        where: [
          {
            fieldName: 'user_id',
            operator: 'EqualTo',
            values: [userId]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('time_entry', params);
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching time entries by user ID:', error);
      return [];
    }
  }

  async create(entry) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Filter to only include Updateable fields
      const createData = {
        Name: entry.name || entry.Name || `Time Entry ${new Date().toISOString()}`,
        Tags: entry.tags || entry.Tags || '',
        Owner: entry.owner || entry.Owner,
        project_id: entry.projectId || entry.project_id,
        user_id: entry.userId || entry.user_id,
        description: entry.description || '',
        start_time: entry.startTime || entry.start_time,
        end_time: entry.endTime || entry.end_time,
        duration: entry.duration || 0,
        task_id: entry.taskId || entry.task_id
      };

      const params = {
        records: [createData]
      };

      const response = await this.apperClient.createRecord('time_entry', params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }
      
      throw new Error('Failed to create time entry');
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Filter to only include Updateable fields plus ID
      const updateData = {
        Id: id,
        ...(data.name !== undefined && { Name: data.name }),
        ...(data.Name !== undefined && { Name: data.Name }),
        ...(data.tags !== undefined && { Tags: data.tags }),
        ...(data.Tags !== undefined && { Tags: data.Tags }),
        ...(data.owner !== undefined && { Owner: data.owner }),
        ...(data.Owner !== undefined && { Owner: data.Owner }),
        ...(data.projectId !== undefined && { project_id: data.projectId }),
        ...(data.project_id !== undefined && { project_id: data.project_id }),
        ...(data.userId !== undefined && { user_id: data.userId }),
        ...(data.user_id !== undefined && { user_id: data.user_id }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startTime !== undefined && { start_time: data.startTime }),
        ...(data.start_time !== undefined && { start_time: data.start_time }),
        ...(data.endTime !== undefined && { end_time: data.endTime }),
        ...(data.end_time !== undefined && { end_time: data.end_time }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.taskId !== undefined && { task_id: data.taskId }),
        ...(data.task_id !== undefined && { task_id: data.task_id })
      };

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord('time_entry', params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }
      
      throw new Error('Failed to update time entry');
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord('time_entry', params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  }

  async startTimer(taskId, userId, projectId) {
    const timerId = `${taskId}_${userId}`;
    
    if (this.activeTimers.has(timerId)) {
      throw new Error('Timer already running for this task');
    }

    const timerEntry = {
      taskId,
      userId,
      projectId,
      startTime: new Date().toISOString(),
      isActive: true
    };

    this.activeTimers.set(timerId, timerEntry);
    return timerEntry;
  }

  async stopTimer(taskId, userId, description = '') {
    const timerId = `${taskId}_${userId}`;
    const timer = this.activeTimers.get(timerId);
    
    if (!timer) {
      throw new Error('No active timer found for this task');
    }

    const endTime = new Date();
    const startTime = new Date(timer.startTime);
    const duration = Math.round((endTime - startTime) / 1000); // Duration in seconds

    const timeEntry = await this.create({
      taskId: timer.taskId,
      userId: timer.userId,
      projectId: timer.projectId,
      startTime: timer.startTime,
      endTime: endTime.toISOString(),
      duration,
      description
    });

    this.activeTimers.delete(timerId);
    return timeEntry;
  }

  getActiveTimer(taskId, userId) {
    const timerId = `${taskId}_${userId}`;
    return this.activeTimers.get(timerId) || null;
  }
}

export default new TimeEntryService();