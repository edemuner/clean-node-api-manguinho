import { AddAccount } from '../../../domain/usecases/add-account';
import { Encrypter } from '../../protocols/encrypter';
import { DbAddAccount } from './db-add-account'

interface SutTypes {
    sut: DbAddAccount,
    encrypterStub: Encrypter
}

const makeEncrypter = (): Encrypter => {
    class EncrypterStub implements Encrypter {
        async encrypt(value: string): Promise<string>{
            return  new Promise(resolve => {
                resolve('hashed_value');
            })
        }
    }

    return new EncrypterStub();

}

const makeSut = (): SutTypes => {

    const encrypterStub = makeEncrypter();
    const sut = new DbAddAccount(encrypterStub);

    return { sut, encrypterStub }

}

describe('DbAddAccount Usecase', () => {

    const { sut, encrypterStub } = makeSut();

    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');
    const accountData = {
        name:'valid_name',
        email:'valid_email',
        password:'valid_password'
    }

    test('should call Encrypter with correct password', async () => {
        sut.add(accountData);
        expect(encryptSpy).toHaveBeenCalledWith('valid_password');
    })
});