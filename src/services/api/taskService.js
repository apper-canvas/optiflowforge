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
}

export default new TaskService()