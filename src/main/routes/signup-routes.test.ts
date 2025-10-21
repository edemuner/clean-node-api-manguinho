import request from 'supertest';
import app from '../config/app';

describe('Signup routes', () => {

    test('should return an account on success', async () => {
        await request(app)
            .post('/api/signup')
            .send({
                name: 'eduardo', 
                email: 'eduardo@email.com',
                password: '123456',
                passwordConfirmation: '123456'
            })
            .expect(200)
    })
})