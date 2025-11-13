import { Controller, HttpRequest, HttpResponse } from '../../protocols';
import { badRequest, serverError } from '../../helpers/http-helper';
import { InvalidParamError, MissingParamError } from '../../errors';
import { EmailValidator } from '../signup/signup-protocols';


export class LoginController implements Controller {

    private readonly emailValidator;

    constructor(emailValidator: EmailValidator){
        this.emailValidator = emailValidator;
    }

    async handle(httpRequest: HttpRequest): Promise<HttpResponse>{

        try {
            const { email, password } = httpRequest.body;

            if (!password){
                return badRequest(new MissingParamError('password'));
            }
    
            if (!email){
                return badRequest(new MissingParamError('email'));
            }
    
            const isValid = this.emailValidator.isValid(email);
            if (!isValid){
                return badRequest(new InvalidParamError('email'));
            }    
        } catch(error){
            return serverError(error);
        }
    }
}