import { validationPartialTask, validationTask } from "../schemas/task.js"

export class TasksController {

  constructor({ TaskModel }) {
    this.taskModel = TaskModel
  }

  getAll = async (req, res) => {
    const { status, pages, items } = req.query
    const tasks = await this.taskModel.getAll({ status, pages, items })
    if (tasks) return res.json(tasks)
    res.status(404).json({ message: "Task not found" })
  }

  getById = async (req, res) => {
    const { id } = req.params
    const task = await this.taskModel.getById({ id })
    if (task) return res.json(task)
    res.status(404).json({ message: "Task not found" })
  }

  createTask = async (req, res) => {
    const result = validationTask(req.body)

    if (!result.success) {
      return res.status(400).json({ message: JSON.parse(result.error.message) })
    }
    const newTask = await this.taskModel.create({ input: result.data })
    res.status(201).json(newTask)
  }

  updateTask = async (req, res) => {
    const updatedData = validationPartialTask(req.body)
    if (!updatedData.success) return res.status(400).json({ error: JSON.parse(updatedData.error) })
    const { id } = req.params
    const updatedTask = await this.taskModel.update({ input: updatedData.data, id })
    if (updatedTask === false) return res.status(404).json({ mesagge: "Task not found" })
    res.json(updatedTask)
  }

  deleteTask = async (req, res) => {
    const { id } = req.params
    const isDeletedTask = await this.taskModel.delete({ id })
    if (!isDeletedTask) return res.json({ mesagge: "task not found" })
    res.json({ mesagge: "task deleted" })
  }
}