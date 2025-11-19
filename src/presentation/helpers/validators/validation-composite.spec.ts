import { MissingParamError } from "../../errors";
import { Validation } from "./validation";
import { ValidationComposite } from "./validation-composite";

describe('Validation composite', () => {

    interface SutTypes {
        sut: ValidationComposite,
        validationStub: Validation
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
        const validationStub = makeValidation();
        return {
            sut: new ValidationComposite([validationStub]),
            validationStub
        }
    }

    test('Should return an error if any validation fails', () => {
        const { sut, validationStub } = makeSut();
        jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('field'))
        const error = sut.validate({ field: 'any_value' });
        expect(error).toEqual(new MissingParamError('field'));
    });

});