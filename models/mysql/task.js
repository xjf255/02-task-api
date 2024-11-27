import mysql from "mysql2/promise"

const DEFAULT_CONFIG = {
  host: "localhost",
  user: "root",
  port: 3306,
  password: "devF255!",
  database: "tasksdb"
}

const connection = await mysql.createConnection(DEFAULT_CONFIG)

export class TaskModel {
  static async getAll({ status }) {
    if (status) {
      const loweStatus = status.toLowerCase()
      const [statusus] = await connection.query('select * from statuses where lower(status) = ?;', [loweStatus])
      console.log(statusus)
      if (statusus.length === 0) {
        return []
      }

      const { id } = statusus[0]
      const [filteredTasks] = await connection.query('select BIN_TO_UUID(id) id, name, description, icon, status_id from tasks where status_id = ?;', [id])
      return filteredTasks
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