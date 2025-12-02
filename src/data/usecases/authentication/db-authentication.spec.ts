import { 
    AccountModel,
    AuthenticationModel,
    DbAuthentication,
    HashComparer, 
    Encrypter, 
    UpdateAccessTokenRepository, 
    LoadAccountByEmailRepository 
} from "./db-authentication-protocols";


const makeFakeAccount = (): AccountModel => {
    return {
        id: 'any_id',
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'hashed_password'
    }
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
    class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
        async load(email: string): Promise<AccountModel> {
            const account: AccountModel = makeFakeAccount();
            return new Promise(resolve => resolve(account));
        }
    }
    return new LoadAccountByEmailRepositoryStub();
}

const makeHashComparer = (): HashComparer => {
    class HashComparerStub implements HashComparer {
        async compare(value: string, hash:string): Promise<boolean> {
            return new Promise(resolve => resolve(true));
        }
    }
    return new HashComparerStub();
}

const makeEncrypter = (): Encrypter => {
    class EncrypterStub implements Encrypter {
        async encrypt (value: string): Promise<string> {
            return new Promise(resolve => resolve('any_token'));
        }
    }
    return new EncrypterStub();
}

const makeUpdateAccessTokenRepository = (): UpdateAccessTokenRepository => {
    class UpdateAccessTokenRepositoryStub implements UpdateAccessTokenRepository {
        async update (id: string, token: string): Promise<void> {
            return new Promise(resolve => resolve());
        }
    }
    return new UpdateAccessTokenRepositoryStub();
}


const makeFakeAuthentication = (): AuthenticationModel => {
    return {
        email: 'any_email@email.com',
        password: 'any_password'
    }
}

interface SutTypes {
    sut: DbAuthentication,
    loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
    hashComparerStub: HashComparer,
    EncrypterStub: Encrypter,
    updateAccessTokenRepositoryStub : UpdateAccessTokenRepository
}

const makeSut = (): SutTypes => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
    const hashComparerStub = makeHashComparer();
    const EncrypterStub = makeEncrypter();
    const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepository();
    const sut = new DbAuthentication(loadAccountByEmailRepositoryStub, hashComparerStub, EncrypterStub, updateAccessTokenRepositoryStub);
    return {
        sut,
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        EncrypterStub,
        updateAccessTokenRepositoryStub
    }
}

describe('DbAuthentication Usecase', () => {

    test('Should call LoadAccountByEmailRepository with correct email', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load');
        await sut.auth(makeFakeAuthentication());
        expect(loadSpy).toHaveBeenCalledWith('any_email@email.com');
    });

    test('Should throw if LoadAccountByEmailRepository throws', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())));
        const promise = sut.auth(makeFakeAuthentication());
        expect(promise).rejects.toThrow();
    });

    test('Should return null if LoadAccountByEmailRepository returns null', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(null)
        const accessToken = await sut.auth(makeFakeAuthentication());
        expect(accessToken).toBe(null);
    });

    test('Should call HashComparer with correct values', async () => {
        const { sut, hashComparerStub } = makeSut();
        const compareSpy = jest.spyOn(hashComparerStub, 'compare');
        await sut.auth(makeFakeAuthentication());
        expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password');
    });

    test('Should throw if HashComparer throws', async () => {
        const { sut, hashComparerStub } = makeSut();
        jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())));
        const promise = sut.auth(makeFakeAuthentication());
        expect(promise).rejects.toThrow();
    });

    test('Should return null if HashComparer returns false', async () => {
        const { sut, hashComparerStub } = makeSut();
        jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(new Promise(resolve => resolve(false)));
        const accessToken = await sut.auth(makeFakeAuthentication());
        expect(accessToken).toBe(null);
    });

    test('Should call Encrypter with correct id', async () => {
        const { sut, EncrypterStub } = makeSut();
        const encryptSpy = jest.spyOn(EncrypterStub, 'encrypt');
        await sut.auth(makeFakeAuthentication());
        expect(encryptSpy).toHaveBeenCalledWith('any_id');
    });

    test('Should throw if Encrypter throws', async () => {
        const { sut, EncrypterStub } = makeSut();
        jest.spyOn(EncrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())));
        const promise = sut.auth(makeFakeAuthentication());
        expect(promise).rejects.toThrow();
    });

    test('Should return a token when authentication succeeds', async () => {
        const { sut } = makeSut();
        const accessToken = await sut.auth(makeFakeAuthentication());
        expect(accessToken).toBe('any_token');
    });

    test('Should call UpdateAccessTokenRepository with correct values', async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut();
        const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'update');
        await sut.auth(makeFakeAuthentication());
        expect(updateSpy).toHaveBeenCalledWith('any_id', 'any_token');
    });

    test('Should throw if UpdateAccessTokenRepository throws', async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut();
        jest.spyOn(updateAccessTokenRepositoryStub, 'update').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())));
        const promise = sut.auth(makeFakeAuthentication());
        expect(promise).rejects.toThrow();
    });

});