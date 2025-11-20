import { SignUpController } from "./signup";
import { MissingParamError, ServerError } from '../../errors';
import { AccountModel, AddAccount, AddAccountModel, HttpRequest, Validation } from "./signup-protocols";
import { ok, serverError, badRequest } from '../../helpers/http/http-helper';

interface SutTypes {
    sut: SignUpController,
    addAccountStub: AddAccount,
    validationStub: Validation
}

const makeAddAccount = (): AddAccount => {
    class AddAccountStub implements AddAccount {
        async add(account: AddAccountModel): Promise<AccountModel> {
            const fakeAccount = makeFakeAccount();
            return new Promise(resolve => resolve(fakeAccount));
        }
    }

    return new AddAccountStub();
}

const makeValidation = (): Validation => {
    class ValidationStub implements Validation {
        validate(input: any): Error {
            return null;
        }
    }

    return new ValidationStub();
}

const makeSut = (): SutTypes => {

    const addAccountStub = makeAddAccount();
    const validationStub = makeValidation();

    const sut = new SignUpController(addAccountStub, validationStub);
    return {
        sut,
        addAccountStub,
        validationStub
    }
}

const makeFakeRequest = (): HttpRequest => {
    return {
        body: {
            name: 'any_name',
            email: 'any_email@email.com',
            password: 'any_password',
            passwordConfirmation: 'any_password'
        }
    }
}

const makeFakeAccount = (): AccountModel => {
    return {
        id: 'validId',
        name: 'validName',
        email: 'validEmail@email.com',
        password: 'valid_password'
    }
}

describe('Signup Controller', () => {

    test('should return 500 if AddAccount throws', async () => {
    
        const { sut, addAccountStub } = makeSut();
        jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
            return new Promise((resolve, reject) => reject(new Error()));
        })
    
        const httpRequest = makeFakeRequest();
        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(serverError(new ServerError()))
    })

    test('should call AddAccount with correct values', async () => {
        const { sut, addAccountStub } = makeSut();
        const addSpy = jest.spyOn(addAccountStub, 'add');
        const httpRequest = makeFakeRequest();
        await sut.handle(httpRequest);
        expect(addSpy).toHaveBeenCalledWith({
            name: 'any_name',
            email: 'any_email@email.com',
            password: 'any_password',
        });
    })

    test('should return 200 if valid data is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = makeFakeRequest();
        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(ok(makeFakeAccount()));
    })

    test('should call Validation with correct values', async () => {
        const { sut, validationStub } = makeSut();
        const validateSpy = jest.spyOn(validationStub, 'validate');
        const httpRequest = makeFakeRequest();
        await sut.handle(httpRequest);
        expect(validateSpy).toHaveBeenCalledWith(httpRequest.body);
    })

    test('should return 400 if validation returns an error', async () => {
        const { sut, validationStub } = makeSut();
        jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'));
        const httpRequest = makeFakeRequest();
        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')));
    })


});