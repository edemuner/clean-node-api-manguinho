import { EmailValidatorAdapter } from "./email-validator-adapter";
import validator from 'validator';

jest.mock('validator', () => ({
    isEmail(): boolean {
        return true;
    }
}))

const makeSut = (): EmailValidatorAdapter => {
    return new EmailValidatorAdapter();
}

describe('EmailValidator Adapter', () => {
    test('should return false if validator returns false', () => {
        const sut = makeSut();
        jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false);
        const isValid = sut.isValid('invalid_email@email.com'); // email is purposely valid
        expect(isValid).toBe(false);
    });

    test('should return true if validator returns true', () => {
        const sut = makeSut();
        // this is what is implemented in the class, but IMO to follow the same pattern as above we should also mock validator return value
        // bc we're relying on validator lib behavior
        const isValid = sut.isValid('valid_email@mail.com');
        expect(isValid).toBe(true);
    })

    test('should call validator with correct email', () => {
        const sut = makeSut();
        const isEmailSpy = jest.spyOn(validator, 'isEmail');
        sut.isValid('any_email@email.com');
        expect(isEmailSpy).toHaveBeenCalledWith('any_email@email.com');
    })

})