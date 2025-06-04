class ProjectService {
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
        'ModifiedOn', 'ModifiedBy', 'status', 'progress', 'team_members'
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

      const response = await this.apperClient.fetchRecords('project', params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const tableFields = [
        'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
        'ModifiedOn', 'ModifiedBy', 'status', 'progress', 'team_members'
      ];
      
      const params = {
        fields: tableFields
      };

      const response = await this.apperClient.getRecordById('project', id, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      return null;
    }
  }

  async create(project) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Filter to only include Updateable fields
      const createData = {
        Name: project.name || project.Name,
        Tags: project.tags || project.Tags || '',
        Owner: project.owner || project.Owner,
        status: project.status || 'active',
        progress: project.progress || 0,
        team_members: project.teamMembers || project.team_members || ''
      };

      const params = {
        records: [createData]
      };

      const response = await this.apperClient.createRecord('project', params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }
      
      throw new Error('Failed to create project');
    } catch (error) {
      console.error('Error creating project:', error);
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
        ...(data.status !== undefined && { status: data.status }),
        ...(data.progress !== undefined && { progress: data.progress }),
        ...(data.teamMembers !== undefined && { team_members: data.teamMembers }),
        ...(data.team_members !== undefined && { team_members: data.team_members })
      };

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord('project', params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }
      
      throw new Error('Failed to update project');
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord('project', params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
}

export default new ProjectService();