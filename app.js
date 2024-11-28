import express, { json } from 'express'
import { createTasksRouter } from './routes/tasks.js'
import { corsMiddleware } from './middleware/cors.js'

export const createApp = ({ TaskModel }) => {
  const app = express()
  app.use(json())
  app.disable('x-powered-by')
  app.use(corsMiddleware())
  app.use("/tasks", createTasksRouter({ TaskModel }))

  const PORT = process.env.PORT ?? 1234

  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
  })
}

