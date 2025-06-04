class UserService {
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
        'ModifiedOn', 'ModifiedBy', 'email', 'avatar'
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

      const response = await this.apperClient.fetchRecords('User1', params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const tableFields = [
        'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
        'ModifiedOn', 'ModifiedBy', 'email', 'avatar'
      ];
      
      const params = {
        fields: tableFields
      };

      const response = await this.apperClient.getRecordById('User1', id, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      return null;
    }
  }

  async create(user) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Filter to only include Updateable fields
      const createData = {
        Name: user.name || user.Name,
        Tags: user.tags || user.Tags || '',
        Owner: user.owner || user.Owner,
        email: user.email,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      };

      const params = {
        records: [createData]
      };

      const response = await this.apperClient.createRecord('User1', params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }
      
      throw new Error('Failed to create user');
    } catch (error) {
      console.error('Error creating user:', error);
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
        ...(data.email !== undefined && { email: data.email }),
        ...(data.avatar !== undefined && { avatar: data.avatar })
      };

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord('User1', params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }
      
      throw new Error('Failed to update user');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord('User1', params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUserTimeEntries(userId) {
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
      console.error('Error fetching time entries for user:', error);
      return [];
    }
  }

  async getUserTotalTime(userId, dateRange = null) {
    const timeEntries = await this.getUserTimeEntries(userId);
    let filteredEntries = timeEntries;
    
    if (dateRange) {
      filteredEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.start_time);
        return entryDate >= dateRange.start && entryDate <= dateRange.end;
      });
    }
    
    return filteredEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  }
}

export default new UserService();