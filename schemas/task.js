import z from 'zod'

const taskSchema = z.object({
  name: z.string().max(120),
  description: z.string().max(250).nullable(),
  icon: z.string().url(),
  status: z.enum(["Completed", "In Progress", "Won´t do"])
})

function validationTask(object) {
  return taskSchema.safeParse(object)
}

function validationPartialTask(object) {
  return taskSchema.partial().safeParse(object)
}

export { validationPartialTask, validationTask }