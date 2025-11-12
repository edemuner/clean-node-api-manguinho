import { Controller, HttpRequest, HttpResponse } from '../../protocols';
import { badRequest } from '../../helpers/http-helper';
import { MissingParamError } from '../../errors';


export class LoginController implements Controller {

    async handle(httpRequest: HttpRequest): Promise<HttpResponse>{
        if (!httpRequest.body.password){
            return badRequest(new MissingParamError('password'));
        }

        if (!httpRequest.body.email){
            return badRequest(new MissingParamError('email'));
        }
    }
}