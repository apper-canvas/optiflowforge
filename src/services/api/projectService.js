import projectData from '../mockData/project.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ProjectService {
  async getAll() {
    await delay(300)
    return [...projectData]
  }

  async getById(id) {
    await delay(200)
    const project = projectData.find(p => p.id === id)
    return project ? { ...project } : null
  }

  async create(project) {
    await delay(400)
    const newProject = {
      ...project,
      id: `project_${Date.now()}`,
      progress: 0,
      teamMembers: project.teamMembers || []
    }
    projectData.push(newProject)
    return { ...newProject }
  }

  async update(id, data) {
    await delay(350)
    const index = projectData.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Project not found')
    
    projectData[index] = { ...projectData[index], ...data }
    return { ...projectData[index] }
  }

  async delete(id) {
    await delay(250)
    const index = projectData.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Project not found')
    
    const deleted = projectData.splice(index, 1)[0]
    return { ...deleted }
  }
}

export default new ProjectService()