import { LoadAccountByEmailRepository } from "../../../data/protocols/load-account-by-email-repository";
import { AccountModel } from "../../models/account";
import { DbAuthentication } from "./db-authentication";

describe('DbAuthentication Usecase', () => {

    test('Should call LoadAccountByEmailRepository with correct email', async () => {
        class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
            async load(email: string): Promise<AccountModel> {
                const account: AccountModel = {
                    id: 'any_id',
                    name: 'any_name',
                    email: 'any_email@email.com',
                    password: 'any_password'
                }
                return new Promise(resolve => resolve(account));
            }
        }
        const loadAccountByEmailRepositoryStub = new LoadAccountByEmailRepositoryStub();
        const sut = new DbAuthentication(loadAccountByEmailRepositoryStub);
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load');
        await sut.auth({
            email: 'any_email@email.com',
            password: 'any_password'
        });
        expect(loadSpy).toHaveBeenCalledWith('any_email@email.com');
    });
});