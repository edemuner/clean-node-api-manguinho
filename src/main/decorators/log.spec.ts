import { Controller, HttpRequest, HttpResponse } from "../../presentation/protocols";
import { LogControllerDecorator } from "./log"

describe('LogController decorator', () => {
    
    test('should call controller handle', async () => {

        class ControllerStub implements Controller {
            httpResponse: HttpResponse = {
                statusCode: 200,
                body: {
                    'name':'eduardo'
                }
            }
    
            async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
                return new Promise(resolve => resolve(this.httpResponse));
            }
        }

        const controllerStub = new ControllerStub();
        const handleSpy = jest.spyOn(controllerStub, 'handle');
        const sut = new LogControllerDecorator(controllerStub);
        const httpRequest = {
            body: {
                email: 'any_email@email.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        await sut.handle(httpRequest);
        expect(handleSpy).toHaveBeenCalledWith(httpRequest);
    })
})