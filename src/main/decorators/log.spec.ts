import { Controller, HttpRequest, HttpResponse } from "../../presentation/protocols";
import { LogControllerDecorator } from "./log";
import { serverError, ok } from '../../presentation/helpers/http/http-helper';
import { LogErrorRepository } from "../../data/protocols/db/log-error-repository";
import { AccountModel } from "../../domain/models/account";


const makeController = (): Controller => {
    class ControllerStub implements Controller {

        async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
            return new Promise(resolve => resolve(ok(makeFakeAccount())));
        }
    }

    return new ControllerStub();
}

const makeLogErrorRepository = (): LogErrorRepository => {
    class LogErrorRepositoryStub implements LogErrorRepository {
        async logError(stack: string): Promise<void> {
            return new Promise(resolve => resolve(null));
        }
    }

    return new LogErrorRepositoryStub();
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

const makeFakeServerError = (): HttpResponse => {
    const fakeError = new Error();
    fakeError.stack = 'any_stack';
    const error = serverError(fakeError);
    return error;

}
interface SutTypes {
    sut: LogControllerDecorator,
    controllerStub: Controller,
    logErrorRepositoryStub: LogErrorRepository
}

const makeSut = (): SutTypes => {
    const logErrorRepositoryStub = makeLogErrorRepository();
    const controllerStub = makeController();
    const sut = new LogControllerDecorator(controllerStub, logErrorRepositoryStub);
    return {
        sut,
        controllerStub,
        logErrorRepositoryStub
    }
}


describe('LogController decorator', () => {    
    test('should call controller handle', async () => {

        const { sut, controllerStub } = makeSut();
        const handleSpy = jest.spyOn(controllerStub, 'handle');

        const httpRequest = makeFakeRequest();
        await sut.handle(httpRequest);
        expect(handleSpy).toHaveBeenCalledWith(httpRequest);
    });

    test('should return the same result of the controller', async () => {

        const { sut } = makeSut();
        const httpRequest = {
            body: {
                email: 'any_email@email.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse).toEqual(ok(makeFakeAccount()));
    });

    test('should call LogErrorRepository with correct error if controller returns a server error', async () => {

        const { sut, controllerStub, logErrorRepositoryStub } = makeSut();
        const logSpy = jest.spyOn(logErrorRepositoryStub, 'logError');
        jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeServerError())));
        const httpRequest = makeFakeRequest();
        await sut.handle(httpRequest);
        expect(logSpy).toHaveBeenCalledWith('any_stack');
    });

})