class TaskService {
  constructor() {
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
        'ModifiedOn', 'ModifiedBy', 'title', 'description', 
        'priority', 'due_date', 'status', 'labels', 'assignee', 'project_id'
      ];
      
      const params = {
        fields: tableFields,
        orderBy: [
          {
            fieldName: 'CreatedOn',
            SortType: 'DESC'
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('task', params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const tableFields = [
        'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
        'ModifiedOn', 'ModifiedBy', 'title', 'description', 
        'priority', 'due_date', 'status', 'labels', 'assignee', 'project_id'
      ];
      
      const params = {
        fields: tableFields
      };

      const response = await this.apperClient.getRecordById('task', id, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      return null;
    }
  }

  async create(task) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Filter to only include Updateable fields
      const createData = {
        Name: task.name || task.Name || task.title,
        Tags: task.tags || task.Tags || '',
        Owner: task.owner || task.Owner,
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        due_date: task.dueDate || task.due_date || null,
        status: task.status || 'todo',
        labels: task.labels || '',
        assignee: task.assignee || null,
        project_id: task.projectId || task.project_id || null
      };

      const params = {
        records: [createData]
      };

      const response = await this.apperClient.createRecord('task', params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }
      
      throw new Error('Failed to create task');
    } catch (error) {
      console.error('Error creating task:', error);
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
        ...(data.title !== undefined && { title: data.title }),
        ...(data.tags !== undefined && { Tags: data.tags }),
        ...(data.Tags !== undefined && { Tags: data.Tags }),
        ...(data.owner !== undefined && { Owner: data.owner }),
        ...(data.Owner !== undefined && { Owner: data.Owner }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.dueDate !== undefined && { due_date: data.dueDate }),
        ...(data.due_date !== undefined && { due_date: data.due_date }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.labels !== undefined && { labels: data.labels }),
        ...(data.assignee !== undefined && { assignee: data.assignee }),
        ...(data.projectId !== undefined && { project_id: data.projectId }),
        ...(data.project_id !== undefined && { project_id: data.project_id })
      };

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord('task', params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }
      
      throw new Error('Failed to update task');
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord('task', params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async getTimeEntries(taskId) {
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
      console.error('Error fetching time entries for task:', error);
      return [];
    }
  }

  async getTotalTime(taskId) {
    const timeEntries = await this.getTimeEntries(taskId);
    return timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  }
}

export default new TaskService();