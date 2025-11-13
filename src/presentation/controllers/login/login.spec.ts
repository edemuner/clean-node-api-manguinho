import { LoginController } from "./login";
import { badRequest, serverError, unauthorized } from '../../helpers/http-helper'
import { InvalidParamError, MissingParamError } from "../../errors";
import { EmailValidator, HttpRequest } from "../signup/signup-protocols";
import { Authentication } from "../../../domain/usecases/authentication";

interface SutTypes {
    sut: LoginController,
    emailValidatorStub: EmailValidator,
    authenticationStub: Authentication
}

const makeAuthentication = (): Authentication => {
    class AuthenticationStub implements Authentication {
        async auth(email: string, password: string): Promise<string> {
            return 'any_token';
        }
    }
    return new AuthenticationStub();
}


const makeFakeRequest = (): HttpRequest => {
    return {
        body: {
            email: 'any_email@email.com',
            password: 'any_password'
        }
    }
}

const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }
    return new EmailValidatorStub();
}

const makeSut = (): SutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const authenticationStub = makeAuthentication();
    const sut = new LoginController(emailValidatorStub, authenticationStub);
    return {
        sut,
        emailValidatorStub,
        authenticationStub
    }
}

describe('Login controller',  () => {
    test('Shold return 400 if no email is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                password: 'any_password'
            }
        }
        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(badRequest(new MissingParamError('email')))
    });

    test('Shold return 400 if no password is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                email: 'any_email@email.com'
            }
        }
        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(badRequest(new MissingParamError('password')));
    });

    test('Shold call email validator with correct email', async () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');
        await sut.handle(makeFakeRequest());
        expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com');
    });

    test('Shold return 400 if an invalid email is provided', async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')));
    });

    test('Shold return 500 if email validator throws', async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
            throw new Error();
        });
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(serverError(new Error()));
    });

    test('Shold call authentication validator with correct values', async () => {
        const { sut, authenticationStub } = makeSut();
        const authSpy = jest.spyOn(authenticationStub, 'auth');
        const fakeRequest = makeFakeRequest();
        await sut.handle(fakeRequest);
        expect(authSpy).toHaveBeenCalledWith('any_email@email.com', 'any_password');
    });

    test('Shold return 401 if invalid credentials are provided', async () => {
        const { sut, authenticationStub } = makeSut();
        jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(new Promise(resolve => resolve(null)));
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(unauthorized());
    });
})