import { Router } from "express"
import { TasksController } from "../controllers/tasks.js"

export const createTasksRouter = ({ TaskModel }) => {
  const tasksRouter = Router()
  const tasksController = new TasksController({ TaskModel })
  tasksRouter.get("/", tasksController.getAll)
  tasksRouter.get("/:id", tasksController.getById)
  tasksRouter.post("/", tasksController.createTask)
  tasksRouter.patch("/:id", tasksController.updateTask)
  tasksRouter.delete("/:id", tasksController.deleteTask)

  return tasksRouter
}