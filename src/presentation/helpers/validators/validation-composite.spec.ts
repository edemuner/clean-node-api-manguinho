import { InvalidParamError, MissingParamError } from "../../errors";
import { Validation } from "./validation";
import { ValidationComposite } from "./validation-composite";

describe('Validation composite', () => {

    interface SutTypes {
        sut: ValidationComposite,
        validationStubs: Validation[]
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
        const validationStubs = [makeValidation(), makeValidation()];
        return {
            sut: new ValidationComposite(validationStubs),
            validationStubs
        }
    }

    test('Should return an error if any validation fails', () => {
        const { sut, validationStubs } = makeSut();
        jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(new MissingParamError('field'))
        const error = sut.validate({ field: 'any_value' });
        expect(error).toEqual(new MissingParamError('field'));
    });

    test('Should return the first error if more than one validation fails', () => {
        const { sut, validationStubs } = makeSut();
        jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(new MissingParamError('field'))
        jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(new InvalidParamError('field'))
        const error = sut.validate({ field: 'any_value' });
        expect(error).toEqual(new MissingParamError('field'));
    });


});