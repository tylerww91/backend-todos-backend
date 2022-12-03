const pool = require('../utils/pool');

module.exports = class Todo {
  id;
  user_id;
  description;
  completed;
  created_at;

  constructor(row) {
    this.id = row.id;
    this.user_id = row.user_id;
    this.description = row.description;
    this.completed = row.completed;
    this.created_at = row.created_at;
  }

  static async insert({ description, user_id }) {
    const { rows } = await pool.query(
      `
          INSERT INTO todos (description, user_id)
          VALUES ($1, $2)
          RETURNING *
          `,
      [description, user_id]
    );
    if (!rows[0]) return null;
    return new Todo(rows[0]);
  }
};
