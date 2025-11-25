import { LoadAccountByEmailRepository } from "../../../data/protocols/load-account-by-email-repository";
import { AccountModel } from "../../models/account";
import { AuthenticationModel } from "./authentication";
import { DbAuthentication } from "./db-authentication";

const makeFakeAccount = (): AccountModel => {
    return {
        id: 'any_id',
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password'
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

const makeFakeAuthentication = (): AuthenticationModel => {
    return {
        email: 'any_email@email.com',
        password: 'any_password'
    }
}

interface SutTypes {
    sut: DbAuthentication,
    loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
}

const makeSut = (): SutTypes => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
    const sut = new DbAuthentication(loadAccountByEmailRepositoryStub);
    return {
        sut,
        loadAccountByEmailRepositoryStub
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

});