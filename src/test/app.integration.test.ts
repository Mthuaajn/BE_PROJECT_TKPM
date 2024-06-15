import request from 'supertest';
import app from '../../src/index';

describe('Integration Tests', () => {
  it('should return access server successfully from the API', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('You have accessed to this server successfully!');
  });
});
