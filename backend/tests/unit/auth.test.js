const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('../../src/routes/authRoutes');
const prisma = require('../../src/models/prismaClient');

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message });
});

describe('Auth Registration Security', () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User'
  };

  afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany({ where: { email: { contains: 'test_' } } });
  });

  it('should register a new user as USER role by default', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('USER');

    const dbUser = await prisma.user.findUnique({ where: { email: testUser.email } });
    expect(dbUser.role).toBe('USER');
  });

  it('should strictly disallow passing a role field in registration', async () => {
    const maliciousUser = {
      ...testUser,
      email: `malicious_${Date.now()}@example.com`,
      role: 'ADMIN'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(maliciousUser);

    // Joi should throw a 400 Bad Request if role is present
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    
    const dbUser = await prisma.user.findUnique({ where: { email: maliciousUser.email } });
    expect(dbUser).toBeNull();
  });
});
