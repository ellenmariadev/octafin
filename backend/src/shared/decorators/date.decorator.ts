import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { isValidBirthDate } from "@/shared/utils/date";

@ValidatorConstraint({ name: "isValidBirthDate", async: false })
export class IsValidBirthDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isValidBirthDate(value);
  }

  defaultMessage(): string {
    return "data de nascimento inválida";
  }
}

export function IsValidBirthDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: "isValidBirthDate",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidBirthDateConstraint,
    });
  };
}
