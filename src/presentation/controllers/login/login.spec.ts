import { LoginController } from "./login";
import { badRequest, ok, serverError, unauthorized } from '../../helpers/http/http-helper'
import { MissingParamError } from "../../errors";
import { HttpRequest, Authentication, AuthenticationModel } from "./login-protocols";
import { Validation } from "../login/login-protocols";

interface SutTypes {
    sut: LoginController,
    authenticationStub: Authentication,
    validationStub: Validation

}

const makeAuthentication = (): Authentication => {
    class AuthenticationStub implements Authentication {
        async auth(authentication: AuthenticationModel): Promise<string> {
            return 'any_token';
        }
    }
    return new AuthenticationStub();
}

const makeValidation = (): Validation => {
    class ValidationStub implements Validation {
        validate(input: any): Error {
            return null;
        }
    }

    return new ValidationStub();
}

const makeFakeRequest = (): HttpRequest => {
    return {
        body: {
            email: 'any_email@email.com',
            password: 'any_password'
        }
    }
}

const makeSut = (): SutTypes => {
    const validationStub = makeValidation();
    const authenticationStub = makeAuthentication();
    const sut = new LoginController(authenticationStub, validationStub);
    return {
        sut,
        validationStub,
        authenticationStub
    }
}

describe('Login controller',  () => {
    test('Should call authentication validator with correct values', async () => {
        const { sut, authenticationStub } = makeSut();
        const authSpy = jest.spyOn(authenticationStub, 'auth');
        const fakeRequest = makeFakeRequest();
        await sut.handle(fakeRequest);
        expect(authSpy).toHaveBeenCalledWith({
            email: 'any_email@email.com',
            password: 'any_password'
        });
    });

    test('Should return 401 if invalid credentials are provided', async () => {
        const { sut, authenticationStub } = makeSut();
        jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(new Promise(resolve => resolve(null)));
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(unauthorized());
    });

    test('Should return 500 if email authentication throws', async () => {
        const { sut, authenticationStub } = makeSut();
        jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())));
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(serverError(new Error()));
    });

    test('Should return 200 if valid credentials are provided', async () => {
        const { sut, authenticationStub } = makeSut();
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(ok({accessToken: 'any_token'}));
    });

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


})