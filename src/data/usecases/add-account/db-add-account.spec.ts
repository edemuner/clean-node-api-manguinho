import { AccountModel, AddAccountModel, Hasher, AddAccountRepository } from './db-add-account-protocols';
import { DbAddAccount } from './db-add-account'


const makeHasher = (): Hasher => {
    class HasherStub implements Hasher {
        async hash(value: string): Promise<string>{
            return  new Promise(resolve => {
                resolve('hashed_password');
            })
        }
    }

    return new HasherStub();
}

const makeAddAccountRepository = (): AddAccountRepository => {
    class AddAccountRepositoryStub implements AddAccountRepository {
        async add(accountData: AddAccountModel): Promise<AccountModel>{
            const fakeAccount = makeFakeAccount();
            return  new Promise(resolve => {
                resolve(fakeAccount);
            })
        }
    }

    return new AddAccountRepositoryStub();
}

const makeFakeAccount = (): AccountModel => {
    return {
        id: 'validId',
        name: 'validName',
        email: 'validEmail@email.com',
        password: 'valid_password'
    }
}

const makeFakeAccountData = (): AddAccountModel => {
    return {
        name: 'validName',
        email: 'validEmail@email.com',
        password: 'valid_password'
    }
}


interface SutTypes {
    sut: DbAddAccount,
    hasherStub: Hasher,
    addAccountRepositoryStub: AddAccountRepository
}

const makeSut = (): SutTypes => {

    const hasherStub = makeHasher();
    const addAccountRepositoryStub = makeAddAccountRepository();
    const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub);

    return { sut, hasherStub, addAccountRepositoryStub }

}

describe('DbAddAccount Usecase', () => {


    test('should call Encrypter with correct password', async () => {
        const { sut, hasherStub } = makeSut();

        const hashSpy = jest.spyOn(hasherStub, 'hash');
        const accountData = {
            name:'valid_name',
            email:'valid_email',
            password:'valid_password'
        }    

        sut.add(accountData);
        expect(hashSpy).toHaveBeenCalledWith('valid_password');
    })

    test('should throw if Hasher throws', async () => {
        const { sut, hasherStub } = makeSut();
        jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(new Promise((resolve, reject) =>  reject(new Error())));

        const accountData = makeFakeAccountData();  

        const accountPromise = sut.add(accountData);
        await expect(accountPromise).rejects.toThrow();
    })

    test('should call AddAccountRepository with correct values', async () => {
        const { sut, addAccountRepositoryStub } = makeSut();

        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');
        const accountData = makeFakeAccountData();  

        await sut.add(accountData);
        expect(addSpy).toHaveBeenCalledWith({
            name: 'validName',
            email: 'validEmail@email.com',
            password: 'hashed_password'
        });
    })

    test('should throw if AddAccountRepository throws', async () => {
        const { sut, addAccountRepositoryStub } = makeSut();
        jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) =>  reject(new Error())));

        const accountData = makeFakeAccountData();  

        const accountPromise = sut.add(accountData);
        await expect(accountPromise).rejects.toThrow();
    })

    test('should return an account on success', async () => {
        const { sut } = makeSut();

        const accountData = makeFakeAccount();  

        const account = await sut.add(accountData);
        expect(account).toEqual(makeFakeAccount());
    })
});