import { Controller, HttpRequest, HttpResponse } from '../../protocols';
import { badRequest } from '../../helpers/http-helper';
import { InvalidParamError, MissingParamError } from '../../errors';
import { EmailValidator } from '../signup/signup-protocols';


export class LoginController implements Controller {

    private readonly emailValidator;

    constructor(emailValidator: EmailValidator){
        this.emailValidator = emailValidator;
    }

    async handle(httpRequest: HttpRequest): Promise<HttpResponse>{
        if (!httpRequest.body.password){
            return badRequest(new MissingParamError('password'));
        }

        if (!httpRequest.body.email){
            return badRequest(new MissingParamError('email'));
        }

        const isValid = this.emailValidator.isValid(httpRequest.body.email);
        if (!isValid){
            return badRequest(new InvalidParamError('email'));
        }
    }
}