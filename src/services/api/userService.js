import userData from '../mockData/user.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class UserService {
  async getAll() {
    await delay(250)
    return [...userData]
  }

  async getById(id) {
    await delay(200)
    const user = userData.find(u => u.id === id)
    return user ? { ...user } : null
  }

  async create(user) {
    await delay(400)
    const newUser = {
      ...user,
      id: `user_${Date.now()}`,
      avatar: user.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`
    }
    userData.push(newUser)
    return { ...newUser }
  }

  async update(id, data) {
    await delay(350)
    const index = userData.findIndex(u => u.id === id)
    if (index === -1) throw new Error('User not found')
    
    userData[index] = { ...userData[index], ...data }
    return { ...userData[index] }
  }

  async delete(id) {
    await delay(250)
    const index = userData.findIndex(u => u.id === id)
    if (index === -1) throw new Error('User not found')
    
    const deleted = userData.splice(index, 1)[0]
    return { ...deleted }
  }
}

export default new UserService()