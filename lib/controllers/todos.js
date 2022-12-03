const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const Todo = require('../models/Todo');

module.exports = Router().post('/', authenticate, async (req, res, next) => {
  try {
    const todo = await Todo.insert({
      description: req.body.description,
      user_id: req.user.id,
    });
    res.json(todo);
  } catch (e) {
    next(e);
  }
});
