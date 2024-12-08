import { randomUUID } from "crypto"
import { readJSON } from "../../util.js"
const INITIAL_TASKS = readJSON("./tasks.json")

export class TaskModel {
  static async getAll({ status, pages, items }) {
    if (status) {
      return INITIAL_TASKS.filter(task => task.status.toLowerCase() === status.toLowerCase())
    }
    if (pages) {
      const NUM_ITEMS = items ?? 2
      return INITIAL_TASKS.slice(NUM_ITEMS * (pages - 1), NUM_ITEMS * pages)
    }
    return INITIAL_TASKS
  }

  static async getById({ id }) {
    if (id) {
      return INITIAL_TASKS.find(task => task.id === id)
    }
  }

  static async create({ input }) {
    const newTask = {
      "id": randomUUID(),
      ...input
    }
    INITIAL_TASKS.push(newTask)
    return newTask
  }

  static async update({ input, id }) {
    const indexTask = INITIAL_TASKS.findIndex(task => task.id === id)
    if (indexTask === -1) return false

    const updatedTask = {
      ...INITIAL_TASKS[indexTask],
      ...input
    }

    INITIAL_TASKS[indexTask] = updatedTask
    return updatedTask
  }

  static async delete({ id }) {
    const indexTask = INITIAL_TASKS.findIndex(task => task.id === id)
    if (indexTask === -1) return false
    INITIAL_TASKS.splice(indexTask, 1)
    return true
  }
}