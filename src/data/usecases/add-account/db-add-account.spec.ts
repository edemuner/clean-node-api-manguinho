import { DbAddAccount } from './db-add-account'

describe('DbAddAccount Usecase', () => {
    
    test('should call Encrypter with correct password', async () => {
        class EncrypterStub {
            async encrypt(value: string): Promise<string>{
                return  new Promise(resolve => {
                    resolve('hashed_value');
                })
            }
        }

        const encrypterStub = new EncrypterStub();
        const sut = await new DbAddAccount(encrypterStub);
        const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');
        const accountData = {
            name:'valid_name',
            email:'valid_email',
            password:'valid_password'
        }
        sut.add(accountData);
        expect(encryptSpy).toHaveBeenCalledWith('valid_password');
    })
});