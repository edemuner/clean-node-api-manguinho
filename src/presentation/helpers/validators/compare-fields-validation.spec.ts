import { InvalidParamError } from "../../errors";
import { CompareFieldsValidation } from "./compare-fields-validation";

describe('RequiredFields Validation', () => {

    const makeSut = (): CompareFieldsValidation => {
        return new CompareFieldsValidation('password', 'passwordConfirmation');
    }

    test('Should return a MissingParamError if validation fails', () => {
        const sut = makeSut();
        const error = sut.validate({ password: 'any_password', passwordConfirmation: 'different_password'});
        expect(error).toEqual(new InvalidParamError('passwordConfirmation'));
    });

    test('Should not return if validation succeeds', () => {
        const sut = makeSut();
        const error = sut.validate({ password: 'any_password', passwordConfirmation: 'any_password'});
        expect(error).toBeFalsy();
    });

});