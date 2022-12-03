const Todo = require('../models/Todo.js');

module.exports = async (req, res, next) => {
  try {
    const todo = await Todo.getById(req.params.id);
    if (todo && (todo.user_id === req.user.id || req.user.email === 'admin')) {
      next();
    } else {
      throw new Error('ACCESS DENIED');
    }
  } catch (err) {
    err.status = 403;
    next(err);
  }
};
