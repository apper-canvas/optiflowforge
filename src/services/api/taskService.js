import taskData from '../mockData/task.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class TaskService {
  async getAll() {
    await delay(300)
    return [...taskData]
  }

  async getById(id) {
    await delay(200)
    const task = taskData.find(t => t.id === id)
    return task ? { ...task } : null
  }

  async create(task) {
    await delay(400)
    const newTask = {
      ...task,
      id: `task_${Date.now()}`,
      labels: task.labels || []
    }
    taskData.push(newTask)
    return { ...newTask }
  }

  async update(id, data) {
    await delay(350)
    const index = taskData.findIndex(t => t.id === id)
    if (index === -1) throw new Error('Task not found')
    
    taskData[index] = { ...taskData[index], ...data }
    return { ...taskData[index] }
  }

  async delete(id) {
    await delay(250)
    const index = taskData.findIndex(t => t.id === id)
    if (index === -1) throw new Error('Task not found')
    
    const deleted = taskData.splice(index, 1)[0]
    return { ...deleted }
}

  async getTimeEntries(taskId) {
    await delay(250)
    // This would typically call timeEntryService, but we'll simulate the data
    const timeEntryService = await import('./timeEntryService.js')
    return timeEntryService.default.getByTaskId(taskId)
  }

  async getTotalTime(taskId) {
    const timeEntries = await this.getTimeEntries(taskId)
    return timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0)
  }

  async getTasksWithTimeData() {
    await delay(350)
    const tasks = [...taskData]
    
    for (const task of tasks) {
      const timeEntries = await this.getTimeEntries(task.id)
      task.totalTime = timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0)
      task.timeEntries = timeEntries
    }
    
    return tasks
  }
}

export default new TaskService()