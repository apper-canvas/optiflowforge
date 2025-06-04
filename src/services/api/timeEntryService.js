import timeEntryData from '../mockData/timeEntry.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class TimeEntryService {
  constructor() {
    this.activeTimers = new Map() // Store active timers in memory
  }

  async getAll() {
    await delay(300)
    return [...timeEntryData]
  }

  async getById(id) {
    await delay(200)
    const entry = timeEntryData.find(e => e.id === id)
    return entry ? { ...entry } : null
  }

  async getByTaskId(taskId) {
    await delay(250)
    return timeEntryData.filter(e => e.taskId === taskId).map(e => ({ ...e }))
  }

  async getByProjectId(projectId) {
    await delay(250)
    return timeEntryData.filter(e => e.projectId === projectId).map(e => ({ ...e }))
  }

  async getByUserId(userId) {
    await delay(250)
    return timeEntryData.filter(e => e.userId === userId).map(e => ({ ...e }))
  }

  async create(entry) {
    await delay(400)
    const newEntry = {
      ...entry,
      id: `time_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    timeEntryData.push(newEntry)
    return { ...newEntry }
  }

  async update(id, data) {
    await delay(350)
    const index = timeEntryData.findIndex(e => e.id === id)
    if (index === -1) throw new Error('Time entry not found')
    
    timeEntryData[index] = { 
      ...timeEntryData[index], 
      ...data, 
      updatedAt: new Date().toISOString() 
    }
    return { ...timeEntryData[index] }
  }

  async delete(id) {
    await delay(250)
    const index = timeEntryData.findIndex(e => e.id === id)
    if (index === -1) throw new Error('Time entry not found')
    
    const deleted = timeEntryData.splice(index, 1)[0]
    return { ...deleted }
  }

  async startTimer(taskId, userId, projectId) {
    const timerId = `${taskId}_${userId}`
    
    if (this.activeTimers.has(timerId)) {
      throw new Error('Timer already running for this task')
    }

    const timerEntry = {
      taskId,
      userId,
      projectId,
      startTime: new Date().toISOString(),
      isActive: true
    }

    this.activeTimers.set(timerId, timerEntry)
    return timerEntry
  }

  async stopTimer(taskId, userId, description = '') {
    const timerId = `${taskId}_${userId}`
    const timer = this.activeTimers.get(timerId)
    
    if (!timer) {
      throw new Error('No active timer found for this task')
    }

    const endTime = new Date()
    const startTime = new Date(timer.startTime)
    const duration = Math.round((endTime - startTime) / 1000) // Duration in seconds

    const timeEntry = await this.create({
      taskId: timer.taskId,
      userId: timer.userId,
      projectId: timer.projectId,
      startTime: timer.startTime,
      endTime: endTime.toISOString(),
      duration,
      description
    })

    this.activeTimers.delete(timerId)
    return timeEntry
  }

  getActiveTimer(taskId, userId) {
    const timerId = `${taskId}_${userId}`
    return this.activeTimers.get(timerId) || null
  }
}

export default new TimeEntryService()