import { createRequire } from 'node:module'
// import { readFile } from 'node:fs'

// readFile("./tasks.json", "utf-8" ,(error,data) => {
//   if(error){
//     console.log(error)
//   }else{
//     console.log(data)
//   }
// })

const require = createRequire(import.meta.url)
export const readJSON = (path) => require(path)

export const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'https://taskslist-to-do.netlify.app/',
  'http://localhost:1234',
  'http://localhost:5173',
  'http://localhost:5174'
]