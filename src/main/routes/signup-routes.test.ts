import request from 'supertest';
import app from '../config/app';
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper';

describe('Signup routes', () => {

    beforeAll( async () => {
        await MongoHelper.connect(process.env.MONGO_URL);
    });

    afterAll( async () => {
        await MongoHelper.disconnect();
    });

    beforeEach(async () => {
        const accountsCollection = await MongoHelper.getCollection('accounts');
        await accountsCollection.deleteMany({});
    })


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