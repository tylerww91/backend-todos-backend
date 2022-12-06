const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
const Todo = require('../lib/models/Todo.js');

const mockUser = {
  email: 'test@example.com',
  password: '12345',
};

const mockUser2 = {
  email: 'example@test.com',
  password: '54321',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...mockUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};
//hope this works
describe('todos routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  afterAll(() => {
    pool.end();
  });

  it('POST /api/v1/todos should create a new todo as the current user', async () => {
    const [agent, user] = await registerAndLogin();
    const newTodo = { description: 'eat cheese' };
    const resp = await agent.post('/api/v1/todos').send(newTodo);
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({
      id: expect.any(String),
      description: newTodo.description,
      user_id: user.id,
      completed: false,
      created_at: expect.any(String),
    });
  });

  it('GET /api/v1/todos should return the current user a list of their todos', async () => {
    const [agent, user] = await registerAndLogin();
    const user2 = await UserService.create(mockUser2);
    const user1Todo = await Todo.insert({
      description: 'get this bread',
      user_id: user.id,
    });
    await Todo.insert({
      description: 'make some money',
      user_id: user2.id,
    });
    const resp = await agent.get('/api/v1/todos');
    expect(resp.status).toBe(200);
    expect(resp.body.length).toBe(1);
    expect(resp.body[0]).toEqual({
      ...user1Todo,
      id: expect.any(String),
      completed: false,
      created_at: expect.any(String),
    });
  });

  it('UPDATE /api/v1/todos/:id should update a todo marking it off as completed', async () => {
    const [agent, user] = await registerAndLogin();
    const todo = await Todo.insert({
      description: 'buy milk',
      user_id: user.id,
    });

    const resp = await agent
      .put(`/api/v1/todos/${todo.id}`)
      .send({ completed: true });
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({
      ...todo,
      completed: true,
      created_at: expect.any(String),
      user_id: user.id,
    });
  });

  it('UPDATE /api/v1/todos/:id should return a 403 if a user attempts to update a todo that is not theirs', async () => {
    const [agent] = await registerAndLogin();
    const user2 = await UserService.create(mockUser2);
    const user2Todo = await Todo.insert({
      description: 'get this bread',
      user_id: user2.id,
    });
    const resp = await agent
      .put(`/api/v1/todos/${user2Todo.id}`)
      .send({ completed: true });
    expect(resp.status).toBe(403);
  });

  it('DELETE /api/v1/todos/:id should delete a todo for from the users todo list if they are authenticated/authorized', async () => {
    const [agent, user] = await registerAndLogin();
    const todo = await Todo.insert({
      description: 'drink milk',
      user_id: user.id,
    });

    await agent.post('/api/v1/todos').send(todo);
    const resp = await agent.delete(`/api/v1/todos/${todo.id}`);
    expect(resp.status).toBe(200);

    const newResp = await agent.get(`/api/v1/todos/${todo.id}`);
    expect(newResp.status).toBe(404);
  });
});
