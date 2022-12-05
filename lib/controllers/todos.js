const { Router } = require('express');
const todoAuth = require('../middleware/todoAuth.js');
// const todoAuth = require('../middleware/todoAuth.js');
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
  })

  .put('/:id', todoAuth, async (req, res, next) => {
    try {
      const todo = await Todo.updateById(req.params.id, req.body);
      console.log('blah', todo);
      res.json(todo);
    } catch (e) {
      next(e);
    }
  });
