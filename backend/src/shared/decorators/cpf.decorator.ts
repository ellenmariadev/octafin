import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { isValidCpf } from "@/shared/utils/cpf";

@ValidatorConstraint({ name: "isValidCpf", async: false })
export class IsValidCpfConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === "string" && isValidCpf(value);
  }

  defaultMessage(): string {
    return "cpf inválido";
  }
}

export function IsValidCpf(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: "isValidCpf",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidCpfConstraint,
    });
  };
}
