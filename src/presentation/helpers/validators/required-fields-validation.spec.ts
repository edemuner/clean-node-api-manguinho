import { MissingParamError } from "../../errors";
import { RequiredFieldValidation } from "./required-field-validation";

describe('RequiredFields Validation', () => {

    const makeSut = (): RequiredFieldValidation => {
        return new RequiredFieldValidation('any_field');
    }

    test('Should return a MissingParamError if validation fails', () => {
        const sut = makeSut();
        const error = sut.validate({ name: 'any_name'});
        expect(error).toEqual(new MissingParamError('any_field'));
    });

    test('Should not return if validation succeeds', () => {
        const sut = makeSut();
        const error = sut.validate({ any_field: 'content'});
        expect(error).toBeFalsy();
    });

});