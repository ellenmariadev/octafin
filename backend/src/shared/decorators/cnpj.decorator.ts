import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { isValidCnpj } from "@/shared/utils/cnpj";

@ValidatorConstraint({ name: "isValidCnpj", async: false })
export class IsValidCnpjConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === "string" && isValidCnpj(value);
  }

  defaultMessage(): string {
    return "cnpj inválido";
  }
}

export function IsValidCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: "isValidCnpj",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidCnpjConstraint,
    });
  };
}
