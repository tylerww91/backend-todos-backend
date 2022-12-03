const { Router } = require('express');
const Todo = require('../models/Todo');

module.exports = Router()
  .post('/', async (req, res, next) => {
    try {
      const todo = await Todo.insert({
        description: req.body.description,
        user_id: req.user.id,
      });
      res.json(todo);
    } catch (e) {
      next(e);
    }
  })

  .get('/', async (req, res, next) => {
    try {
      const todo = await Todo.getAll(req.user.id);
      res.json(todo);
    } catch (e) {
      next(e);
    }
  });
