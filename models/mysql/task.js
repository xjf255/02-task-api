import mysql from "mysql2/promise"
// import fs from "node:fs"


const DEFAULT_CONFIG = {
  host: "localhost",
  user: "root",
  port: 3306,
  password: "devF255!",
  database: "tasksdb"
}

/* 
 another method to connect with database
 const caCert = fs.readFileSync(process.env.DB_CERTIFICATE, 'utf-8');
 const DB_CONFIG = {
//   host: process.env.DB_HOST,
//   user: process.env.DB_USERNAME,
//   port: process.env.DB_PORT,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   ssl: {
//     ca: caCert, 
//   },
 }*/

const connectionString = process.env.DB_URL ?? DEFAULT_CONFIG

const connection = await mysql.createConnection(connectionString)

export class TaskModel {
  static async getAll({ status, pages, items, numPages }) {
    const NUM_ITEMS = parseInt(items ?? 5, 10);
    if (status) {
      const loweStatus = status.toLowerCase()
      const [statusus] = await connection.query('select * from statuses where lower(status) = ?;', [loweStatus])
      if (statusus.length === 0) {
        return []
      }

      const { id } = statusus[0]
      const [filteredTasks] = await connection.query('select BIN_TO_UUID(id) id, name, description, icon, status_id from tasks where status_id = ?;', [id])
      return filteredTasks
    }

    if (pages) {
      const offset = (parseInt(pages, 10) - 1) * NUM_ITEMS
      const [paginationTasks] = await connection.query(
        'SELECT BIN_TO_UUID(id) AS id, name, description, icon, status_id FROM tasks LIMIT ? OFFSET ?;',
        [NUM_ITEMS, offset]
      );

      if (paginationTasks.length > 0) {
        return paginationTasks;
      }
      return { message: "No tasks found" };
    }

    if (numPages) {
      const [tasks] = await connection.query('select BIN_TO_UUID(id) id, name, description, icon, status_id from tasks;')
      const totalPages = Math.ceil(tasks.length / NUM_ITEMS);

      return { numPages: totalPages };
    }

    const [tasks] = await connection.query('select BIN_TO_UUID(id) id, name, description, icon, status_id from tasks;')
    return tasks
  }

  static async getById({ id }) {
    const [task] = await connection.query('select BIN_TO_UUID(id) id, name, description, icon, status_id from tasks where id = UUID_TO_BIN(?);', [id])
    if (task === 0) return []
    return task
  }

  static async create({ input }) {
    const {
      name,
      description,
      icon,
      status
    } = input

    const [idStatus] = await connection.query('select id from statuses where lower(status) = ?;', [status.toLowerCase()])
    const { id } = idStatus[0]
    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(`INSERT INTO tasks (id, name, description, icon, status_id) VALUES (UUID_TO_BIN("${uuid}"),?,?,?,?);`, [name, description, icon, id])
    } catch (e) {
      throw new Error("error creating task")
    }

    const task = this.getById({ id: uuid })
    return task
  }

  static async update({ input, id }) {
    const { name, description, icon, status } = input;

    // Fetch the current task
    const currentTask = await this.getById({ id });
    if (!currentTask) {
      throw new Error(`Task with ID ${id} not found`);
    }
    const {
      name: currentName,
      description: currentDescription,
      icon: currentIcon,
      status_id: currentStatusId,
    } = currentTask[0];

    let newStatusId = currentStatusId;

    if (status) {
      const [statusIdResult] = await connection.query(
        'SELECT id FROM statuses WHERE LOWER(status) = ?;',
        [status.toLowerCase()]
      );
      if (!statusIdResult || statusIdResult.length === 0) {
        throw new Error(`Invalid status provided: ${status}`);
      }
      newStatusId = statusIdResult[0].id;
    }

    try {
      await connection.query(
        `UPDATE tasks SET name = ?, description = ?, icon = ?, status_id = ? WHERE id = UUID_TO_BIN(?);`,
        [
          name || currentName,
          description || currentDescription,
          icon || currentIcon,
          newStatusId,
          id,
        ]
      );
    } catch (error) {
      throw new Error(`Error updating task with ID ${id}: ${error.message}`);
    }

    // Return the updated task
    return await this.getById({ id });
  }


  static async delete({ id }) {
    const [remove, info] = await connection.query('delete from tasks where id = UUID_TO_BIN(?);', [id])
    const { affectedrows } = remove
    return true
  }
}