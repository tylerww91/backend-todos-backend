const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const mockUser = {
  email: 'test@example.com',
  password: '12345',
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
});
